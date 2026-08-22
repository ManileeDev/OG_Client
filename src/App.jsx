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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <BillingPage /> },
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

  if (loading) return <div className="min-h-screen bg-surface" />
  if (!user) return <LoginPage />

  return (
    <BillingProvider><RouterProvider router={router} /></BillingProvider>
  )
}

export default function App() {
  return <AuthProvider><AuthenticatedApp /></AuthProvider>
}
