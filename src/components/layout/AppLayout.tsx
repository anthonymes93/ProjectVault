import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { QuickAddModal } from '../projects/QuickAddModal'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-surface-0">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <QuickAddModal />
    </div>
  )
}
