import { ReceiptIntelligence } from './sections/ReceiptIntelligence'
import { InventoryPanel } from './sections/InventoryPanel'

export function ProductPage() {
  return (
    <div className="space-y-4">
      <ReceiptIntelligence />
      <InventoryPanel />
    </div>
  )
}
