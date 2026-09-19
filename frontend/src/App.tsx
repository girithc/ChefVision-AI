import { useState } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { SidebarNav } from '@styles/ui/sidebar-nav'
import { LandingPage } from '@/landing/LandingPage'
import { ProductPage } from '@/product/ProductPage'

const navItems = [
  { id: 'landing', label: 'Landing' },
  { id: 'product', label: 'Product' },
  { id: 'dashboard', label: 'Dashboard' },
]

export default function App() {
  const [activePage, setActivePage] = useState('landing')

  return (
    <div className="flex min-h-screen bg-transparent">
      <aside className="sticky top-0 h-screen w-24 shrink-0 bg-transparent">
        <SidebarNav
          items={navItems}
          activeId={activePage}
          onNavigate={setActivePage}
        />
      </aside>

      <main className="ml-2 mr-4 min-w-0 flex-1 bg-transparent border border-dashed border-red-500 sm:ml-3 sm:mr-6">
        <div>
        {activePage === 'landing' ? (
          <LandingPage />
        ) : activePage === 'product' ? (
          <ProductPage />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="glass-panel w-full max-w-md rounded-lg p-8 text-center">
              <LayoutDashboard className="mx-auto size-8 text-emerald-600" />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">Dashboard</h2>
              <p className="mt-2 text-sm text-slate-600">
                The dashboard view is coming next.
              </p>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  )
}
