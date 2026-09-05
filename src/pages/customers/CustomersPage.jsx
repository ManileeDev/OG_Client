import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserRound, Wallet, Sparkles, TrendingUp, Trash2, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { apiDelete, apiGet } from '../../api/client'
import { formatDateKey, formatDateTime, formatINR } from '../../lib/format'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import SearchInput from '../../components/SearchInput'
import DataTable from '../../components/DataTable'
import ErrorState from '../../components/ErrorState'
import ConfirmDialog from '../../components/ConfirmDialog'
import Select from '../../components/Select'

const TODAY = formatDateKey(new Date())
const FILTER_INPUT = 'mt-1.5 w-full rounded-lg border border-edge bg-panel-2 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent'

export default function CustomersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [channel, setChannel] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [deleting, setDeleting] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const controlsRef = useRef(null)

  useEffect(() => {
    if (!filtersOpen && !sortOpen) return undefined
    const closeOnOutsideClick = (event) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        setFiltersOpen(false)
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [filtersOpen, sortOpen])
  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiGet('/customers'),
  })
  const deleteMutation = useMutation({
    mutationFn: (customerId) => apiDelete(`/customers/${customerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setDeleting(null)
    },
  })

  const { data: allInvoices = [] } = useQuery({
    queryKey: ['customer-invoices'],
    queryFn: () => apiGet('/customers/invoices'),
    staleTime: 60_000,
    enabled: Boolean(fromDate || toDate || channel !== 'all'),
  })
  const invoicesByCustomer = new Map(
    customers.map((customer) => [
      customer.id,
      allInvoices.filter((invoice) => invoice.customer.phone === customer.phone),
    ]),
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matchingCustomers = customers.filter((c) => {
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q)
      const invoices = invoicesByCustomer.get(c.id) ?? []
      const matchesInvoice = invoices.some((invoice) => {
        const purchaseDate = formatDateKey(invoice.createdAt)
        const effectiveTo = toDate || (fromDate ? TODAY : '')
        const matchesDate = (!fromDate || purchaseDate >= fromDate) && (!effectiveTo || purchaseDate <= effectiveTo)
        const matchesChannel = channel === 'all' || invoice.channel === channel
        return matchesDate && matchesChannel
      })
      const hasFilters = Boolean(fromDate || toDate || channel !== 'all')
      const legacyDate = formatDateKey(c.lastPurchase)
      const effectiveTo = toDate || (fromDate ? TODAY : '')
      const matchesLegacy = !invoices.length && (!fromDate || legacyDate >= fromDate) && (!effectiveTo || legacyDate <= effectiveTo) && channel === 'all'
      return matchesSearch && (!hasFilters || matchesInvoice || matchesLegacy)
    })
    return [...matchingCustomers].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent
      if (sortBy === 'orders') return b.orders - a.orders
      return new Date(b.lastPurchase || 0) - new Date(a.lastPurchase || 0)
    })
  }, [customers, allInvoices, search, fromDate, toDate, channel, sortBy])

  const stats = useMemo(() => {
    const hasInvoiceFilters = Boolean(fromDate || toDate || channel !== 'all')
    const effectiveTo = toDate || (fromDate ? TODAY : '')
    const scopedCustomers = customers.filter((customer) => {
      if (!hasInvoiceFilters) return true
      const invoices = invoicesByCustomer.get(customer.id) ?? []
      const hasMatchingInvoice = invoices.some((invoice) => {
        const purchaseDate = formatDateKey(invoice.createdAt)
        return (!fromDate || purchaseDate >= fromDate) &&
          (!effectiveTo || purchaseDate <= effectiveTo) &&
          (channel === 'all' || invoice.channel === channel)
      })
      if (hasMatchingInvoice) return true
      const legacyDate = formatDateKey(customer.lastPurchase)
      return !invoices.length && channel === 'all' &&
        (!fromDate || legacyDate >= fromDate) && (!effectiveTo || legacyDate <= effectiveTo)
    })
    const scoped = scopedCustomers.reduce((result, customer) => {
      if (!hasInvoiceFilters) {
        result.orders += customer.orders
        result.revenue += customer.totalSpent
        return result
      }

      const matchingInvoices = (invoicesByCustomer.get(customer.id) ?? []).filter((invoice) => {
        const purchaseDate = formatDateKey(invoice.createdAt)
        return (!fromDate || purchaseDate >= fromDate) &&
          (!effectiveTo || purchaseDate <= effectiveTo) &&
          (channel === 'all' || invoice.channel === channel)
      })
      result.orders += matchingInvoices.length
      result.revenue += matchingInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
      return result
    }, { orders: 0, revenue: 0 })

    return {
      total: scopedCustomers.length,
      revenue: scoped.revenue,
      repeat: scopedCustomers.filter((customer) => {
        if (!hasInvoiceFilters) return customer.orders > 1
        const effectiveTo = toDate || (fromDate ? TODAY : '')
        return (invoicesByCustomer.get(customer.id) ?? []).filter((invoice) => {
          const purchaseDate = formatDateKey(invoice.createdAt)
          return (!fromDate || purchaseDate >= fromDate) &&
            (!effectiveTo || purchaseDate <= effectiveTo) &&
            (channel === 'all' || invoice.channel === channel)
        }).length > 1
      }).length,
      aov: scoped.orders > 0 ? scoped.revenue / scoped.orders : 0,
    }
  }, [customers, allInvoices, fromDate, toDate, channel])

  const columns = [
    {
      header: 'Customer',
      cell: (c) => (
        <Link
          to={`/customers/${c.id}`}
          className="font-medium underline-offset-4 hover:text-accent hover:underline"
        >
          {c.name}
        </Link>
      ),
    },
    {
      header: 'Contact',
      cell: (c) => (
        <div>
          <div>{c.phone}</div>
          {c.email && <div className="mt-0.5 text-xs text-ink-dim">{c.email}</div>}
        </div>
      ),
    },
    { header: 'Orders', cell: (c) => c.orders },
    { header: 'Total Spent', cell: (c) => formatINR(c.totalSpent) },
    { header: 'Last Purchase', cell: (c) => formatDateTime(c.lastPurchase), className: 'text-ink-dim' },
    {
      header: '',
      cell: (c) => (
        <button
          onClick={() => setDeleting(c)}
          className="rounded-lg p-2 text-ink-dim hover:bg-danger/10 hover:text-danger"
          aria-label={`Delete ${c.name}`}
          title="Delete customer"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ]

  const filtersActive = [fromDate, toDate, channel !== 'all'].filter(Boolean).length
  const clearFilters = () => {
    setFromDate('')
    setToDate('')
    setChannel('all')
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Relationships"
        title="Customers"
        subtitle="Everyone who has walked out with an OG bag."
        action={
          <div ref={controlsRef} className="absolute right-4 top-4 flex items-start gap-2 lg:right-16 lg:top-8">
            <div className="relative">
              <button
                type="button"
                onClick={() => { setFiltersOpen((open) => !open); setSortOpen(false) }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${filtersActive ? 'border-accent bg-accent/10 text-accent' : 'border-edge bg-panel text-ink-dim hover:border-accent/50 hover:text-ink'}`}
                aria-expanded={filtersOpen}
                aria-label="Customer filters"
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
                {filtersActive > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-btn-ink">{filtersActive}</span>}
              </button>
              {filtersOpen && (
              <div className="fixed left-4 right-4 top-24 z-40 mt-2 w-auto max-w-none rounded-xl border border-edge bg-panel p-4 shadow-xl shadow-black/30 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[calc(100vw-2rem)] sm:max-w-80">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-dim">Filter customers</span>
                  <button type="button" onClick={clearFilters} disabled={!filtersActive} className="text-xs font-medium text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-40">Clear all</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-medium text-ink-dim">
                    From date
                    <input type="date" max={TODAY} value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={FILTER_INPUT} />
                  </label>
                  <label className="text-xs font-medium text-ink-dim">
                    To date
                    <input type="date" max={TODAY} min={fromDate || undefined} value={toDate} onChange={(e) => setToDate(e.target.value)} className={FILTER_INPUT} />
                  </label>
                </div>
                <label className="mt-3 block text-xs font-medium text-ink-dim">
                  Sale channel
                  <Select
                    value={channel}
                    onChange={setChannel}
                    options={[{ value: 'all', label: 'All channels' }, { value: 'in_store', label: 'In store' }, { value: 'online', label: 'Online' }]}
                    className="mt-1.5"
                    buttonClassName="bg-panel-2"
                    ariaLabel="Filter by sale channel"
                  />
                </label>
              </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setSortOpen((open) => !open); setFiltersOpen(false) }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${sortBy !== 'recent' ? 'border-accent bg-accent/10 text-accent' : 'border-edge bg-panel text-ink-dim hover:border-accent/50 hover:text-ink'}`}
                aria-expanded={sortOpen}
                aria-label="Sort customers"
              >
                <ArrowUpDown size={16} />
                <span className="hidden sm:inline">Sort by</span>
              </button>
              {sortOpen && (
                <div className="fixed left-4 right-4 top-24 z-40 mt-2 w-auto max-w-none rounded-xl border border-edge bg-panel p-4 shadow-xl shadow-black/30 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[calc(100vw-2rem)] sm:max-w-64">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-dim">Sort customers</span>
                    {sortBy !== 'recent' && <button type="button" onClick={() => setSortBy('recent')} className="text-xs font-medium text-accent hover:underline">Reset</button>}
                  </div>
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    options={[{ value: 'recent', label: 'Most recent purchase' }, { value: 'name', label: 'Customer name' }, { value: 'spent', label: 'Total spent' }, { value: 'orders', label: 'Number of orders' }]}
                    buttonClassName="bg-panel-2"
                    ariaLabel="Sort customers by"
                  />
                </div>
              )}
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard icon={UserRound} label="Total Customers" value={stats.total} tone="amber" loading={isLoading} />
          <StatCard icon={Wallet} label="Total Revenue" value={formatINR(stats.revenue)} tone="teal" loading={isLoading} />
          <StatCard icon={Sparkles} label="Repeat Customers" value={stats.repeat} tone="pink" loading={isLoading} />
          <StatCard icon={TrendingUp} label="Avg. Order Value" value={formatINR(stats.aov)} tone="violet" loading={isLoading} />
        </div>
        <div className="mt-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or phone..." />
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
              rowKey={(c) => c.id}
              loading={isLoading}
              emptyMessage="No customers match your search."
              onRowClick={(c) => navigate(`/customers/${c.id}`)}
            />
          </div>
          <div className="md:hidden">
            {isLoading ? (
              <ul className="flex flex-col gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="h-28 animate-pulse rounded-xl border border-edge bg-panel-2/40" />
                ))}
              </ul>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-edge bg-panel px-4 py-10 text-center text-sm text-ink-dim">
                No customers match your search.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {filtered.map((c) => (
                  <li key={c.id} className="rounded-xl border border-edge bg-panel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/customers/${c.id}`}
                        className="min-w-0 flex-1 truncate text-sm font-medium underline-offset-4 hover:text-accent hover:underline"
                      >
                        {c.name}
                      </Link>
                      <span className="text-sm font-semibold">{formatINR(c.totalSpent)}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-ink-dim">
                      {c.phone}
                      {c.email && ` · ${c.email}`}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-edge pt-2.5 text-xs text-ink-dim">
                      <span>
                        {c.orders} order{c.orders === 1 ? '' : 's'}
                      </span>
                      <span>Last purchase: {formatDateTime(c.lastPurchase)}</span>
                    </div>
                    <button onClick={() => setDeleting(c)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10"><Trash2 size={13} /> Delete customer</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
      {deleting && <ConfirmDialog title="Delete customer?" message={`Delete ${deleting.name}? Their customer profile will be removed, but recorded invoices will remain available in the database.`} onClose={() => deleteMutation.isPending ? null : setDeleting(null)} onConfirm={() => deleteMutation.mutate(deleting.id)} busy={deleteMutation.isPending} />}
    </div>
  )
}
