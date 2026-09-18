import * as React from 'react'
import { cn } from '@styles/lib/utils'

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'h-10 w-full rounded-md border border-slate-200 bg-white/75 px-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-emerald-400',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
