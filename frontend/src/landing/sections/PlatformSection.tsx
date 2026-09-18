import { ChefHat, LineChart, PackageOpen, ScanLine } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@styles/ui/card'

const features = [
  {
    icon: ScanLine,
    title: 'Receipt intelligence',
    copy: 'Extract vendors, quantities, costs, and dates with human-review workflows.',
  },
  {
    icon: PackageOpen,
    title: 'Ingredient library',
    copy: 'Turn messy line items into clean inventory records your team can trust.',
  },
  {
    icon: LineChart,
    title: 'Usage forecasting',
    copy: 'Connect purchasing patterns to service volume and upcoming demand.',
  },
  {
    icon: ChefHat,
    title: 'Kitchen-ready UI',
    copy: 'Built for speed during prep, service, receiving, and end-of-week reviews.',
  },
]

export function PlatformSection() {
  return (
    <section id="platform" className="space-y-4">
      <div className="glass-panel rounded-lg p-6">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">
          One connected product
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Every layer is designed around the same ingredient data — from the first
          scanned receipt to the final forecast.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="rounded-lg">
            <CardHeader>
              <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-200">
                <feature.icon className="size-4" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.copy}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
