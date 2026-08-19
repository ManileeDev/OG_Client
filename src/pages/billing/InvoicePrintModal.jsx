import { createPortal } from 'react-dom'
import { Printer, CheckCircle2, MessageCircle } from 'lucide-react'
import Modal from '../../components/Modal'
import { formatDate, formatINR } from '../../lib/format'

const MODE_LABEL = { cash: 'Cash', upi: 'UPI', card: 'Card' }

function whatsAppUrl(invoice) {
  const lines = [
    `*OG Clothing — Invoice ${invoice.invoiceNumber}*`,
    formatDate(invoice.createdAt),
    '',
    `Hi ${invoice.customer.name}, thanks for shopping with us! Here is your bill:`,
    '',
    ...invoice.items.map(
      (item, i) =>
        `${i + 1}. ${item.name} (${[item.size, item.colour].filter(Boolean).join(' · ')}) ×${item.qty} — ${formatINR(item.lineTotal)}`,
    ),
    '',
    `Subtotal: ${formatINR(invoice.subtotal)}`,
    ...(invoice.coupon
      ? [`Coupon ${invoice.coupon.code}: −${formatINR(invoice.coupon.discountAmount)}`]
      : []),
    ...(invoice.manualDiscountAmount > 0
      ? [`Discount (${invoice.manualDiscountPercent}%): −${formatINR(invoice.manualDiscountAmount)}`]
      : []),
    `*Total: ${formatINR(invoice.total)}*${invoice.gstRate > 0 ? ' (inclusive of all taxes)' : ''}`,
    ...(invoice.payment
      ? [
          `Paid via ${MODE_LABEL[invoice.payment.mode]}${invoice.payment.reference ? ` (${invoice.payment.reference})` : ''}`,
          ...(invoice.payment.mode === 'cash' && invoice.payment.amountTendered != null
            ? [
                `Cash received: ${formatINR(invoice.payment.amountTendered)} · Change: ${formatINR(invoice.payment.changeReturned)}`,
              ]
            : []),
        ]
      : []),
    '',
    'See you again soon! 🛍️',
  ]
  // 91 = India country code; customer phones are stored as 10 digits
  return `https://wa.me/91${invoice.customer.phone}?text=${encodeURIComponent(lines.join('\n'))}`
}

// Black-on-white invoice body, shared by the on-screen preview and the print copy
function InvoiceContent({ invoice }) {
  return (
    <>
        <div className="flex items-start justify-between border-b border-gray-300 pb-4">
          <div>
            <div className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              OG Clothing
            </div>
            <div className="text-xs text-gray-600">Menswear · Chennai, Tamil Nadu</div>
            <div className="text-xs text-gray-600">GSTIN: 33XXXXX0000X1Z5</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm font-bold">{invoice.invoiceNumber}</div>
            <div className="text-xs text-gray-600">{formatDate(invoice.createdAt)}</div>
          </div>
        </div>

        <div className="mt-4 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Billed to</div>
          <div className="mt-1 font-medium">{invoice.customer.name}</div>
          <div className="text-xs text-gray-600">
            {invoice.customer.phone}
            {invoice.customer.email ? ` · ${invoice.customer.email}` : ''}
          </div>
        </div>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2 pr-2">Item</th>
              <th className="py-2 pr-2">Size / Colour</th>
              <th className="py-2 pr-2 text-right">Qty</th>
              <th className="py-2 pr-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.productId} className="border-b border-gray-200">
                <td className="py-2 pr-2">
                  <div className="font-medium">{item.name}</div>
                  {item.sku && <div className="text-xs text-gray-500">{item.sku}</div>}
                </td>
                <td className="py-2 pr-2 text-gray-600">
                  {[item.size, item.colour].filter(Boolean).join(' · ')}
                </td>
                <td className="py-2 pr-2 text-right">{item.qty}</td>
                <td className="py-2 pr-2 text-right">{formatINR(item.unitPrice)}</td>
                <td className="py-2 text-right">{formatINR(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-64 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatINR(invoice.subtotal)}</span>
          </div>
          {invoice.coupon && (
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Coupon ({invoice.coupon.code})</span>
              <span>−{formatINR(invoice.coupon.discountAmount)}</span>
            </div>
          )}
          {invoice.manualDiscountAmount > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Manual Discount ({invoice.manualDiscountPercent}%)</span>
              <span>−{formatINR(invoice.manualDiscountAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-gray-300 py-2 font-bold">
            <span>Total</span>
            <span>{formatINR(invoice.total)}</span>
          </div>
          {invoice.gstRate > 0 && (
            <div className="pb-1 text-right text-xs text-gray-500">Inclusive of all taxes</div>
          )}
          {invoice.payment && (
            <>
              <div className="flex justify-between border-t border-gray-200 py-1 pt-2">
                <span className="text-gray-600">Paid via</span>
                <span>
                  {MODE_LABEL[invoice.payment.mode]}
                  {invoice.payment.reference ? ` · ${invoice.payment.reference}` : ''}
                </span>
              </div>
              {invoice.payment.mode === 'cash' && invoice.payment.amountTendered != null && (
                <>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Cash Received</span>
                    <span>{formatINR(invoice.payment.amountTendered)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Change Returned</span>
                    <span>{formatINR(invoice.payment.changeReturned)}</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="mt-6 border-t border-gray-300 pt-3 text-center text-xs text-gray-500">
          Thank you for shopping with OG Clothing!
        </div>
    </>
  )
}

export default function InvoicePrintModal({ invoice, onClose, isNew = true }) {
  return (
    <Modal title={isNew ? 'Invoice generated' : `Invoice ${invoice.invoiceNumber}`} onClose={onClose} wide>
      {isNew && (
        <div className="mb-4 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 size={16} />
          Sale recorded — stock and customer records updated.
        </div>
      )}

      {/* On-screen preview */}
      <div className="rounded-lg bg-white p-6 text-black">
        <InvoiceContent invoice={invoice} />
      </div>

      {/* Print-only copy in the body flow — the sole visible element when printing */}
      {createPortal(
        <div id="invoice-print" className="hidden bg-white text-black print:block">
          <InvoiceContent invoice={invoice} />
        </div>,
        document.body,
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-edge px-4 py-2 text-sm text-ink-dim hover:bg-panel"
        >
          Close
        </button>
        <a
          href={whatsAppUrl(invoice)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-whatsapp px-4 py-2 text-sm font-semibold text-btn-ink hover:opacity-90"
        >
          <MessageCircle size={16} /> Send on WhatsApp
        </a>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-btn-ink hover:opacity-90"
        >
          <Printer size={16} /> Print
        </button>
      </div>
    </Modal>
  )
}
