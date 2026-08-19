import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { apiDelete, apiGet } from '../../api/client'
import { formatDate, formatINR } from '../../lib/format'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
import CopyButton from '../../components/CopyButton'
import ErrorState from '../../components/ErrorState'
import CouponFormModal from './CouponFormModal'

function couponStatus(c) {
  if (c.status === 'active') return <StatusBadge tone="success">Active</StatusBadge>
  const limitReached = c.usageLimit != null && c.usedCount >= c.usageLimit
  return <StatusBadge tone="danger">{limitReached ? 'Limit reached' : 'Expired'}</StatusBadge>
}

function couponDiscount(c) {
  return c.type === 'percent' ? `${c.value}% off` : `${formatINR(c.value)} off`
}

export default function CouponsPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null) // null | 'new' | coupon
  const [deleting, setDeleting] = useState(null)

  const { data: coupons = [], isLoading, error, refetch } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => apiGet('/coupons'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      setDeleting(null)
    },
  })

  const columns = [
    {
      header: 'Code',
      cell: (c) => (
        <div className="flex items-center gap-1.5">
          <span className="inline-block rounded bg-primary px-2.5 py-1 font-mono text-xs font-bold text-btn-ink">
            {c.code}
          </span>
          <CopyButton text={c.code} />
        </div>
      ),
    },
    { header: 'Discount', cell: couponDiscount },
    { header: 'Min. Purchase', cell: (c) => formatINR(c.minPurchase), className: 'text-ink-dim' },
    { header: 'Expiry', cell: (c) => formatDate(c.expiry), className: 'text-ink-dim' },
    {
      header: 'Usage',
      cell: (c) =>
        c.usageLimit ? (
          <span>
            {c.usedCount} <span className="text-ink-dim">/ {c.usageLimit}</span>
          </span>
        ) : (
          c.usedCount
        ),
    },
    { header: 'Status', cell: couponStatus },
    {
      header: '',
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditing(c)}
            className="rounded-lg p-2 text-ink-dim hover:bg-panel-2 hover:text-ink"
            aria-label={`Edit ${c.code}`}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleting(c)}
            className="rounded-lg p-2 text-ink-dim hover:bg-panel-2 hover:text-danger"
            aria-label={`Delete ${c.code}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Promotions"
        title="Coupons"
        subtitle="Discount codes your customers can redeem at checkout."
        action={
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-btn-ink hover:opacity-90"
          >
            <Plus size={16} /> Create Coupon
          </button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          {/* Desktop: table. Mobile: stacked cards (the table doesn't shrink well) */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              rows={coupons}
              rowKey={(c) => c.id}
              loading={isLoading}
              emptyMessage="No coupons yet — create your first one."
            />
          </div>
          <div className="md:hidden">
            {isLoading ? (
              <ul className="flex flex-col gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="h-32 animate-pulse rounded-xl border border-edge bg-panel-2/40" />
                ))}
              </ul>
            ) : coupons.length === 0 ? (
              <div className="rounded-xl border border-edge bg-panel px-4 py-10 text-center text-sm text-ink-dim">
                No coupons yet — create your first one.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {coupons.map((c) => (
                  <li key={c.id} className="rounded-xl border border-edge bg-panel p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="inline-block truncate rounded bg-primary px-2.5 py-1 font-mono text-xs font-bold text-btn-ink">
                          {c.code}
                        </span>
                        <CopyButton text={c.code} />
                      </div>
                      {couponStatus(c)}
                    </div>
                    <div className="mt-3 text-sm">
                      <span className="font-semibold">{couponDiscount(c)}</span>
                      <span className="text-ink-dim"> · Min. purchase {formatINR(c.minPurchase)}</span>
                    </div>
                    <div className="mt-1 text-xs text-ink-dim">
                      Expires {formatDate(c.expiry)} · Used {c.usedCount}
                      {c.usageLimit != null && ` / ${c.usageLimit}`}
                    </div>
                    <div className="mt-3 flex justify-end gap-1 border-t border-edge pt-2">
                      <button
                        onClick={() => setEditing(c)}
                        className="rounded-lg p-2 text-ink-dim hover:bg-panel-2 hover:text-ink"
                        aria-label={`Edit ${c.code}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(c)}
                        className="rounded-lg p-2 text-ink-dim hover:bg-panel-2 hover:text-danger"
                        aria-label={`Delete ${c.code}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {editing && (
        <CouponFormModal coupon={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete coupon"
          message={`Delete coupon "${deleting.code}"? Customers will no longer be able to redeem it.`}
          onConfirm={() => deleteMutation.mutate(deleting.id)}
          onClose={() => setDeleting(null)}
          busy={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
