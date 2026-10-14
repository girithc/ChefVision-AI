export type StockItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  /** Purchase-unit conversion, e.g. "1 case = 12 lb". */
  conversion: string;
  /** Latest unit cost, updated from invoice data. */
  unitCost: number;
  costSource: string;
  parLevel: number;
  parUnit: string;
};

export type CountSheetItem = {
  id: string;
  name: string;
  unit: string;
  expected: number;
  counted?: number;
};

export type CountSession = {
  id: string;
  location: string;
  date: string;
  status: "Open" | "Completed";
  items: CountSheetItem[];
  /** Cost of discrepancies found when completed. */
  varianceCost?: number;
};

export type ValueFlowWeek = {
  label: string;
  opening: number;
  purchased: number;
  used: number;
  closing: number;
};

export const locations = ["Walk-in cooler", "Dry storage", "Main kitchen", "Bar", "Freezer"];

export const stockItems: StockItem[] = [
  { id: "s1", name: "Chicken Breast", category: "Protein", location: "Walk-in cooler", quantity: 12, unit: "lb", conversion: "1 case = 40 lb", unitCost: 6.2, costSource: "INV-8841 · Oct 10", parLevel: 40, parUnit: "lb" },
  { id: "s2", name: "Red Snapper Fillet", category: "Seafood", location: "Walk-in cooler", quantity: 8, unit: "lb", conversion: "1 case = 20 lb", unitCost: 13.0, costSource: "INV-8841 · Oct 10", parLevel: 25, parUnit: "lb" },
  { id: "s3", name: "Roma Tomato", category: "Produce", location: "Walk-in cooler", quantity: 34, unit: "lb", conversion: "1 case = 25 lb", unitCost: 3.68, costSource: "INV-8838 · Oct 9", parLevel: 50, parUnit: "lb" },
  { id: "s4", name: "Romaine Lettuce", category: "Produce", location: "Walk-in cooler", quantity: 9, unit: "lb", conversion: "1 case = 12 ct", unitCost: 2.85, costSource: "INV-8838 · Oct 9", parLevel: 30, parUnit: "lb" },
  { id: "s5", name: "Cheddar Cheese", category: "Dairy", location: "Walk-in cooler", quantity: 18, unit: "lb", conversion: "1 case = 20 lb", unitCost: 4.4, costSource: "INV-8835 · Oct 7", parLevel: 20, parUnit: "lb" },
  { id: "s6", name: "Heavy Cream", category: "Dairy", location: "Walk-in cooler", quantity: 4, unit: "qt", conversion: "1 case = 12 qt", unitCost: 3.95, costSource: "INV-8835 · Oct 7", parLevel: 12, parUnit: "qt" },
  { id: "s7", name: "Arborio Rice", category: "Dry goods", location: "Dry storage", quantity: 18, unit: "lb", conversion: "1 bag = 20 lb", unitCost: 3.1, costSource: "INV-8835 · Oct 7", parLevel: 20, parUnit: "lb" },
  { id: "s8", name: "All-Purpose Flour", category: "Dry goods", location: "Dry storage", quantity: 45, unit: "lb", conversion: "1 sack = 50 lb", unitCost: 0.55, costSource: "INV-8835 · Oct 7", parLevel: 50, parUnit: "lb" },
  { id: "s9", name: "Extra Virgin Olive Oil", category: "Pantry", location: "Dry storage", quantity: 11, unit: "L", conversion: "1 case = 6 L", unitCost: 18.3, costSource: "INV-8835 · Oct 7", parLevel: 15, parUnit: "L" },
  { id: "s10", name: "Brioche Bun", category: "Bakery", location: "Dry storage", quantity: 62, unit: "ea", conversion: "1 case = 72 ea", unitCost: 0.78, costSource: "INV-8835 · Oct 7", parLevel: 90, parUnit: "ea" },
  { id: "s11", name: "Flour Tortilla 12\"", category: "Bakery", location: "Main kitchen", quantity: 84, unit: "ea", conversion: "1 case = 100 ea", unitCost: 0.45, costSource: "INV-8835 · Oct 7", parLevel: 100, parUnit: "ea" },
  { id: "s12", name: "Bacon", category: "Protein", location: "Freezer", quantity: 14, unit: "lb", conversion: "1 case = 15 lb", unitCost: 5.9, costSource: "INV-8841 · Oct 10", parLevel: 15, parUnit: "lb" },
  { id: "s13", name: "Espresso Beans", category: "Beverage", location: "Bar", quantity: 6.5, unit: "kg", conversion: "1 case = 6 kg", unitCost: 14.8, costSource: "INV-8829 · Oct 3", parLevel: 8, parUnit: "kg" },
  { id: "s14", name: "House Red Wine", category: "Beverage", location: "Bar", quantity: 11, unit: "btl", conversion: "1 case = 12 btl", unitCost: 9.4, costSource: "INV-8829 · Oct 3", parLevel: 24, parUnit: "btl" },
];

export const countSessions: CountSession[] = [
  {
    id: "CS-1042",
    location: "Walk-in cooler",
    date: "2025-10-12",
    status: "Open",
    items: [
      { id: "c1", name: "Chicken Breast", unit: "lb", expected: 14.2 },
      { id: "c2", name: "Red Snapper Fillet", unit: "lb", expected: 8.0 },
      { id: "c3", name: "Roma Tomato", unit: "lb", expected: 33.5 },
      { id: "c4", name: "Romaine Lettuce", unit: "lb", expected: 9.4 },
      { id: "c5", name: "Cheddar Cheese", unit: "lb", expected: 18.0 },
      { id: "c6", name: "Heavy Cream", unit: "qt", expected: 4.0 },
    ],
  },
  {
    id: "CS-1041",
    location: "Dry storage",
    date: "2025-10-05",
    status: "Completed",
    varianceCost: -18.4,
    items: [
      { id: "c7", name: "Arborio Rice", unit: "lb", expected: 19.0, counted: 18.0 },
      { id: "c8", name: "All-Purpose Flour", unit: "lb", expected: 45.0, counted: 45.0 },
      { id: "c9", name: "Extra Virgin Olive Oil", unit: "L", expected: 11.5, counted: 10.9 },
      { id: "c10", name: "Brioche Bun", unit: "ea", expected: 64.0, counted: 62.0 },
    ],
  },
  {
    id: "CS-1039",
    location: "Walk-in cooler",
    date: "2025-09-28",
    status: "Completed",
    varianceCost: -42.1,
    items: [
      { id: "c11", name: "Chicken Breast", unit: "lb", expected: 16.5, counted: 13.9 },
      { id: "c12", name: "Roma Tomato", unit: "lb", expected: 36.0, counted: 31.2 },
      { id: "c13", name: "Romaine Lettuce", unit: "lb", expected: 12.0, counted: 8.8 },
    ],
  },
];

export const valueFlowWeeks: ValueFlowWeek[] = [
  { label: "Sep 15–21", opening: 28400, purchased: 6180, used: 5940, closing: 28640 },
  { label: "Sep 22–28", opening: 28640, purchased: 5420, used: 6110, closing: 27950 },
  { label: "Sep 29–Oct 5", opening: 27950, purchased: 7240, used: 6480, closing: 28710 },
  { label: "Oct 6–12", opening: 28710, purchased: 6890, used: 7310, closing: 28290 },
];
