import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { BillingProvider } from './context/BillingContext'
import Layout from './components/Layout'
import BillingPage from './pages/billing/BillingPage'
import InventoryPage from './pages/inventory/InventoryPage'
import CustomersPage from './pages/customers/CustomersPage'
import CustomerHistoryPage from './pages/customers/CustomerHistoryPage'
import CouponsPage from './pages/coupons/CouponsPage'

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
    ],
  },
])

export default function App() {
  return (
    <BillingProvider>
      <RouterProvider router={router} />
    </BillingProvider>
  )
}
