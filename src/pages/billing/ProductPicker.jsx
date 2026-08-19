import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { formatINR } from '../../lib/format'
import { CATEGORIES, groupProducts } from '../../lib/categories'
import CategoryDoodle from '../../components/CategoryDoodle'
import SearchInput from '../../components/SearchInput'
import Select from '../../components/Select'

const CARD_GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'

function SkeletonCards() {
  return (
    <ul className={CARD_GRID}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="rounded-xl border border-edge p-3">
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-panel-2" />
            <div className="min-w-0 flex-1">
              <div className={`h-3.5 animate-pulse rounded bg-panel-2 ${i % 2 ? 'w-32' : 'w-24'}`} />
              <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-panel-2" />
            </div>
          </div>
          <div className="mt-2.5 flex gap-1">
            <div className="h-6 w-12 animate-pulse rounded-md bg-panel-2" />
            <div className="h-6 w-12 animate-pulse rounded-md bg-panel-2" />
            <div className="h-6 w-12 animate-pulse rounded-md bg-panel-2" />
          </div>
          <div className="mt-2.5 border-t border-edge pt-2">
            <div className="h-4 w-16 animate-pulse rounded bg-panel-2" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function ProductPicker({ products, loading = false, cartQty, onAdd, onSetQty }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  // One card per product; each size is its own add-to-cart button
  const groups = useMemo(() => groupProducts(products), [products])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return groups.filter((g) => {
      if (category !== 'All' && g.category !== category) return false
      if (!q) return true
      return (
        g.name.toLowerCase().includes(q) ||
        (g.sku ?? '').toLowerCase().includes(q) ||
        (g.colour ?? '').toLowerCase().includes(q)
      )
    })
  }, [groups, search, category])

  return (
    <section className="rounded-xl border border-edge bg-panel">
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-dim">
          Select Products
        </h2>
        <span className="text-xs text-ink-dim">{groups.length} items</span>
      </div>

      <div className="flex flex-col gap-3 p-4 sm:flex-row">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, SKU, or colour..." />
        </div>
        <Select
          value={category}
          onChange={setCategory}
          options={['All', ...CATEGORIES.map((c) => c.name)]}
          className="sm:w-44"
          buttonClassName="bg-panel-2"
          ariaLabel="Filter by category"
        />
      </div>

      <div className="max-h-[520px] overflow-y-auto px-4 pb-4">
        {loading ? (
          <SkeletonCards />
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-ink-dim">No products found.</div>
        ) : (
          <ul className={CARD_GRID}>
            {filtered.map((g) => (
              <li
                key={g.key}
                className="group flex flex-col rounded-xl border border-edge bg-panel p-3 transition-colors hover:border-accent/50"
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-2 text-ink-dim transition-colors group-hover:text-accent">
                    <CategoryDoodle category={g.category} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium leading-tight" title={g.name}>
                      {g.name}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-ink-dim">
                      {[g.sku, g.colour, g.category].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  {g.stock === 0 && (
                    <span className="whitespace-nowrap rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-medium text-danger">
                      Sold out
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {g.variants.map((v) => {
                    const inCart = cartQty(v.id)
                    const left = v.stock - inCart
                    // In-cart sizes grow a −/+ stepper; others are one-tap add
                    return inCart > 0 ? (
                      <div
                        key={v.id}
                        className="flex h-5 items-center overflow-hidden rounded border border-accent/60 bg-accent/10 text-accent"
                      >
                        <button
                          onClick={() => onSetQty(v.id, inCart - 1)}
                          className="flex h-full items-center px-1 hover:bg-accent/20"
                          aria-label={`Remove one ${g.name} size ${v.size}`}
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-[10px] font-semibold">
                          {v.size} · {inCart}
                        </span>
                        <button
                          onClick={() => onAdd(v)}
                          disabled={left <= 0}
                          className="flex h-full items-center px-1 hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label={`Add one more ${g.name} size ${v.size}`}
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    ) : (
                      <button
                        key={v.id}
                        onClick={() => onAdd(v)}
                        disabled={left <= 0}
                        className="h-5 rounded border border-edge bg-panel-2/60 px-1 text-[10px] font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label={`Add ${g.name} size ${v.size} to cart`}
                        title={left <= 0 ? 'No stock left' : `${left} available`}
                      >
                        {v.size}
                        <span className="text-ink-dim"> · {left}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-auto pt-2.5">
                  <div className="flex items-center justify-between border-t border-edge pt-2">
                    <span className="text-sm font-semibold tracking-tight">{formatINR(g.price)}</span>
                    <span className="text-[9px] uppercase tracking-[0.12em] text-ink-dim">per piece</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
