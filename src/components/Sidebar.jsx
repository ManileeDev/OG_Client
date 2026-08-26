import { NavLink } from 'react-router-dom'
import { LogOut, ReceiptText, Package, Users, Tag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import SettingsMenu from './SettingsMenu'

export const NAV_ITEMS = [
  { to: '/', label: 'Billing', icon: ReceiptText },
  // { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/coupons', label: 'Coupons', icon: Tag },
]

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <img src="/oglogo.jpg" alt="The OG Clothing" className="brand-logo h-12 w-12 rounded-[10%] object-contain" />
      <div>
        <div className="font-display text-lg font-semibold leading-tight">OG Clothing</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-dim">Menswear</div>
      </div>
    </div>
  )
}

function navClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-accent/10 font-medium text-accent border-l-2 border-accent'
      : 'text-ink-dim hover:bg-panel-2 hover:text-ink',
  ].join(' ')
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-edge bg-panel p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto">
        <Brand />
        <div className="mt-4 mb-2 text-[10px] uppercase tracking-[0.2em] text-ink-dim">
          Workspace
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={navClass}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-edge pt-3">
          <ThemeToggle withLabel />
          <SettingsMenu withLabel direction="up" />
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-dim hover:bg-panel-2 hover:text-ink">
            <LogOut size={16} />
            <span className="flex-1 text-left">Sign out</span>
            <span className="text-xs">{user.username}</span>
          </button>
        </div>
      </aside>

      {/* Mobile / tablet: brand on top, nav as a fixed footer bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-edge bg-panel px-4 py-3 lg:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <SettingsMenu direction="down" />
          <button onClick={logout} className="p-2 text-ink-dim hover:text-ink" aria-label="Sign out" title={`Sign out ${user.username}`}>
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-edge bg-panel pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex min-w-0 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors sm:text-[11px]',
                isActive ? 'text-accent' : 'text-ink-dim hover:text-ink',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
