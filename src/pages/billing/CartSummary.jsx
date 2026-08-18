import { useEffect, useState } from 'react'
import { Minus, Plus, Trash2, Wallet } from 'lucide-react'
import { apiPost } from '../../api/client'
import { formatINR } from '../../lib/format'
import { isValidEmail, isValidName, isValidPhone } from '../../lib/validate'

const GST_RATE = 0.05

export default function CartSummary({
  cart,
  subtotal,
  appliedCoupon,
  onCouponChange,
  manualDiscount,
  onManualDiscountChange,
  customer,
  onSetQty,
  onRemove,
  onProceed,
}) {
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState(null)
  const [applying, setApplying] = useState(false)

  // Re-validate the applied coupon whenever the subtotal changes
  useEffect(() => {
    if (!appliedCoupon) return
    if (cart.length === 0) {
      onCouponChange(null)
      return
    }
    apiPost('/coupons/validate', { code: appliedCoupon.code, subtotal })
      .then(onCouponChange)
      .catch((err) => {
        onCouponChange(null)
        setCouponError(err.message)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal])

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplying(true)
    setCouponError(null)
    try {
      const coupon = await apiPost('/coupons/validate', {
        code: couponInput.trim().toUpperCase(),
        subtotal,
      })
      onCouponChange(coupon)
      setCouponInput('')
    } catch (err) {
      setCouponError(err.message)
    } finally {
      setApplying(false)
    }
  }

  const couponAmount = appliedCoupon?.discountAmount ?? 0
  const afterCoupon = subtotal - couponAmount
  const manualPct = Math.min(Math.max(Number(manualDiscount || 0), 0), 100)
  const manualAmount = Math.round(afterCoupon * manualPct) / 100
  const taxable = afterCoupon - manualAmount
  const gst = Math.round(taxable * GST_RATE * 100) / 100
  const total = Math.round((taxable + gst) * 100) / 100

  const canGenerate =
    cart.length > 0 &&
    isValidPhone(customer.phone) &&
    isValidName(customer.name) &&
    isValidEmail(customer.email)

  return (
    <section className="rounded-xl border border-edge bg-panel">
      <div className="border-b border-edge px-5 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-dim">
          Cart Summary
        </h2>
      </div>

      <div className="p-5">
        {cart.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-dim">
            Cart is empty — add products from the list.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {cart.map(({ product, qty }) => (
              <li key={product.id} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{product.name}</div>
                  <div className="mt-0.5 text-xs text-ink-dim">
                    {product.size} · {product.colour}
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-edge">
                  <button
                    onClick={() => onSetQty(product.id, qty - 1)}
                    className="px-2 py-1 text-ink-dim hover:text-ink"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center text-sm">{qty}</span>
                  <button
                    onClick={() => onSetQty(product.id, qty + 1)}
                    disabled={qty >= product.stock}
                    className="px-2 py-1 text-ink-dim hover:text-ink disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <div className="w-20 text-right text-sm">{formatINR(product.price * qty)}</div>
                <button
                  onClick={() => onRemove(product.id)}
                  className="p-1 text-ink-dim hover:text-danger"
                  aria-label={`Remove ${product.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 border-t border-edge pt-5">
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
              <span className="text-sm">
                <span className="font-mono font-bold text-accent">{appliedCoupon.code}</span>{' '}
                <span className="text-ink-dim">applied</span>
              </span>
              <button
                onClick={() => onCouponChange(null)}
                className="text-xs text-ink-dim underline hover:text-danger"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value)
                  setCouponError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                placeholder="Have a coupon code?"
                className="min-w-0 flex-1 rounded-lg border border-edge bg-panel-2 px-3 py-2.5 font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case placeholder:text-ink-dim focus:border-accent focus:outline-none"
              />
              <button
                onClick={applyCoupon}
                disabled={applying || cart.length === 0}
                className="rounded-lg border border-edge bg-panel-2 px-4 py-2.5 text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {applying ? '…' : 'Apply'}
              </button>
            </div>
          )}
          {couponError && <p className="mt-2 text-xs text-danger">{couponError}</p>}

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-ink-dim">
              Manual Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={manualDiscount}
              onChange={(e) => onManualDiscountChange(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-edge bg-panel-2 px-3 py-2.5 text-sm placeholder:text-ink-dim focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <dl className="mt-5 flex flex-col gap-2 border-t border-edge pt-5 font-mono text-sm">
          <div className="flex justify-between">
            <dt className="font-sans text-ink-dim">Subtotal</dt>
            <dd>{formatINR(subtotal)}</dd>
          </div>
          {couponAmount > 0 && (
            <div className="flex justify-between text-accent">
              <dt className="font-sans">Coupon ({appliedCoupon.code})</dt>
              <dd>−{formatINR(couponAmount)}</dd>
            </div>
          )}
          {manualAmount > 0 && (
            <div className="flex justify-between text-accent">
              <dt className="font-sans">Manual Discount ({manualPct}%)</dt>
              <dd>−{formatINR(manualAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="font-sans text-ink-dim">GST (5%)</dt>
            <dd>{formatINR(gst)}</dd>
          </div>
          <div className="mt-1 flex justify-between border-t border-edge pt-3 text-base">
            <dt className="font-sans font-bold">Total</dt>
            <dd className="font-bold text-primary">{formatINR(total)}</dd>
          </div>
        </dl>

        <button
          onClick={() => onProceed(total)}
          disabled={!canGenerate}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Wallet size={16} />
          Proceed to Payment
        </button>
      </div>
    </section>
  )
}
