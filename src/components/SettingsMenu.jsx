import { useEffect, useRef, useState } from 'react'
import { Check, Settings } from 'lucide-react'

const PALETTES = [
  { id: 'default', label: 'Olive Green', swatch: 'linear-gradient(135deg, #1d221e 50%, #a3e635 50%)' },
  { id: 'mono', label: 'Black & White', swatch: 'linear-gradient(135deg, #111 50%, #fff 50%)' },
]

// Colour theme picker. `direction` controls where the popover opens:
// 'up' for the desktop sidebar footer, 'down' for the mobile header.
export default function SettingsMenu({ withLabel = false, direction = 'down' }) {
  const [open, setOpen] = useState(false)
  const [palette, setPalette] = useState(() => localStorage.getItem('og-palette') ?? 'default')
  const ref = useRef(null)

  useEffect(() => {
    document.documentElement.classList.toggle('mono', palette === 'mono')
    localStorage.setItem('og-palette', palette)
  }, [palette])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-dim transition-colors hover:bg-panel-2 hover:text-ink',
          withLabel ? 'w-full' : '',
        ].join(' ')}
        aria-label="Theme settings"
        title="Theme settings"
      >
        <Settings size={16} />
        {withLabel && 'Theme'}
      </button>

      {open && (
        <div
          className={`absolute z-50 w-52 rounded-xl border border-edge bg-panel p-2 shadow-xl shadow-black/30 ${
            direction === 'up' ? 'bottom-full left-0 mb-2' : 'right-0 top-full mt-2'
          }`}
        >
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-dim">
            Colour theme
          </div>
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPalette(p.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-panel-2"
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-edge"
                style={{ background: p.swatch }}
              />
              <span className="flex-1 text-left">{p.label}</span>
              {palette === p.id && <Check size={14} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
