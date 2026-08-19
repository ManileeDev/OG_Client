// Sticky page top on desktop: the header row plus anything passed as
// children (e.g. stat cards) stays pinned while the content scrolls.
export default function PageHeader({ kicker, title, subtitle, action, children }) {
  return (
    <div className="mb-4 lg:sticky lg:top-0 lg:z-30 lg:-mx-8 lg:-mt-8 lg:bg-surface/95 lg:px-8 lg:pb-2 lg:pt-8 lg:backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {kicker}
          </div>
          <h1 className="font-display mt-1 text-3xl font-bold sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-dim">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
