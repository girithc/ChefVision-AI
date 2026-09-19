import * as React from 'react'
import { cn } from '@styles/lib/utils'

type SidebarNavItem = {
  id: string
  label: string
}

type SidebarNavProps = {
  items: SidebarNavItem[]
  activeId: string
  onNavigate: (id: string) => void
  footer?: React.ReactNode
  className?: string
}

export function SidebarNav({
  items,
  activeId,
  onNavigate,
  footer,
  className,
}: SidebarNavProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'flex h-full w-28 flex-col items-center justify-between bg-transparent py-5 pl-1 pr-2',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-10 items-center justify-center text-lg font-bold text-emerald-700">
          C
        </div>

        <div className="mt-5 flex flex-col items-center gap-2">
          {items.map((item) => {
            const active = item.id === activeId
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'mx-auto flex size-24 items-center justify-center rounded-md bg-transparent p-2 text-slate-600 transition-colors',
                  active ? 'text-emerald-700' : 'hover:text-emerald-700',
                )}
              >
                <span className="text-center text-xs font-medium uppercase leading-none tracking-wide">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">{footer}</div>
    </nav>
  )
}
