import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { BarChart3, ReceiptText, ShoppingBag, Users, Wallet, Store, Wifi } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { apiGet } from '../../api/client'
import { formatINR } from '../../lib/format'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import ErrorState from '../../components/ErrorState'

const CHANNELS = [
  { key: 'in_store', label: 'In store', color: '#84cc16', Icon: Store },
  { key: 'online', label: 'Online', color: '#14b8a6', Icon: Wifi },
]

const TOOLTIP_STYLE = {
  contentStyle: { background: 'var(--color-panel-2)', border: '1px solid var(--color-edge)', borderRadius: 8 },
  itemStyle: { color: 'var(--color-ink)' },
  labelStyle: { color: 'var(--color-ink-dim)' },
}

function Section({ title, eyebrow, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-edge bg-panel p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  )
}

function RankedList({ rows, valueLabel }) {
  const max = Math.max(...rows.map((row) => row.value), 0)
  if (!rows.length) return <p className="py-8 text-center text-sm text-ink-dim">No recorded data yet.</p>
  return <div className="space-y-4">{rows.map((row, index) => (
    <div key={row.name}>
      <div className="mb-1.5 flex items-center gap-3 text-sm">
        <span className="w-5 font-mono text-xs text-ink-dim">0{index + 1}</span>
        <span className="min-w-0 flex-1 truncate">{row.name}</span>
        <span className="shrink-0 text-xs text-ink-dim">{valueLabel(row.value)}</span>
      </div>
      <div className="ml-8 h-1.5 overflow-hidden rounded-full bg-panel-2">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max((row.value / max) * 100, 4)}%` }} />
      </div>
    </div>
  ))}</div>
}

export default function AnalyticsPage() {
  const { data: customers = [], isLoading: customersLoading, error, refetch } = useQuery({ queryKey: ['customers'], queryFn: () => apiGet('/customers') })
  const invoiceQueries = useQueries({ queries: customers.map((customer) => ({
    queryKey: ['customer-invoices', customer.id],
    queryFn: () => apiGet(`/customers/${customer.id}/invoices`),
    staleTime: 60_000,
  })) })
  const loading = customersLoading || invoiceQueries.some((query) => query.isLoading)
  const invoices = invoiceQueries.flatMap((query) => query.data ?? [])

  const analytics = useMemo(() => {
    const monthly = invoices.reduce((result, invoice) => {
      const key = invoice.createdAt?.slice(0, 7)
      if (key) result[key] = (result[key] ?? 0) + invoice.total
      return result
    }, {})
    const productUnits = invoices.reduce((result, invoice) => {
      invoice.items.forEach((item) => { result[item.name] = (result[item.name] ?? 0) + item.qty })
      return result
    }, {})
    const customerSpend = customers.map((customer, index) => ({
      name: customer.name,
      value: (invoiceQueries[index]?.data ?? []).reduce((sum, invoice) => sum + invoice.total, 0),
    })).filter((row) => row.value > 0).sort((a, b) => b.value - a.value).slice(0, 5)
    const channelData = CHANNELS.map(({ key, label, color }) => ({ name: label, value: invoices.filter((invoice) => invoice.channel === key).length, color }))
    return {
      revenue: invoices.reduce((sum, invoice) => sum + invoice.total, 0),
      monthly: Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([key, value]) => ({ name: new Date(`${key}-02`).toLocaleDateString('en-GB', { month: 'short' }), value })),
      products: Object.entries(productUnits).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, value]) => ({ name, value })),
      customerSpend,
      channelData,
    }
  }, [invoices, customers, invoiceQueries])

  if (error) return <div className="mx-auto max-w-7xl"><ErrorState error={error} onRetry={refetch} /></div>

  const channelTotal = analytics.channelData.reduce((sum, row) => sum + row.value, 0)
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader kicker="Business pulse" title="Analytics" subtitle="Know what is moving, who is returning, and where sales happen." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Recorded Revenue" value={formatINR(analytics.revenue)} tone="teal" loading={loading} />
        <StatCard icon={ReceiptText} label="Recorded Bills" value={invoices.length} tone="amber" loading={loading} />
        <StatCard icon={Users} label="Active Customers" value={customers.length} tone="pink" loading={loading} />
        <StatCard icon={ShoppingBag} label="Average Bill" value={formatINR(invoices.length ? analytics.revenue / invoices.length : 0)} tone="violet" loading={loading} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Section title="Sales trend" eyebrow="Revenue / last six months">
          {analytics.monthly.length ? <ResponsiveContainer width="100%" height={235}>
            <BarChart data={analytics.monthly} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-edge)" strokeDasharray="3 3" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-dim)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-dim)', fontSize: 11 }} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value) => [formatINR(value), 'Revenue']} />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[5, 5, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer> : <p className="py-20 text-center text-sm text-ink-dim">New invoices will form the sales trend.</p>}
        </Section>

        <Section title="Channel mix" eyebrow="Bills by origin">
          {channelTotal ? <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.channelData} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={4} stroke="none">
                  {analytics.channelData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={(value) => [`${value} bills`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-3xl tracking-tight">{channelTotal}</strong><span className="text-xs text-ink-dim">bills</span></div>
          </div> : <p className="py-20 text-center text-sm text-ink-dim">No channel data yet.</p>}
          <div className="mt-2 grid grid-cols-2 gap-3">{analytics.channelData.map((row) => { const Icon = CHANNELS.find((channel) => channel.label === row.name).Icon; return <div key={row.name} className="flex items-center gap-2 text-xs"><Icon size={14} style={{ color: row.color }} /><span className="text-ink-dim">{row.name}</span><strong className="ml-auto">{row.value}</strong></div> })}</div>
        </Section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Section title="What sells" eyebrow="Top products"><RankedList rows={analytics.products} valueLabel={(value) => `${value} pcs`} /></Section>
        <Section title="Who returns" eyebrow="Top customers"><RankedList rows={analytics.customerSpend} valueLabel={formatINR} /></Section>
      </div>
      <p className="mt-4 text-xs text-ink-dim">Charts use invoices currently available through customer history. Historical customer totals remain visible in Customers.</p>
    </div>
  )
}
