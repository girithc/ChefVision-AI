import { ReceiptIntelligence } from './sections/ReceiptIntelligence'
import { InventoryPanel } from './sections/InventoryPanel'

export function ProductPage() {
  return (
    <div className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
      <ReceiptIntelligence />
      <InventoryPanel />
    </div>
  )
}
