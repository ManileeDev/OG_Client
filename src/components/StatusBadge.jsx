const TONES = {
  success: 'bg-success/10 text-success',
  warning: 'bg-orange-400/10 text-orange-400',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-panel-2 text-ink-dim',
}

export default function StatusBadge({ tone = 'neutral', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
