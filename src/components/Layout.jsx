import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
