import type { ComponentType } from 'react'
import {
  Calculator,
  CalendarClock,
  Camera,
  ChefHat,
  ClipboardList,
  Mail,
  Mic,
  PackageCheck,
  PhoneCall,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  TriangleAlert,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Badge } from '@styles/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@styles/ui/card'

type Feature = {
  icon: ComponentType<{ className?: string }>
  title: string
  copy: string
}

const features: Feature[] = [
  {
    icon: ReceiptText,
    title: 'Invoice OCR & purchasing automation',
    copy: 'Photograph invoices, extract line items, normalize ingredients, update inventory, and compare vendor prices.',
  },
  {
    icon: TrendingUp,
    title: 'Inventory prediction & auto-replenishment',
    copy: 'Forecast ingredient demand from sales, recipes, waste, lead times, and events; then generate reorder quantities.',
  },
  {
    icon: ChefHat,
    title: 'Recipe/BOM depletion',
    copy: 'Turn POS sales into theoretical ingredient usage and flag variance before it becomes a stock problem.',
  },
  {
    icon: Camera,
    title: 'Waste tracking with photos & voice',
    copy: 'Log spoilage, overproduction, and kitchen errors by photo or speech, then feed insights back into forecasts.',
  },
  {
    icon: Mic,
    title: 'Hands-free inventory & prep notes',
    copy: 'Capture counts, prep logs, reorder requests, and low-stock alerts without stopping kitchen work.',
  },
  {
    icon: PackageCheck,
    title: 'Receiving & delivery verification',
    copy: 'Compare ordered versus received items, update inventory by received quantity, and draft discrepancy emails.',
  },
  {
    icon: Mail,
    title: 'Supplier communication agent',
    copy: 'Parse vendor emails, summarize price updates and substitutions, compare costs, and draft replies.',
  },
  {
    icon: PhoneCall,
    title: 'Phone & voicemail automation',
    copy: 'Transcribe calls, extract reservations and catering orders, summarize voicemails, and create follow-ups.',
  },
  {
    icon: CalendarClock,
    title: 'Reservations & demand forecasting',
    copy: 'Use reservations, walk-ins, weather, holidays, and events to forecast covers and adjust prep.',
  },
  {
    icon: Calculator,
    title: 'Menu engineering & food-cost analysis',
    copy: 'Calculate dish cost, margin, and food-cost percentage, then recommend price or portion changes.',
  },
  {
    icon: Users,
    title: 'Staff scheduling automation',
    copy: 'Generate station-level shift plans from forecasted demand, availability, and labor-cost targets.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance, temperature & safety logs',
    copy: 'Capture temperatures and safety checks by voice, maintain HACCP records, and summarize compliance.',
  },
  {
    icon: ShoppingCart,
    title: 'Smart reorder & purchase-order agent',
    copy: 'Draft vendor-aware purchase orders from forecasted demand, par levels, lead times, and supplier prices.',
  },
  {
    icon: TriangleAlert,
    title: 'Stockout prevention',
    copy: 'Monitor theoretical inventory, warn before items run out, and suggest substitutes or prep adjustments.',
  },
  {
    icon: ClipboardList,
    title: 'End-of-day operational report',
    copy: 'Summarize sales, waste, inventory variance, labor, supplier issues, and next-day recommendations.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="space-y-4">
      <div className="glass-panel rounded-lg p-6">
        <Badge>Restaurant AI workflows</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
          Every operating layer, connected.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          ChefVision turns invoices, sales, recipes, voice notes, and supplier activity into clean
          inventory intelligence — from the first scanned receipt to the next purchase order.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="rounded-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <feature.icon className="size-4" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.copy}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
