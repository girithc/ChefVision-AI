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
    <div className="relative h-screen overflow-hidden bg-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(134,239,172,0.44),transparent_30%),radial-gradient(circle_at_82%_8%,rgba(187,247,208,0.5),transparent_28%),radial-gradient(circle_at_55%_105%,rgba(74,222,128,0.26),transparent_42%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(65deg,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]"
      />

      <div className="flex h-full">
        <aside className="h-full shrink-0 w-20 sm:w-24">
          <SidebarNav
            items={navItems}
            activeId={activePage}
            onNavigate={setActivePage}
          />
        </aside>

        <main className="h-full min-w-0 flex-1 overflow-y-auto">
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
    </div>
  )
}
