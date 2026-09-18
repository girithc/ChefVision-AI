import { ReceiptIntelligence } from './sections/ReceiptIntelligence'
import { InventoryPanel } from './sections/InventoryPanel'

export function ProductPage() {
  return (
    <div className="space-y-4 py-5 pl-4 sm:py-6 sm:pl-6">
      <ReceiptIntelligence />
      <InventoryPanel />
    </div>
  )
}
