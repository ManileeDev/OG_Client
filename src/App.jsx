import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { BillingProvider } from './context/BillingContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import BillingPage from './pages/billing/BillingPage'
import InventoryPage from './pages/inventory/InventoryPage'
import CustomersPage from './pages/customers/CustomersPage'
import CustomerHistoryPage from './pages/customers/CustomerHistoryPage'
import CouponsPage from './pages/coupons/CouponsPage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'
// import AnalyticsPage from './pages/analytics/AnalyticsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <BillingPage /> },
      // { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/:customerId', element: <CustomerHistoryPage /> },
      { path: 'coupons', element: <CouponsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function AuthenticatedApp() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-ink">
        <div className="flex flex-col items-center gap-5 text-center" role="status" aria-live="polite">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-[auth-spin_1.2s_linear_infinite] rounded-full border-2 border-edge border-t-accent" />
            <div className="flex h-12 w-12 animate-[auth-pulse_1.8s_ease-in-out_infinite] items-center justify-center rounded-full bg-panel text-lg font-black tracking-[0.2em] text-accent">
              OG
            </div>
          </div>
          <div>
            <p className="font-display text-2xl text-ink">OG Clothing</p>
            <p className="mt-1 text-sm text-ink-dim">Preparing your billing desk<span className="animate-pulse">...</span></p>
          </div>
        </div>
      </main>
    )
  }
  if (!user) return <LoginPage />

  return (
    <BillingProvider><RouterProvider router={router} /></BillingProvider>
  )
}

export default function App() {
  return <AuthProvider><AuthenticatedApp /></AuthProvider>
}
