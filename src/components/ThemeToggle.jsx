import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ withLabel = false }) {
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'))

  useEffect(() => {
    document.documentElement.classList.toggle('light', light)
    localStorage.setItem('og-theme', light ? 'light' : 'dark')
  }, [light])

  return (
    <button
      onClick={() => setLight((l) => !l)}
      className={[
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-dim transition-colors hover:bg-panel-2 hover:text-ink',
        withLabel ? 'w-full' : '',
      ].join(' ')}
      aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
      title={light ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {light ? <Moon size={16} /> : <Sun size={16} />}
      {withLabel && (light ? 'Dark mode' : 'Light mode')}
    </button>
  )
}
