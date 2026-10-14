export type DailyPnlRow = {
  date: string;
  day: string;
  sales: number;
  covers: number;
  foodCost: number;
  laborCost: number;
};

export type UsageVarianceRow = {
  ingredient: string;
  theoretical: number;
  actual: number;
  unit: string;
  costPerUnit: number;
};

export type CategoryUsage = { category: string; used: number };

export type BudgetRow = { category: string; budget: number; actual: number };

export type PriceMovement = { ingredient: string; supplier: string; from: number; to: number; unit: string };

export type SupplierSpend = { supplier: string; spend: number; invoices: number };

export type WeekOverWeek = { day: string; thisWeek: number; lastWeek: number };

export type YearOverYear = {
  metric: string;
  thisYear: number;
  lastYear: number;
  unit: string;
};

export const dailyPnl: DailyPnlRow[] = [
  { date: "Oct 6", day: "Mon", sales: 8420, covers: 148, foodCost: 2510, laborCost: 2860 },
  { date: "Oct 7", day: "Tue", sales: 9115, covers: 161, foodCost: 2680, laborCost: 2940 },
  { date: "Oct 8", day: "Wed", sales: 10430, covers: 189, foodCost: 3120, laborCost: 3180 },
  { date: "Oct 9", day: "Thu", sales: 11005, covers: 196, foodCost: 3410, laborCost: 3260 },
  { date: "Oct 10", day: "Fri", sales: 16780, covers: 298, foodCost: 5480, laborCost: 4390 },
  { date: "Oct 11", day: "Sat", sales: 18420, covers: 305, foodCost: 6180, laborCost: 4820 },
  { date: "Oct 12", day: "Sun", sales: 12960, covers: 244, foodCost: 4230, laborCost: 3760 },
];

export const usageVariance: UsageVarianceRow[] = [
  { ingredient: "Chicken Breast", theoretical: 92.4, actual: 101.8, unit: "lb", costPerUnit: 6.2 },
  { ingredient: "Roma Tomato", theoretical: 34.2, actual: 31.5, unit: "lb", costPerUnit: 3.68 },
  { ingredient: "Red Snapper Fillet", theoretical: 22.8, actual: 24.6, unit: "lb", costPerUnit: 13.0 },
  { ingredient: "Romaine Lettuce", theoretical: 18.9, actual: 22.4, unit: "lb", costPerUnit: 2.85 },
  { ingredient: "Cheddar Cheese", theoretical: 15.2, actual: 15.8, unit: "lb", costPerUnit: 4.4 },
  { ingredient: "Bacon", theoretical: 12.6, actual: 11.9, unit: "lb", costPerUnit: 5.9 },
];

export const categoryUsage: CategoryUsage[] = [
  { category: "Protein", used: 4820 },
  { category: "Produce", used: 2140 },
  { category: "Dairy", used: 1240 },
  { category: "Dry goods", used: 980 },
  { category: "Beverage", used: 1660 },
];

export const budgets: BudgetRow[] = [
  { category: "Food — Protein", budget: 5200, actual: 5640 },
  { category: "Food — Produce", budget: 2200, actual: 1980 },
  { category: "Food — Dairy", budget: 1300, actual: 1240 },
  { category: "Food — Dry goods", budget: 1100, actual: 1010 },
  { category: "Beverage", budget: 1500, actual: 1620 },
  { category: "Labor", budget: 25200, actual: 25210 },
];

export const priceMovements: PriceMovement[] = [
  { ingredient: "Chicken Breast", supplier: "Premium Meats Co.", from: 5.74, to: 6.2, unit: "lb" },
  { ingredient: "Extra Virgin Olive Oil", supplier: "Dry Goods Ltd.", from: 17.26, to: 18.3, unit: "L" },
  { ingredient: "Bacon", supplier: "Premium Meats Co.", from: 5.6, to: 5.9, unit: "lb" },
  { ingredient: "Organic Roma Tomatoes", supplier: "Fresh Produce Co.", from: 3.84, to: 3.68, unit: "lb" },
  { ingredient: "Romaine Lettuce", supplier: "Fresh Produce Co.", from: 2.6, to: 2.85, unit: "lb" },
];

export const ingredientAlerts = [
  { id: "a1", ingredient: "Chicken Breast", message: "Up 8% in 30 days — above the 5% alert threshold." },
  { id: "a2", ingredient: "Extra Virgin Olive Oil", message: "Third consecutive monthly increase (+6%)." },
  { id: "a3", ingredient: "Romaine Lettuce", message: "Up 9.6% week-over-week — check seasonal market pricing." },
];

export const supplierSpend: SupplierSpend[] = [
  { supplier: "Premium Meats Co.", spend: 5640, invoices: 9 },
  { supplier: "Fresh Produce Co.", spend: 1980, invoices: 12 },
  { supplier: "Coastal Seafood", spend: 1740, invoices: 5 },
  { supplier: "Dry Goods Ltd.", spend: 1010, invoices: 6 },
  { supplier: "Vine & Barrel", spend: 1620, invoices: 4 },
];

export const weekOverWeek: WeekOverWeek[] = [
  { day: "Mon", thisWeek: 8420, lastWeek: 7980 },
  { day: "Tue", thisWeek: 9115, lastWeek: 9240 },
  { day: "Wed", thisWeek: 10430, lastWeek: 9670 },
  { day: "Thu", thisWeek: 11005, lastWeek: 10310 },
  { day: "Fri", thisWeek: 16780, lastWeek: 15920 },
  { day: "Sat", thisWeek: 18420, lastWeek: 19140 },
  { day: "Sun", thisWeek: 12960, lastWeek: 12480 },
];

export const yearOverYear: YearOverYear[] = [
  { metric: "Sales", thisYear: 87130, lastYear: 74950, unit: "$" },
  { metric: "Covers", thisYear: 1541, lastYear: 1422, unit: "" },
  { metric: "Avg check", thisYear: 56.54, lastYear: 52.71, unit: "$" },
];
