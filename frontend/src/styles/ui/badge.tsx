import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@styles/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-emerald-300/30 bg-emerald-400/15 text-emerald-100',
        neutral: 'border-white/15 bg-white/10 text-slate-200',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
