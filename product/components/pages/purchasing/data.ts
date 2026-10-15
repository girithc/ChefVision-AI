export type OrderGuideItem = {
  id: string;
  name: string;
  vendor: string;
  category: string;
  location: string;
  parLevel: number;
  onHand: number;
  unit: string;
  caseSize: string;
  lastPrice: number;
};

export type PurchaseOrderStatus = "Draft" | "Placed" | "Received" | "Invoiced";

export type PurchaseOrder = {
  id: string;
  vendor: string;
  outlet: string;
  date: string;
  itemCount: number;
  total: number;
  status: PurchaseOrderStatus;
  via: string;
  invoiceRef?: string;
};

export const vendors = [
  "Premium Meats Co.",
  "Fresh Produce Co.",
  "Coastal Seafood",
  "Dry Goods Ltd.",
  "Vine & Barrel",
];

/** Shared vendor order guide — one guide, all outlets. */
export const orderGuide: OrderGuideItem[] = [
  { id: "g1", name: "Chicken Breast", vendor: "Premium Meats Co.", category: "Protein", location: "Walk-in cooler", parLevel: 40, onHand: 12, unit: "lb", caseSize: "1 case = 40 lb", lastPrice: 6.2 },
  { id: "g2", name: "Bacon", vendor: "Premium Meats Co.", category: "Protein", location: "Freezer", parLevel: 15, onHand: 14, unit: "lb", caseSize: "1 case = 15 lb", lastPrice: 5.9 },
  { id: "g3", name: "Red Snapper Fillet", vendor: "Coastal Seafood", category: "Seafood", location: "Walk-in cooler", parLevel: 25, onHand: 8, unit: "lb", caseSize: "1 case = 20 lb", lastPrice: 13.0 },
  { id: "g4", name: "Roma Tomato", vendor: "Fresh Produce Co.", category: "Produce", location: "Walk-in cooler", parLevel: 50, onHand: 34, unit: "lb", caseSize: "1 case = 25 lb", lastPrice: 3.68 },
  { id: "g5", name: "Romaine Lettuce", vendor: "Fresh Produce Co.", category: "Produce", location: "Walk-in cooler", parLevel: 30, onHand: 9, unit: "lb", caseSize: "1 case = 12 ct", lastPrice: 2.85 },
  { id: "g6", name: "Bell Peppers", vendor: "Fresh Produce Co.", category: "Produce", location: "Walk-in cooler", parLevel: 15, onHand: 11, unit: "lb", caseSize: "1 case = 10 lb", lastPrice: 1.65 },
  { id: "g7", name: "Cheddar Cheese", vendor: "Dry Goods Ltd.", category: "Dairy", location: "Walk-in cooler", parLevel: 20, onHand: 18, unit: "lb", caseSize: "1 case = 20 lb", lastPrice: 4.4 },
  { id: "g8", name: "Heavy Cream", vendor: "Dry Goods Ltd.", category: "Dairy", location: "Walk-in cooler", parLevel: 12, onHand: 4, unit: "qt", caseSize: "1 case = 12 qt", lastPrice: 3.95 },
  { id: "g9", name: "Extra Virgin Olive Oil", vendor: "Dry Goods Ltd.", category: "Pantry", location: "Dry storage", parLevel: 15, onHand: 11, unit: "L", caseSize: "1 case = 6 L", lastPrice: 18.3 },
  { id: "g10", name: "Arborio Rice", vendor: "Dry Goods Ltd.", category: "Dry goods", location: "Dry storage", parLevel: 20, onHand: 18, unit: "lb", caseSize: "1 bag = 20 lb", lastPrice: 3.1 },
  { id: "g11", name: "All-Purpose Flour", vendor: "Dry Goods Ltd.", category: "Dry goods", location: "Dry storage", parLevel: 50, onHand: 45, unit: "lb", caseSize: "1 sack = 50 lb", lastPrice: 0.55 },
  { id: "g12", name: "Brioche Bun", vendor: "Dry Goods Ltd.", category: "Bakery", location: "Dry storage", parLevel: 90, onHand: 62, unit: "ea", caseSize: "1 case = 72 ea", lastPrice: 0.78 },
  { id: "g13", name: "Flour Tortilla 12\"", vendor: "Dry Goods Ltd.", category: "Bakery", location: "Main kitchen", parLevel: 100, onHand: 84, unit: "ea", caseSize: "1 case = 100 ea", lastPrice: 0.45 },
  { id: "g14", name: "Espresso Beans", vendor: "Vine & Barrel", category: "Beverage", location: "Bar", parLevel: 8, onHand: 6.5, unit: "kg", caseSize: "1 case = 6 kg", lastPrice: 14.8 },
  { id: "g15", name: "House Red Wine", vendor: "Vine & Barrel", category: "Beverage", location: "Bar", parLevel: 24, onHand: 11, unit: "btl", caseSize: "1 case = 12 btl", lastPrice: 9.4 },
];

export function suggestedQty(item: OrderGuideItem): number {
  return Math.max(0, Math.round((item.parLevel - item.onHand) * 10) / 10);
}

export const initialOrders: PurchaseOrder[] = [
  { id: "PO-D-2261", vendor: "Premium Meats Co.", outlet: "Downtown", date: "Oct 12", itemCount: 28, total: 412, status: "Invoiced", via: "Vendor portal", invoiceRef: "INV-8841" },
  { id: "PO-D-2260", vendor: "Fresh Produce Co.", outlet: "Downtown", date: "Oct 10", itemCount: 12, total: 96.2, status: "Invoiced", via: "Vendor portal", invoiceRef: "INV-8838" },
  { id: "PO-D-2259", vendor: "Coastal Seafood", outlet: "Downtown", date: "Oct 9", itemCount: 9, total: 398.4, status: "Invoiced", via: "Email", invoiceRef: "INV-8829" },
  { id: "PO-R-1140", vendor: "Dry Goods Ltd.", outlet: "Riverside", date: "Oct 11", itemCount: 18, total: 540, status: "Placed", via: "Vendor portal" },
  { id: "PO-A-0775", vendor: "US Foods", outlet: "Airport (licensed)", date: "Oct 11", itemCount: 14, total: 388, status: "Draft", via: "—" },
];
