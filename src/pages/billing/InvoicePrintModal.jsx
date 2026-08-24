import { createPortal } from 'react-dom'
import { Printer, CheckCircle2, MessageCircle } from 'lucide-react'
import Modal from '../../components/Modal'
import { formatDate, formatINR } from '../../lib/format'

const MODE_LABEL = { cash: 'Cash', upi: 'UPI', card: 'Card' }

function whatsAppUrl(invoice) {
  const customerName = invoice.customer?.name?.trim() || 'there'

  const lines = [
    `Hi ${customerName},`,
    '',
    'Thank you for choosing *OG Clothing*.',
    '',
    'We appreciate your trust in our brand. Good style gets noticed. Good quality gets remembered—we believe in both.',
    '',
    `Invoice ${invoice.invoiceNumber}`,
    formatDate(invoice.createdAt),
    
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
            ? [`Cash received: ${formatINR(invoice.payment.amountTendered)} ·`]
            : []),
        ]
      : []),
    '',
    '*Until next time—stay sharp.*',
  ]
  // 91 = India country code; customer phones are stored as 10 digits
  return `https://wa.me/91${invoice.customer.phone}?text=${encodeURIComponent(lines.join('\n'))}`
}

const Divider = () => <div className="my-1.5 border-t border-dashed border-black" />

const Row = ({ label, value, bold = false }) => (
  <div className={`flex justify-between gap-2 ${bold ? 'text-[13px] font-bold' : ''}`}>
    <span>{label}</span>
    <span className="shrink-0">{value}</span>
  </div>
)

// 80mm thermal receipt body (72mm content), shared by the on-screen
// preview and the print copy — black-on-white, monospace, dashed rules
function InvoiceContent({ invoice }) {
  const totalQty = invoice.items.reduce((sum, item) => sum + item.qty, 0)
  return (
    <div className="mx-auto w-[72mm] font-mono text-[11px] leading-relaxed text-black">
      <div className="text-center">
        <div className="text-[15px] font-bold tracking-widest">OG CLOTHING</div>
        <div>Menswear · Madurai, Tamil Nadu</div>
        <div>GSTIN: 33FJLPS0840H1Z3</div>
      </div>

      <Divider />
      <Row label={invoice.invoiceNumber} value={formatDate(invoice.createdAt)} />
      <div className="mt-1">Billed to: {invoice.customer.name}</div>
      <div>{invoice.customer.phone}</div>

      <Divider />
      <Row label="ITEM" value="AMOUNT" />
      {invoice.items.map((item) => (
        <div key={item.productId} className="mt-1">
          <div className="font-semibold">
            {item.name}
            {item.sku ? ` [${item.sku}]` : ''}
          </div>
          <Row
            label={`${[item.size, item.colour].filter(Boolean).join(' · ')} · ${item.qty} x ${formatINR(item.unitPrice)}`}
            value={formatINR(item.lineTotal)}
          />
        </div>
      ))}
      <Divider />
      <Row label="Subtotal" value={formatINR(invoice.subtotal)} />
      {invoice.coupon && (
        <Row
          label={`Coupon (${invoice.coupon.code})`}
          value={`-${formatINR(invoice.coupon.discountAmount)}`}
        />
      )}
      {invoice.manualDiscountAmount > 0 && (
        <Row
          label={`Discount (${invoice.manualDiscountPercent}%)`}
          value={`-${formatINR(invoice.manualDiscountAmount)}`}
        />
      )}
      <div className="flex justify-between gap-2 text-[13px] font-bold">
        <span>
          TOTAL
          {invoice.gstRate > 0 && (
            <span className="text-[10px] font-normal"> (Inclusive of all taxes)</span>
          )}
        </span>
        <span className="shrink-0">{formatINR(invoice.total)}</span>
      </div>

      {invoice.payment && (
        <>
          <Divider />
          <Row
            label="Paid via"
            value={`${MODE_LABEL[invoice.payment.mode]}${invoice.payment.reference ? ` · ${invoice.payment.reference}` : ''}`}
          />
          {invoice.payment.mode === 'cash' && invoice.payment.amountTendered != null && (
            <>
              <Row label="Cash Received" value={formatINR(invoice.payment.amountTendered)} />
              <Row label="Change Returned" value={formatINR(invoice.payment.changeReturned)} />
            </>
          )}
        </>
      )}

      <Divider />
      <div className="text-center">
        <div>Thank you for shopping with</div>
        <div className="font-semibold">OG Clothing!</div>
      </div>
    </div>
  )
}

export default function InvoicePrintModal({ invoice, onClose, isNew = true }) {
  return (
    <Modal title={isNew ? 'Invoice generated' : `Invoice ${invoice.invoiceNumber}`} onClose={onClose}>
      {isNew && (
        <div className="mb-4 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 size={16} />
          Sale recorded — stock and customer records updated.
        </div>
      )}

      {/* On-screen preview: white strip the width of the receipt */}
      <div className="mx-auto w-fit rounded-lg bg-white px-4 py-5 text-black shadow-inner">
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
