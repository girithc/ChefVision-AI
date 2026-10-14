export type InvoiceStatus = "Queued" | "Extracting" | "Needs review" | "Published";

export type InvoiceSource = "Photo" | "PDF" | "Email" | "Integration";

export type InvoiceLine = {
  id: string;
  rawName: string;
  sku: string;
  matchedIngredient: string;
  matchConfidence: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  tax: number;
  charges: number;
  category: string;
};

export type Invoice = {
  id: string;
  supplier: string;
  invoiceNumber: string;
  date: string;
  source: InvoiceSource;
  status: InvoiceStatus;
  lines: InvoiceLine[];
};

export type MatchStatus = "Pending" | "Confirmed" | "Rejected";

export type MatchCandidate = {
  id: string;
  rawName: string;
  sku: string;
  supplier: string;
  matchedIngredient: string;
  confidence: number;
  status: MatchStatus;
};

export type PriceOffer = { supplier: string; price: number; unit: string };

export type PriceRow = {
  ingredient: string;
  offers: PriceOffer[];
  lastPaid: number;
  history: { date: string; price: number }[];
};

export type PriceAlert = {
  id: string;
  ingredient: string;
  supplier: string;
  message: string;
  changePct: number;
};

export const accountingCategories = [
  "Food — Produce",
  "Food — Protein",
  "Food — Dairy",
  "Food — Dry goods",
  "Beverage",
  "Chemicals & sanitation",
  "Packaging",
  "Utilities",
];

export const initialInvoices: Invoice[] = [
  {
    id: "INV-8841",
    supplier: "Coastal Seafood",
    invoiceNumber: "#2041",
    date: "2025-10-10",
    source: "Photo",
    status: "Needs review",
    lines: [
      { id: "l1", rawName: "SNAPPER FILLET 8 LB", sku: "CS-4410", matchedIngredient: "Red Snapper Fillet", matchConfidence: 91, quantity: 8, unit: "lb", unitPrice: 13.0, lineTotal: 104.0, tax: 8.32, charges: 0, category: "Food — Protein" },
      { id: "l2", rawName: "CLAMS 10 LB", sku: "CS-1123", matchedIngredient: "Clams", matchConfidence: 96, quantity: 10, unit: "lb", unitPrice: 6.4, lineTotal: 64.0, tax: 5.12, charges: 0, category: "Food — Protein" },
      { id: "l3", rawName: "DELIVERY FEE", sku: "—", matchedIngredient: "—", matchConfidence: 100, quantity: 1, unit: "ea", unitPrice: 12.5, lineTotal: 12.5, tax: 0, charges: 12.5, category: "Utilities" },
    ],
  },
  {
    id: "INV-8838",
    supplier: "Fresh Produce Co.",
    invoiceNumber: "#7781",
    date: "2025-10-09",
    source: "Email",
    status: "Published",
    lines: [
      { id: "l4", rawName: "ORG TOM 5LB", sku: "FP-2201", matchedIngredient: "Organic Roma Tomatoes", matchConfidence: 99, quantity: 5, unit: "lb", unitPrice: 3.68, lineTotal: 18.4, tax: 1.47, charges: 0, category: "Food — Produce" },
      { id: "l5", rawName: "BABY SPINCH 3LB", sku: "FP-3390", matchedIngredient: "Baby Spinach", matchConfidence: 92, quantity: 3, unit: "lb", unitPrice: 3.75, lineTotal: 11.25, tax: 0.9, charges: 0, category: "Food — Produce" },
    ],
  },
  {
    id: "INV-8835",
    supplier: "Dry Goods Ltd.",
    invoiceNumber: "#7231",
    date: "2025-10-07",
    source: "PDF",
    status: "Extracting",
    lines: [],
  },
  {
    id: "INV-8830",
    supplier: "Vine & Barrel",
    invoiceNumber: "#1120",
    date: "2025-10-05",
    source: "Integration",
    status: "Queued",
    lines: [],
  },
];

export const initialMatchQueue: MatchCandidate[] = [
  { id: "m1", rawName: "SNAPPER FILLET 8 LB", sku: "CS-4410", supplier: "Coastal Seafood", matchedIngredient: "Red Snapper Fillet", confidence: 91, status: "Pending" },
  { id: "m2", rawName: "BABY SPINCH 3LB", sku: "FP-3390", supplier: "Fresh Produce Co.", matchedIngredient: "Baby Spinach", confidence: 92, status: "Pending" },
  { id: "m3", rawName: "EV OO BLEND 3L", sku: "DG-5518", supplier: "Dry Goods Ltd.", matchedIngredient: "Extra Virgin Olive Oil", confidence: 84, status: "Pending" },
  { id: "m4", rawName: "ARBERIO RICE 20", sku: "DG-1102", supplier: "Dry Goods Ltd.", matchedIngredient: "Arborio Rice", confidence: 97, status: "Pending" },
  { id: "m5", rawName: "CHX BRST BNLS SKNLS 40LB", sku: "PM-2210", supplier: "Premium Meats Co.", matchedIngredient: "Chicken Breast", confidence: 98, status: "Pending" },
];

export const priceRows: PriceRow[] = [
  {
    ingredient: "Chicken Breast",
    lastPaid: 6.2,
    offers: [
      { supplier: "Premium Meats Co.", price: 6.2, unit: "lb" },
      { supplier: "Sysco", price: 6.45, unit: "lb" },
      { supplier: "US Foods", price: 6.65, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 5.74 },
      { date: "Sep 2025", price: 6.0 },
      { date: "Oct 2025", price: 6.2 },
    ],
  },
  {
    ingredient: "Organic Roma Tomatoes",
    lastPaid: 3.68,
    offers: [
      { supplier: "Fresh Produce Co.", price: 3.68, unit: "lb" },
      { supplier: "Restaurant Depot", price: 3.9, unit: "lb" },
      { supplier: "Sysco", price: 4.15, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 3.84 },
      { date: "Sep 2025", price: 3.75 },
      { date: "Oct 2025", price: 3.68 },
    ],
  },
  {
    ingredient: "Extra Virgin Olive Oil",
    lastPaid: 18.3,
    offers: [
      { supplier: "Dry Goods Ltd.", price: 18.3, unit: "L" },
      { supplier: "Restaurant Depot", price: 18.9, unit: "L" },
      { supplier: "US Foods", price: 19.5, unit: "L" },
    ],
    history: [
      { date: "Aug 2025", price: 17.26 },
      { date: "Sep 2025", price: 17.8 },
      { date: "Oct 2025", price: 18.3 },
    ],
  },
  {
    ingredient: "Arborio Rice",
    lastPaid: 3.1,
    offers: [
      { supplier: "Dry Goods Ltd.", price: 3.1, unit: "lb" },
      { supplier: "Sysco", price: 3.15, unit: "lb" },
      { supplier: "US Foods", price: 3.25, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 3.1 },
      { date: "Sep 2025", price: 3.1 },
      { date: "Oct 2025", price: 3.1 },
    ],
  },
  {
    ingredient: "Romaine Lettuce",
    lastPaid: 2.85,
    offers: [
      { supplier: "Fresh Produce Co.", price: 2.85, unit: "lb" },
      { supplier: "Restaurant Depot", price: 2.95, unit: "lb" },
      { supplier: "Sysco", price: 3.2, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 2.6 },
      { date: "Sep 2025", price: 2.75 },
      { date: "Oct 2025", price: 2.85 },
    ],
  },
  {
    ingredient: "Cheddar Cheese",
    lastPaid: 4.4,
    offers: [
      { supplier: "US Foods", price: 4.4, unit: "lb" },
      { supplier: "Sysco", price: 4.55, unit: "lb" },
      { supplier: "Restaurant Depot", price: 4.7, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 4.25 },
      { date: "Sep 2025", price: 4.35 },
      { date: "Oct 2025", price: 4.4 },
    ],
  },
  {
    ingredient: "Brioche Buns",
    lastPaid: 0.78,
    offers: [
      { supplier: "Dry Goods Ltd.", price: 0.78, unit: "ea" },
      { supplier: "US Foods", price: 0.82, unit: "ea" },
      { supplier: "Sysco", price: 0.85, unit: "ea" },
    ],
    history: [
      { date: "Aug 2025", price: 0.75 },
      { date: "Sep 2025", price: 0.76 },
      { date: "Oct 2025", price: 0.78 },
    ],
  },
  {
    ingredient: "Red Snapper Fillet",
    lastPaid: 13.0,
    offers: [
      { supplier: "Coastal Seafood", price: 13.0, unit: "lb" },
      { supplier: "Sysco", price: 14.2, unit: "lb" },
      { supplier: "US Foods", price: 14.75, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 12.4 },
      { date: "Sep 2025", price: 12.8 },
      { date: "Oct 2025", price: 13.0 },
    ],
  },
  {
    ingredient: "Unsalted Butter",
    lastPaid: 4.15,
    offers: [
      { supplier: "Restaurant Depot", price: 4.15, unit: "lb" },
      { supplier: "US Foods", price: 4.3, unit: "lb" },
      { supplier: "Sysco", price: 4.35, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 4.1 },
      { date: "Sep 2025", price: 4.12 },
      { date: "Oct 2025", price: 4.15 },
    ],
  },
  {
    ingredient: "Russet Potatoes",
    lastPaid: 0.92,
    offers: [
      { supplier: "Restaurant Depot", price: 0.92, unit: "lb" },
      { supplier: "Fresh Produce Co.", price: 0.98, unit: "lb" },
      { supplier: "Sysco", price: 1.05, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 0.88 },
      { date: "Sep 2025", price: 0.9 },
      { date: "Oct 2025", price: 0.92 },
    ],
  },
  {
    ingredient: "Heavy Cream",
    lastPaid: 3.95,
    offers: [
      { supplier: "Fresh Produce Co.", price: 3.95, unit: "qt" },
      { supplier: "Sysco", price: 4.1, unit: "qt" },
      { supplier: "US Foods", price: 4.25, unit: "qt" },
    ],
    history: [
      { date: "Aug 2025", price: 3.8 },
      { date: "Sep 2025", price: 3.88 },
      { date: "Oct 2025", price: 3.95 },
    ],
  },
  {
    ingredient: "All-Purpose Flour",
    lastPaid: 0.55,
    offers: [
      { supplier: "Dry Goods Ltd.", price: 0.55, unit: "lb" },
      { supplier: "Sysco", price: 0.58, unit: "lb" },
      { supplier: "US Foods", price: 0.6, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 0.54 },
      { date: "Sep 2025", price: 0.55 },
      { date: "Oct 2025", price: 0.55 },
    ],
  },
  {
    ingredient: "Bacon",
    lastPaid: 5.9,
    offers: [
      { supplier: "Premium Meats Co.", price: 5.9, unit: "lb" },
      { supplier: "Sysco", price: 6.15, unit: "lb" },
      { supplier: "US Foods", price: 6.3, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 5.6 },
      { date: "Sep 2025", price: 5.75 },
      { date: "Oct 2025", price: 5.9 },
    ],
  },
  {
    ingredient: "Bell Peppers",
    lastPaid: 1.65,
    offers: [
      { supplier: "Fresh Produce Co.", price: 1.65, unit: "lb" },
      { supplier: "Restaurant Depot", price: 1.7, unit: "lb" },
      { supplier: "Sysco", price: 1.85, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 1.7 },
      { date: "Sep 2025", price: 1.68 },
      { date: "Oct 2025", price: 1.65 },
    ],
  },
  {
    ingredient: "Canola Oil",
    lastPaid: 2.4,
    offers: [
      { supplier: "Sysco", price: 2.4, unit: "L" },
      { supplier: "US Foods", price: 2.45, unit: "L" },
      { supplier: "Dry Goods Ltd.", price: 2.5, unit: "L" },
    ],
    history: [
      { date: "Aug 2025", price: 2.38 },
      { date: "Sep 2025", price: 2.4 },
      { date: "Oct 2025", price: 2.4 },
    ],
  },
  {
    ingredient: "Garlic",
    lastPaid: 3.3,
    offers: [
      { supplier: "Fresh Produce Co.", price: 3.3, unit: "lb" },
      { supplier: "Restaurant Depot", price: 3.45, unit: "lb" },
      { supplier: "Sysco", price: 3.6, unit: "lb" },
    ],
    history: [
      { date: "Aug 2025", price: 3.2 },
      { date: "Sep 2025", price: 3.25 },
      { date: "Oct 2025", price: 3.3 },
    ],
  },
];

export const priceAlerts: PriceAlert[] = [
  { id: "a1", ingredient: "Chicken Breast", supplier: "Premium Meats Co.", message: "Price up 8% since September — last paid $6.20/lb vs $5.74/lb in August.", changePct: 8 },
  { id: "a2", ingredient: "Extra Virgin Olive Oil", supplier: "Dry Goods Ltd.", message: "Price up 6% this month — third consecutive monthly increase.", changePct: 6 },
];
