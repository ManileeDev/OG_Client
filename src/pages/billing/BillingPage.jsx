import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, X } from 'lucide-react'
import { apiGet, apiPost } from '../../api/client'
import { useBilling } from '../../context/BillingContext'
import PageHeader from '../../components/PageHeader'
import ProductPicker from './ProductPicker'
import CustomerForm from './CustomerForm'
import CartSummary from './CartSummary'
import PaymentModal from './PaymentModal'
import InvoicePrintModal from './InvoicePrintModal'

export default function BillingPage() {
  const queryClient = useQueryClient()
  const {
    cart,
    setCart,
    customer,
    setCustomer,
    appliedCoupon,
    setAppliedCoupon,
    manualDiscount,
    setManualDiscount,
    manualDiscountAmount,
    setManualDiscountAmount,
    gstEnabled,
    setGstEnabled,
    channel,
    setChannel,
    resetSale,
  } = useBilling()
  const [invoice, setInvoice] = useState(null)
  const [checkoutTotal, setCheckoutTotal] = useState(null) // non-null → payment step open
  const [cartOpen, setCartOpen] = useState(false) // mobile checkout drawer

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiGet('/products'),
  })

  const cartQty = (productId) => cart.find((l) => l.product.id === productId)?.qty ?? 0

  const addToCart = (product) => {
    setCart((lines) => {
      const existing = lines.find((l) => l.product.id === product.id)
      if (existing) {
        if (existing.qty >= product.stock) return lines
        return lines.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l))
      }
      return [...lines, { product, qty: 1 }]
    })
  }

  const setQty = (productId, qty) => {
    setCart((lines) =>
      qty <= 0
        ? lines.filter((l) => l.product.id !== productId)
        : lines.map((l) =>
            l.product.id === productId ? { ...l, qty: Math.min(qty, l.product.stock) } : l,
          ),
    )
  }

  const removeLine = (productId) => setCart((lines) => lines.filter((l) => l.product.id !== productId))

  const subtotal = useMemo(
    () => cart.reduce((sum, l) => sum + l.product.price * l.qty, 0),
    [cart],
  )
  const itemCount = useMemo(() => cart.reduce((sum, l) => sum + l.qty, 0), [cart])

  const generateMutation = useMutation({
    mutationFn: (body) => apiPost('/invoices', body),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      resetSale()
      setCheckoutTotal(null)
      setCartOpen(false)
      setInvoice(created)
    },
  })

  const startPayment = (total) => {
    generateMutation.reset()
    setCheckoutTotal(total)
  }

  const generateInvoice = (payment) => {
    generateMutation.mutate({
      customer: {
        phone: customer.phone,
        name: customer.name.trim(),
        email: customer.email.trim() || null,
      },
      items: cart.map((l) => ({ productId: l.product.id, qty: l.qty })),
      couponCode: appliedCoupon?.code ?? null,
      manualDiscountPercent: Number(manualDiscount || 0),
      manualDiscountAmount: manualDiscountAmount === '' ? null : Number(manualDiscountAmount),
      gstEnabled,
      channel,
      payment,
    })
  }

  const checkoutPanel = (
    <>
      <CustomerForm customer={customer} onChange={setCustomer} channel={channel} onChannelChange={setChannel} />
      <CartSummary
        cart={cart}
        subtotal={subtotal}
        appliedCoupon={appliedCoupon}
        onCouponChange={setAppliedCoupon}
        manualDiscount={manualDiscount}
        onManualDiscountChange={setManualDiscount}
        manualDiscountAmount={manualDiscountAmount}
        onManualDiscountAmountChange={setManualDiscountAmount}
        customer={customer}
        onSetQty={setQty}
        onRemove={removeLine}
        onClear={() => setCart([])}
        gstEnabled={gstEnabled}
        onGstChange={setGstEnabled}
        onProceed={startPayment}
      />
    </>
  )

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        kicker="New Sale"
        title="Billing"
        subtitle="Pick products, add the customer, and generate the invoice."
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_400px]">
        <ProductPicker
          products={products}
          loading={productsLoading}
          cartQty={cartQty}
          onAdd={addToCart}
          onSetQty={setQty}
        />

        {/* Desktop: checkout beside the picker. Mobile gets the drawer below. */}
        <div className="hidden flex-col gap-6 lg:flex">{checkoutPanel}</div>
      </div>

      {/* Mobile: floating cart button opens the checkout drawer (hidden while empty) */}
      {itemCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-20 left-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-btn-ink shadow-xl shadow-black/40 lg:hidden"
          aria-label={`Open cart, ${itemCount} items`}
        >
          <ShoppingCart size={22} />
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-surface bg-ink px-1.5 text-xs font-bold text-surface">
            {itemCount}
          </span>
        </button>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[45] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-sm animate-[drawer-in_0.25s_ease-out] flex-col border-r border-edge bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-edge px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-dim">
                Checkout{itemCount > 0 && ` · ${itemCount} item${itemCount > 1 ? 's' : ''}`}
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-1.5 text-ink-dim hover:bg-panel-2 hover:text-ink"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">{checkoutPanel}</div>
          </div>
        </div>
      )}

      {checkoutTotal !== null && (
        <PaymentModal
          total={checkoutTotal}
          onConfirm={generateInvoice}
          onClose={() => setCheckoutTotal(null)}
          busy={generateMutation.isPending}
          error={generateMutation.error}
        />
      )}
      {invoice && <InvoicePrintModal invoice={invoice} onClose={() => setInvoice(null)} />}
    </div>
  )
}
