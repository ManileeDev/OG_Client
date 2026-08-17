import { NavLink } from 'react-router-dom'
import { ReceiptText, Package, Users, Tag } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export const NAV_ITEMS = [
  { to: '/', label: 'Billing', icon: ReceiptText },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/coupons', label: 'Coupons', icon: Tag },
]

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-bold text-surface">
        OG
      </div>
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
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-edge bg-panel p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto">
        <Brand />
        <div className="mt-8 mb-2 text-[10px] uppercase tracking-[0.2em] text-ink-dim">
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
        <div className="mt-auto border-t border-edge pt-3">
          <ThemeToggle withLabel />
        </div>
      </aside>

      {/* Mobile / tablet: brand on top, nav as a fixed footer bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-edge bg-panel px-4 py-3 lg:hidden">
        <Brand />
        <ThemeToggle />
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-edge bg-panel pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
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
