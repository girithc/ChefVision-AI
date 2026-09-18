import { FileUp, ScanLine, Sparkles } from 'lucide-react'
import { Badge } from '@styles/ui/badge'
import { Button } from '@styles/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@styles/ui/card'

export function ReceiptIntelligence() {
  return (
    <section className="glass-panel rounded-lg p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge>Live product</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            Receipt intelligence
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            Scan or upload invoices, review normalized items, and publish clean data
            to inventory.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass">
            <FileUp />
            Upload
          </Button>
          <Button>
            <ScanLine />
            Scan
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Today’s inbox</CardTitle>
            <CardDescription>3 receipts awaiting review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { vendor: 'Fresh Produce Co.', status: 'Extracted', items: '24 items' },
              { vendor: 'Coastal Seafood', status: 'Reviewing', items: '17 items' },
              { vendor: 'Dry Goods Ltd.', status: 'Queued', items: '31 items' },
            ].map((receipt) => (
              <div
                key={receipt.vendor}
                className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-white">{receipt.vendor}</div>
                  <div className="text-xs text-slate-400">{receipt.items}</div>
                </div>
                <Badge variant="neutral">{receipt.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Normalization</CardTitle>
            <CardDescription>Suggested inventory matches.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { raw: 'org tom 5lb', match: 'Organic Tomatoes · 5 lb', confidence: 98 },
              { raw: 'oliv oil extr', match: 'Extra Virgin Olive Oil · 3 L', confidence: 94 },
              { raw: 'chk breast', match: 'Chicken Breast · 12 lb', confidence: 91 },
            ].map((item) => (
              <div key={item.raw} className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="font-mono text-xs text-slate-300">{item.raw}</div>
                <div className="mt-1 text-sm text-white">{item.match}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-200">
                  <Sparkles className="size-3" />
                  {item.confidence}% confidence
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
