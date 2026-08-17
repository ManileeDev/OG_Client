import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, Wallet, AlertTriangle, XCircle, Pencil, Trash2, Plus } from 'lucide-react'
import { apiDelete, apiGet } from '../../api/client'
import { formatINR } from '../../lib/format'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import SearchInput from '../../components/SearchInput'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import ConfirmDialog from '../../components/ConfirmDialog'
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

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiGet('/products'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setDeleting(null)
    },
  })

  const stats = useMemo(
    () => ({
      total: products.length,
      value: products.reduce((sum, p) => sum + p.price * p.stock, 0),
      low: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
      out: products.filter((p) => p.stock === 0).length,
    }),
    [products],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.colour.toLowerCase().includes(q),
    )
  }, [products, search])

  const columns = [
    {
      header: 'Product',
      cell: (p) => (
        <div>
          <div className="font-medium">{p.name}</div>
          <div className="mt-0.5 text-xs text-ink-dim">{p.sku}</div>
        </div>
      ),
    },
    { header: 'Category', cell: (p) => p.category, className: 'text-ink-dim' },
    { header: 'Size / Colour', cell: (p) => `${p.size} · ${p.colour}`, className: 'text-ink-dim' },
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
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black hover:opacity-90"
          >
            <Plus size={16} /> Add Product
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={Package} label="Total Products" value={stats.total} tone="amber" loading={isLoading} />
        <StatCard icon={Wallet} label="Stock Value" value={formatINR(stats.value)} tone="teal" loading={isLoading} />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={stats.low} tone="red" loading={isLoading} />
        <StatCard icon={XCircle} label="Out of Stock" value={stats.out} tone="neutral" loading={isLoading} />
      </div>

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products or SKU..." />
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Could not load products: {error.message}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.id}
          loading={isLoading}
          emptyMessage="No products match your search."
        />
      )}

      {editing && (
        <ProductFormModal product={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete product"
          message={`Remove "${deleting.name}" (${deleting.sku}) from inventory? This cannot be undone.`}
          onConfirm={() => deleteMutation.mutate(deleting.id)}
          onClose={() => setDeleting(null)}
          busy={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
