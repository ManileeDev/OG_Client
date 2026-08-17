import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { UserRound, Wallet, Sparkles, TrendingUp } from 'lucide-react'
import { apiGet } from '../../api/client'
import { formatDate, formatINR } from '../../lib/format'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import SearchInput from '../../components/SearchInput'
import DataTable from '../../components/DataTable'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiGet('/customers'),
  })

  const stats = useMemo(() => {
    const revenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    const orders = customers.reduce((sum, c) => sum + c.orders, 0)
    return {
      total: customers.length,
      revenue,
      repeat: customers.filter((c) => c.orders > 1).length,
      aov: orders > 0 ? revenue / orders : 0,
    }
  }, [customers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    )
  }, [customers, search])

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
    { header: 'Last Purchase', cell: (c) => formatDate(c.lastPurchase), className: 'text-ink-dim' },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Relationships"
        title="Customers"
        subtitle="Everyone who has walked out with an OG bag."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={UserRound} label="Total Customers" value={stats.total} tone="amber" loading={isLoading} />
        <StatCard icon={Wallet} label="Total Revenue" value={formatINR(stats.revenue)} tone="teal" loading={isLoading} />
        <StatCard icon={Sparkles} label="Repeat Customers" value={stats.repeat} tone="pink" loading={isLoading} />
        <StatCard icon={TrendingUp} label="Avg. Order Value" value={formatINR(stats.aov)} tone="violet" loading={isLoading} />
      </div>

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or phone..." />
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Could not load customers: {error.message}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(c) => c.id}
          loading={isLoading}
          emptyMessage="No customers match your search."
        />
      )}
    </div>
  )
}
