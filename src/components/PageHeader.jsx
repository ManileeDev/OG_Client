export default function PageHeader({ kicker, title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {kicker}
        </div>
        <h1 className="font-display mt-1 text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-dim">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
