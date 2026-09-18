import * as React from 'react'
import { cn } from '@styles/lib/utils'

type SidebarNavItem = {
  id: string
  label: string
  icon?: React.ReactNode
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
        'flex h-full w-20 flex-col items-center justify-between bg-transparent px-1 py-5 sm:w-24 sm:px-2',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-lg font-bold text-emerald-700">
          C
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {items.map((item) => {
            const active = item.id === activeId
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 w-full flex-col items-center justify-center gap-1.5 rounded-md border text-slate-600 transition-colors',
                  active
                    ? 'glass-active border-emerald-300 text-emerald-800'
                    : 'border-transparent hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-800',
                )}
              >
                {item.icon}
                <span className="truncate px-1 text-[10px] font-medium leading-none tracking-wide">
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
