import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ShoppingBag, Wallet, TrendingUp, CalendarDays, Eye, Trash2, Store, Wifi } from 'lucide-react'
import { apiDelete, apiGet } from '../../api/client'
import { formatDateTime, formatINR } from '../../lib/format'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import DataTable from '../../components/DataTable'
import ErrorState from '../../components/ErrorState'
import InvoicePrintModal from '../billing/InvoicePrintModal'
import ConfirmDialog from '../../components/ConfirmDialog'

function discountLabel(inv) {
  const parts = []
  if (inv.coupon) parts.push(`${inv.coupon.code} −${formatINR(inv.coupon.discountAmount)}`)
  if (inv.manualDiscountAmount > 0)
    parts.push(`${inv.manualDiscountPercent}% −${formatINR(inv.manualDiscountAmount)}`)
  return parts.join(' · ')
}

function channelLabel(inv) {
  if (inv.channel === 'online') return <span className="inline-flex items-center gap-1 text-teal-400"><Wifi size={13} /> Online</span>
  if (inv.channel === 'in_store') return <span className="inline-flex items-center gap-1 text-accent"><Store size={13} /> In store</span>
  return <span className="text-ink-dim">—</span>
}

export default function CustomerHistoryPage() {
  const { customerId } = useParams()
  const queryClient = useQueryClient()
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { data: customer, isLoading: customerLoading, error: customerError, refetch } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => apiGet(`/customers/${customerId}`),
  })

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['customer-invoices', customerId],
    queryFn: () => apiGet(`/customers/${customerId}/invoices`),
  })
  const deleteMutation = useMutation({
    mutationFn: (invoiceId) => apiDelete(`/invoices/${invoiceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-invoices', customerId] })
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setDeleting(null)
    },
  })

  const columns = [
    {
      header: 'Invoice',
      cell: (inv) => <span className="font-mono font-medium">{inv.invoiceNumber}</span>,
    },
    { header: 'Date', cell: (inv) => formatDateTime(inv.createdAt), className: 'text-ink-dim' },
    { header: 'Channel', cell: channelLabel },
    {
      header: 'Items',
      cell: (inv) => (
        <div>
          <div>{inv.items.reduce((sum, item) => sum + item.qty, 0)} pcs</div>
          <div className="mt-0.5 max-w-56 truncate text-xs text-ink-dim">
            {inv.items.map((item) => item.name).join(', ')}
          </div>
        </div>
      ),
    },
    {
      header: 'Discounts',
      cell: (inv) => {
        const label = discountLabel(inv)
        return label ? <span className="text-accent">{label}</span> : <span className="text-ink-dim">—</span>
      },
    },
    { header: 'Total', cell: (inv) => <span className="font-semibold">{formatINR(inv.total)}</span> },
    {
      header: '',
      cell: (inv) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setViewing(inv)}
            className="flex items-center gap-1.5 rounded-lg border border-edge px-3 py-1.5 text-xs text-ink-dim hover:border-accent hover:text-accent"
          >
            <Eye size={13} /> View
          </button>
          <button onClick={() => setDeleting(inv)} className="rounded-lg border border-danger/30 p-1.5 text-danger hover:bg-danger/10" aria-label={`Delete invoice ${inv.invoiceNumber}`} title="Delete invoice"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  if (customerError) {
    return (
      <div className="mx-auto max-w-6xl">
        <Link to="/customers" className="mb-4 inline-flex items-center gap-2 text-sm text-ink-dim hover:text-accent">
          <ArrowLeft size={15} /> Back to customers
        </Link>
        <ErrorState error={customerError} onRetry={refetch} />
      </div>
    )
  }

  const aov = customer && customer.orders > 0 ? customer.totalSpent / customer.orders : 0

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to="/customers"
        className="mb-4 inline-flex items-center gap-2 text-sm text-ink-dim hover:text-accent"
      >
        <ArrowLeft size={15} /> Back to customers
      </Link>

      <PageHeader
        kicker="Purchase History"
        title={customer?.name ?? '…'}
        subtitle={
          customer
            ? `${customer.phone}${customer.email ? ` · ${customer.email}` : ''} · customer since their first bill`
            : undefined
        }
      >
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard icon={ShoppingBag} label="Total Orders" value={customer?.orders ?? 0} tone="amber" loading={customerLoading} />
          <StatCard icon={Wallet} label="Total Spent" value={formatINR(customer?.totalSpent)} tone="teal" loading={customerLoading} />
          <StatCard icon={TrendingUp} label="Avg. Order Value" value={formatINR(aov)} tone="violet" loading={customerLoading} />
          <StatCard icon={CalendarDays} label="Last Purchase" value={formatDateTime(customer?.lastPurchase)} tone="pink" loading={customerLoading} />
        </div>
      </PageHeader>

      {/* Desktop: table. Mobile: stacked cards (the table doesn't shrink well) */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          rows={invoices}
          rowKey={(inv) => inv.id}
          loading={invoicesLoading}
          emptyMessage="No invoices recorded yet — history builds up as sales are billed here."
        />
      </div>
      <div className="md:hidden">
        {invoicesLoading ? (
          <ul className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-28 animate-pulse rounded-xl border border-edge bg-panel-2/40" />
            ))}
          </ul>
        ) : invoices.length === 0 ? (
          <div className="rounded-xl border border-edge bg-panel px-4 py-10 text-center text-sm text-ink-dim">
            No invoices recorded yet — history builds up as sales are billed here.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {invoices.map((inv) => {
              const pcs = inv.items.reduce((sum, item) => sum + item.qty, 0)
              const label = discountLabel(inv)
              return (
                <li key={inv.id} className="rounded-xl border border-edge bg-panel p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm font-medium">{inv.invoiceNumber}</span>
                    <span className="text-sm font-semibold">{formatINR(inv.total)}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-ink-dim">
                    {formatDateTime(inv.createdAt)} · {pcs} pcs · {channelLabel(inv)}
                  </div>
                  <div className="mt-1 truncate text-xs text-ink-dim">
                    {inv.items.map((item) => item.name).join(', ')}
                  </div>
                  {label && <div className="mt-1 text-xs text-accent">{label}</div>}
                  <div className="mt-3 flex justify-end border-t border-edge pt-2.5">
                    <div className="flex gap-2">
                      <button onClick={() => setViewing(inv)} className="flex items-center gap-1.5 rounded-lg border border-edge px-3 py-1.5 text-xs text-ink-dim hover:border-accent hover:text-accent"><Eye size={13} /> View invoice</button>
                      <button onClick={() => setDeleting(inv)} className="rounded-lg border border-danger/30 p-1.5 text-danger hover:bg-danger/10" aria-label={`Delete invoice ${inv.invoiceNumber}`} title="Delete invoice"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {invoices.length > 0 && invoices.length < (customer?.orders ?? 0) && (
        <p className="mt-3 text-xs text-ink-dim">
          Showing {invoices.length} recorded invoice{invoices.length === 1 ? '' : 's'} — earlier
          orders predate invoice tracking.
        </p>
      )}

      {viewing && <InvoicePrintModal invoice={viewing} isNew={false} onClose={() => setViewing(null)} />}
      {deleting && <ConfirmDialog title="Delete invoice?" message={`Delete ${deleting.invoiceNumber}? This will remove the invoice and recalculate the customer's summary.`} onClose={() => deleteMutation.isPending ? null : setDeleting(null)} onConfirm={() => deleteMutation.mutate(deleting.id)} busy={deleteMutation.isPending} />}
    </div>
  )
}
