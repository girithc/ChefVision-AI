import { ArrowRight, ChefHat, ScanLine } from 'lucide-react'
import { Button } from '@styles/ui/button'

export function HeroSection() {
  return (
    <section className="glass-panel rounded-lg p-8 sm:p-12">
      <div className="max-w-3xl">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
          <ChefHat className="size-3.5" />
          AI kitchen intelligence
        </p>
        <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl">
          Turn receipts into kitchen clarity.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
          ChefVision reads invoices, normalizes ingredients, tracks usage, and helps
          your team see what is happening across every service.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild>
            <a href="#platform">
              Start scanning
              <ArrowRight />
            </a>
          </Button>
          <Button variant="glass">
            <ScanLine />
            See a live scan
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Processing accuracy', value: '98.2%' },
          { label: 'Time saved weekly', value: '11 hrs' },
          { label: 'Connected tools', value: '24' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-emerald-100 bg-emerald-50/70 p-4"
          >
            <div className="text-2xl font-semibold text-slate-950">{item.value}</div>
            <div className="mt-1 text-sm text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
