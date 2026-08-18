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
          <span className="inline-block rounded bg-primary px-2.5 py-1 font-mono text-xs font-bold text-black">
            {c.code}
          </span>
          <CopyButton text={c.code} />
        </div>
      ),
    },
    {
      header: 'Discount',
      cell: (c) => (c.type === 'percent' ? `${c.value}% off` : `${formatINR(c.value)} off`),
    },
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
    {
      header: 'Status',
      cell: (c) => {
        if (c.status === 'active') return <StatusBadge tone="success">Active</StatusBadge>
        const limitReached = c.usageLimit != null && c.usedCount >= c.usageLimit
        return (
          <StatusBadge tone="danger">{limitReached ? 'Limit reached' : 'Expired'}</StatusBadge>
        )
      },
    },
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
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black hover:opacity-90"
          >
            <Plus size={16} /> Create Coupon
          </button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          rows={coupons}
          rowKey={(c) => c.id}
          loading={isLoading}
          emptyMessage="No coupons yet — create your first one."
        />
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
