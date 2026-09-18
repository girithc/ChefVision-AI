import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@styles/ui/card'

const inventory = [
  { name: 'Chicken Breast', stock: '34 lb', target: '50 lb', status: '72%' },
  { name: 'Arborio Rice', stock: '18 lb', target: '20 lb', status: '90%' },
  { name: 'Basil', stock: '2.2 lb', target: '6 lb', status: '37%' },
]

export function InventoryPanel() {
  return (
    <section className="glass-panel rounded-l-lg rounded-r-none p-6">
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">
        Inventory snapshot
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Current stock after the latest received invoices.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {inventory.map((item) => (
          <Card key={item.name} className="rounded-lg">
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>
                {item.stock} on hand · {item.target} target
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: item.status }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
