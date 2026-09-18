import * as React from 'react'
import { cn } from '@styles/lib/utils'

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'h-10 w-full rounded-md border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-300/50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
