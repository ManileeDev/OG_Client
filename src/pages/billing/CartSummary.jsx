import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Minus, Plus, Trash2, Wallet } from 'lucide-react'
import { apiGet, apiPost } from '../../api/client'
import { formatINR } from '../../lib/format'
import { isValidEmail, isValidName, isValidPhone } from '../../lib/validate'
import Select from '../../components/Select'

function couponLabel(c) {
  const discount = c.type === 'percent' ? `${c.value}% off` : `${formatINR(c.value)} off`
  const min = c.minPurchase > 0 ? ` · min ${formatINR(c.minPurchase)}` : ''
  return `${c.code} · ${discount}${min}`
}

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
  onClear,
  gstEnabled,
  onGstChange,
  onProceed,
}) {
  const [couponError, setCouponError] = useState(null)
  const [applying, setApplying] = useState(false)
  const [manualDiscountRs, setManualDiscountRs] = useState('')

  const { data: allCoupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => apiGet('/coupons'),
  })
  const activeCoupons = allCoupons.filter((c) => c.status === 'active')

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

  const applyCoupon = async (code) => {
    setApplying(true)
    setCouponError(null)
    try {
      const coupon = await apiPost('/coupons/validate', { code, subtotal })
      onCouponChange(coupon)
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

  useEffect(() => {
    const amount = Math.round((afterCoupon * manualPct) / 100 * 100) / 100
    setManualDiscountRs(amount ? amount.toFixed(2) : '')
  }, [afterCoupon])

  const updateManualPercent = (value) => {
    const percent = Math.min(Math.max(Number(value || 0), 0), 100)
    onManualDiscountChange(value === '' ? '' : String(percent))
    const amount = Math.round((afterCoupon * percent) / 100 * 100) / 100
    setManualDiscountRs(amount ? amount.toFixed(2) : '')
  }

  const updateManualAmount = (value) => {
    const amount = Math.min(Math.max(Number(value || 0), 0), afterCoupon)
    setManualDiscountRs(value === '' ? '' : String(amount))
    const percent = afterCoupon ? (amount / afterCoupon) * 100 : 0
    onManualDiscountChange(percent ? percent.toFixed(2) : '')
  }

  // Prices are inclusive of all taxes; the discounted amount is the final total
  const total = Math.round((afterCoupon - manualAmount) * 100) / 100

  const canGenerate =
    cart.length > 0 &&
    isValidPhone(customer.phone) &&
    isValidName(customer.name) &&
    isValidEmail(customer.email)

  return (
    <section className="rounded-xl border border-edge bg-panel">
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-dim">
          Cart Summary
        </h2>
        {cart.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-ink-dim hover:text-danger"
          >
            <Trash2 size={13} /> Clear all
          </button>
        )}
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
                  <div className="truncate text-sm font-medium" title={product.name}>
                    {product.name}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-dim">
                    {[product.size, product.colour].filter(Boolean).join(' · ')}
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
            <Select
              value=""
              onChange={applyCoupon}
              options={activeCoupons.map((c) => ({ value: c.code, label: couponLabel(c) }))}
              placeholder={
                applying
                  ? 'Checking…'
                  : activeCoupons.length
                    ? 'Apply a coupon (optional)'
                    : 'No active coupons'
              }
              disabled={applying || cart.length === 0 || activeCoupons.length === 0}
              buttonClassName="bg-panel-2"
              ariaLabel="Apply a coupon"
            />
          )}
          {couponError && <p className="mt-2 text-xs text-danger">{couponError}</p>}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-ink-dim">
              Manual Discount (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={manualDiscount}
                onChange={(e) => updateManualPercent(e.target.value)}
                placeholder="0"
                className="mt-1.5 w-full rounded-lg border border-edge bg-panel-2 px-3 py-2.5 text-sm placeholder:text-ink-dim focus:border-accent focus:outline-none"
              />
            </label>
            <label className="text-xs font-medium text-ink-dim">
              Manual Discount (Rs)
              <input
                type="number"
                min="0"
                max={afterCoupon}
                step="0.01"
                value={manualDiscountRs}
                onChange={(e) => updateManualAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1.5 w-full rounded-lg border border-edge bg-panel-2 px-3 py-2.5 text-sm placeholder:text-ink-dim focus:border-accent focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-medium text-ink-dim">GST (included in prices)</span>
            <button
              type="button"
              role="switch"
              aria-checked={gstEnabled}
              aria-label="Toggle GST"
              onClick={() => onGstChange(!gstEnabled)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                gstEnabled ? 'bg-primary' : 'border border-edge bg-panel-2'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${
                  gstEnabled ? 'left-[22px] bg-btn-ink' : 'left-0.5 bg-ink-dim'
                }`}
              />
            </button>
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
          <div className="mt-1 flex justify-between border-t border-edge pt-3 text-base">
            <dt className="font-sans font-bold">Total</dt>
            <dd className="font-bold text-primary">{formatINR(total)}</dd>
          </div>
          {gstEnabled && (
            <div className="text-right font-sans text-xs text-ink-dim">Inclusive of all taxes</div>
          )}
        </dl>

        <button
          onClick={() => onProceed(total)}
          disabled={!canGenerate}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-btn-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Wallet size={16} />
          Proceed to Payment
        </button>
      </div>
    </section>
  )
}
