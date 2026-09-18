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
        'flex h-full flex-col items-center justify-between bg-transparent px-2 py-5 sm:px-3',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md border border-emerald-300/25 bg-emerald-400/15 text-lg font-bold text-emerald-200">
          C
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {items.map((item) => {
            const active = item.id === activeId
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                title={item.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex h-11 w-11 flex-col items-center justify-center rounded-md border text-slate-300 transition-colors',
                  active
                    ? 'glass-active border-emerald-300/40 text-emerald-100'
                    : 'border-transparent hover:border-white/15 hover:bg-white/10 hover:text-white',
                )}
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
                <span className="pointer-events-none absolute left-12 z-20 hidden whitespace-nowrap rounded-md border border-white/10 bg-slate-950/85 px-2 py-1 text-xs text-slate-100 shadow-xl group-hover:block">
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
