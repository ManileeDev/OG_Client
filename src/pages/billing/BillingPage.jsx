import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
    resetSale,
  } = useBilling()
  const [invoice, setInvoice] = useState(null)
  const [checkoutTotal, setCheckoutTotal] = useState(null) // non-null → payment step open

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

  const generateMutation = useMutation({
    mutationFn: (body) => apiPost('/invoices', body),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      resetSale()
      setCheckoutTotal(null)
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
      payment,
    })
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        kicker="New Sale"
        title="Billing"
        subtitle="Pick products, add the customer, and generate the invoice."
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_400px]">
        <ProductPicker products={products} loading={productsLoading} cartQty={cartQty} onAdd={addToCart} />

        <div className="flex flex-col gap-6">
          <CustomerForm customer={customer} onChange={setCustomer} />
          <CartSummary
            cart={cart}
            subtotal={subtotal}
            appliedCoupon={appliedCoupon}
            onCouponChange={setAppliedCoupon}
            manualDiscount={manualDiscount}
            onManualDiscountChange={setManualDiscount}
            customer={customer}
            onSetQty={setQty}
            onRemove={removeLine}
            onProceed={startPayment}
          />
        </div>
      </div>

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
