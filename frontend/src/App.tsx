import { useState } from 'react'
import { ChefHat, LayoutDashboard, ScanLine } from 'lucide-react'
import { SidebarNav } from '@styles/ui/sidebar-nav'
import { LandingPage } from '@/landing/LandingPage'
import { ProductPage } from '@/product/ProductPage'

const navItems = [
  { id: 'landing', label: 'Landing', icon: <ChefHat className="size-4" /> },
  { id: 'product', label: 'Product', icon: <ScanLine className="size-4" /> },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
]

export default function App() {
  const [activePage, setActivePage] = useState('landing')

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <aside className="h-full w-20 shrink-0 bg-transparent sm:w-24">
        <SidebarNav
          items={navItems}
          activeId={activePage}
          onNavigate={setActivePage}
        />
      </aside>

      <main className="h-full min-w-0 flex-1 overflow-y-auto bg-transparent">
        {activePage === 'landing' ? (
          <LandingPage />
        ) : activePage === 'product' ? (
          <ProductPage />
        ) : (
          <div className="flex h-full items-center justify-center px-6">
            <div className="glass-panel w-full max-w-md rounded-lg p-8 text-center">
              <LayoutDashboard className="mx-auto size-8 text-emerald-600" />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">Dashboard</h2>
              <p className="mt-2 text-sm text-slate-600">
                The dashboard view is coming next.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
