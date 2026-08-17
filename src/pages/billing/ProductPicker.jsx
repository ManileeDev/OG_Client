import { useMemo, useState } from 'react'
import { Plus, ShoppingBag } from 'lucide-react'
import { formatINR } from '../../lib/format'
import SearchInput from '../../components/SearchInput'

function SkeletonRows() {
  return (
    <ul className="flex flex-col divide-y divide-edge">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="flex items-center gap-3 py-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-panel-2" />
          <div className="min-w-0 flex-1">
            <div className={`h-4 animate-pulse rounded bg-panel-2 ${i % 2 ? 'w-40' : 'w-32'}`} />
            <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-panel-2" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-panel-2" />
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-panel-2" />
        </li>
      ))}
    </ul>
  )
}

export default function ProductPicker({ products, loading = false, cartQty, onAdd }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.colour.toLowerCase().includes(q)
      )
    })
  }, [products, search, category])

  return (
    <section className="rounded-xl border border-edge bg-panel">
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-dim">
          Select Products
        </h2>
        <span className="text-xs text-ink-dim">{products.length} items</span>
      </div>

      <div className="flex flex-col gap-3 p-4 sm:flex-row">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, SKU, or colour..." />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-edge bg-panel-2 px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
        >
          <option>All</option>
          <option>Men</option>
          <option>Women</option>
        </select>
      </div>

      <div className="max-h-[520px] overflow-y-auto px-4 pb-4">
        {loading ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-ink-dim">No products found.</div>
        ) : (
          <ul className="flex flex-col divide-y divide-edge">
            {filtered.map((p) => {
              const inCart = cartQty(p.id)
              const maxed = p.stock === 0 || inCart >= p.stock
              return (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-panel-2 text-ink-dim">
                    <ShoppingBag size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="mt-0.5 truncate text-xs text-ink-dim">
                      {p.size} · {p.colour} ·{' '}
                      {p.stock === 0 ? (
                        <span className="text-danger">out of stock</span>
                      ) : (
                        `${p.stock} in stock`
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium">{formatINR(p.price)}</div>
                  <button
                    onClick={() => onAdd(p)}
                    disabled={maxed}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-edge text-ink-dim hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Add ${p.name} to cart`}
                  >
                    <Plus size={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
