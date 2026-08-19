import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

// Styled replacement for native <select>. `options` accepts strings or
// { value, label, disabled }. onChange receives the option's value.
export default function Select({
  value,
  onChange,
  options,
  placeholder = '—',
  disabled = false,
  className = '',
  buttonClassName = '',
  ariaLabel,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }))
  const current = opts.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-edge bg-panel px-3 py-2.5 text-sm transition-colors hover:border-accent/50 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`}
      >
        <span className={`truncate ${current ? '' : 'text-ink-dim'}`}>
          {current?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-ink-dim transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-edge bg-panel p-1 shadow-xl shadow-black/30"
        >
          {opts.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                disabled={o.disabled}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-35 ${
                  o.value === value ? 'bg-accent/10 text-accent' : 'hover:bg-panel-2'
                }`}
              >
                <span className="truncate">{o.label}</span>
                {o.value === value && <Check size={13} className="shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
