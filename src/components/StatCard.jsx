const TONES = {
  lime: 'bg-accent/10 text-accent',
  teal: 'bg-teal-400/10 text-teal-300',
  amber: 'bg-primary/10 text-primary',
  red: 'bg-danger/10 text-danger',
  violet: 'bg-violet-400/10 text-violet-300',
  neutral: 'bg-panel-2 text-ink-dim',
  pink: 'bg-pink-400/10 text-pink-300',
}

export default function StatCard({ icon: Icon, label, value, tone = 'neutral', loading = false }) {
  return (
    <div className="min-w-0 rounded-xl border border-edge bg-panel p-4 sm:p-5">
      <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${TONES[tone]}`}>
        <Icon size={16} />
      </div>
      {loading ? (
        <div className="h-7 w-20 animate-pulse rounded bg-panel-2 sm:h-8" />
      ) : (
        <div className="truncate text-xl font-bold sm:text-2xl" title={String(value)}>
          {value}
        </div>
      )}
      <div className="mt-1 text-xs text-ink-dim">{label}</div>
    </div>
  )
}
