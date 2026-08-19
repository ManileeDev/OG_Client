import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, Wallet, AlertTriangle, XCircle, Pencil, Trash2, Plus } from 'lucide-react'
import { apiDelete, apiGet } from '../../api/client'
import { formatINR } from '../../lib/format'
import { groupProducts } from '../../lib/categories'
import CategoryDoodle from '../../components/CategoryDoodle'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import SearchInput from '../../components/SearchInput'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorState from '../../components/ErrorState'
import ProductFormModal from './ProductFormModal'

function stockStatus(stock) {
  if (stock === 0) return { tone: 'danger', label: 'Out of stock' }
  if (stock <= 5) return { tone: 'warning', label: 'Low stock' }
  return { tone: 'success', label: 'In stock' }
}

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const [deleting, setDeleting] = useState(null)

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiGet('/products'),
  })

  // One row per product; each size variant is its own document underneath
  const groups = useMemo(() => groupProducts(products), [products])

  const deleteMutation = useMutation({
    mutationFn: async (group) => {
      for (const v of group.variants) {
        await apiDelete(`/products/${v.id}`)
      }
    },
    onSuccess: () => setDeleting(null),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const stats = useMemo(
    () => ({
      total: groups.length,
      value: products.reduce((sum, p) => sum + p.price * p.stock, 0),
      low: groups.filter((g) => g.stock > 0 && g.stock <= 5).length,
      out: groups.filter((g) => g.stock === 0).length,
    }),
    [products, groups],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groups
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.sku ?? '').toLowerCase().includes(q) ||
        (g.colour ?? '').toLowerCase().includes(q),
    )
  }, [groups, search])

  const columns = [
    {
      header: 'Product',
      cell: (p) => (
        <div>
          <div className="font-medium">{p.name}</div>
          <div className="mt-0.5 text-xs text-ink-dim">{p.sku ?? '—'}</div>
        </div>
      ),
    },
    { header: 'Category', cell: (p) => p.category, className: 'text-ink-dim' },
    { header: 'Colour', cell: (p) => p.colour ?? '—', className: 'text-ink-dim' },
    {
      header: 'Sizes & stock',
      cell: (p) => (
        <div className="flex max-w-72 flex-wrap gap-1.5">
          {p.variants.map((v) => (
            <span
              key={v.id}
              className={`rounded-md border border-edge px-2 py-0.5 text-xs ${
                v.stock === 0 ? 'text-danger' : 'text-ink-dim'
              }`}
            >
              {v.size} · {v.stock}
            </span>
          ))}
        </div>
      ),
    },
    { header: 'Price', cell: (p) => formatINR(p.price) },
    { header: 'Stock', cell: (p) => p.stock },
    {
      header: 'Status',
      cell: (p) => {
        const s = stockStatus(p.stock)
        return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
      },
    },
    {
      header: '',
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditing(p)}
            className="rounded-lg p-2 text-ink-dim hover:bg-panel-2 hover:text-ink"
            aria-label={`Edit ${p.name}`}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleting(p)}
            className="rounded-lg p-2 text-ink-dim hover:bg-panel-2 hover:text-danger"
            aria-label={`Delete ${p.name}`}
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
        kicker="Stock Room"
        title="Inventory"
        subtitle="Every product currently on the rack, tracked in real time."
        action={
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-btn-ink hover:opacity-90"
          >
            <Plus size={16} /> Add Product
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard icon={Package} label="Total Products" value={stats.total} tone="amber" loading={isLoading} />
          <StatCard icon={Wallet} label="Stock Value" value={formatINR(stats.value)} tone="teal" loading={isLoading} />
          <StatCard icon={AlertTriangle} label="Low Stock Items" value={stats.low} tone="red" loading={isLoading} />
          <StatCard icon={XCircle} label="Out of Stock" value={stats.out} tone="neutral" loading={isLoading} />
        </div>
        <div className="mt-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products or SKU..." />
        </div>
      </PageHeader>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          {/* Desktop: table. Mobile: stacked cards (the table doesn't shrink well) */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              rows={filtered}
              rowKey={(p) => p.key}
              loading={isLoading}
              emptyMessage="No products match your search."
            />
          </div>
          <div className="md:hidden">
            {isLoading ? (
              <ul className="flex flex-col gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="h-36 animate-pulse rounded-xl border border-edge bg-panel-2/40" />
                ))}
              </ul>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-edge bg-panel px-4 py-10 text-center text-sm text-ink-dim">
                No products match your search.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {filtered.map((g) => {
                  const s = stockStatus(g.stock)
                  return (
                    <li key={g.key} className="rounded-xl border border-edge bg-panel p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-panel-2 text-ink-dim">
                          <CategoryDoodle category={g.category} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{g.name}</div>
                          <div className="mt-0.5 truncate text-xs text-ink-dim">
                            {[g.sku, g.colour, g.category].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                        <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {g.variants.map((v) => (
                          <span
                            key={v.id}
                            className={`rounded-md border border-edge px-2 py-0.5 text-xs ${
                              v.stock === 0 ? 'text-danger' : 'text-ink-dim'
                            }`}
                          >
                            {v.size} · {v.stock}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-edge pt-3">
                        <span className="text-sm font-semibold tracking-tight">{formatINR(g.price)}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditing(g)}
                            className="rounded-lg p-2 text-ink-dim hover:bg-panel-2 hover:text-ink"
                            aria-label={`Edit ${g.name}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleting(g)}
                            className="rounded-lg p-2 text-ink-dim hover:bg-panel-2 hover:text-danger"
                            aria-label={`Delete ${g.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}

      {editing && (
        <ProductFormModal group={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete product"
          message={`Remove "${deleting.name}"${deleting.sku ? ` (${deleting.sku})` : ''} and all ${deleting.variants.length > 1 ? `${deleting.variants.length} sizes` : 'its stock'} from inventory? This cannot be undone.`}
          onConfirm={() => deleteMutation.mutate(deleting)}
          onClose={() => setDeleting(null)}
          busy={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
