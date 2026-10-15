export type IntegrationKind = "pos" | "payroll" | "accounting";

export type Integration = {
  id: string;
  kind: IntegrationKind;
  name: string;
  description: string;
  connected: boolean;
  lastSync: string | null;
};

export type DailySalesEntry = {
  date: string;
  day: string;
  covers: number;
  sales: number;
  laborHours: number;
  laborCost: number;
  source: string;
};

export type PmixItem = { item: string; sold: number; revenue: number };

export type BillStatus = "Due" | "Scheduled" | "Partial" | "Paid";

export type Bill = {
  id: string;
  supplier: string;
  invoiceRef: string;
  amount: number;
  paid: number;
  dueDate: string;
  scheduledFor?: string;
  status: BillStatus;
};

export type LocationRollup = {
  name: string;
  sales: number;
  foodPct: number;
  laborPct: number;
  profit: number;
};

export const integrations: Integration[] = [
  { id: "pos-toast", kind: "pos", name: "Toast POS", description: "Nightly sales + covers import", connected: true, lastSync: "Today 3:00 AM" },
  { id: "pos-square", kind: "pos", name: "Square", description: "Sales + tender data import", connected: false, lastSync: null },
  { id: "payroll-gusto", kind: "payroll", name: "Gusto Payroll", description: "Labor hours + cost by shift", connected: true, lastSync: "Today 4:00 AM" },
  { id: "payroll-adp", kind: "payroll", name: "ADP Workforce", description: "Labor data import", connected: false, lastSync: null },
  { id: "acc-qbo", kind: "accounting", name: "QuickBooks Online", description: "Invoice lines + payments sync", connected: true, lastSync: "Yesterday 11:00 PM" },
  { id: "acc-xero", kind: "accounting", name: "Xero", description: "Bills + journal sync", connected: false, lastSync: null },
];

export const dailySalesEntries: DailySalesEntry[] = [
  { date: "Oct 6", day: "Mon", covers: 148, sales: 8420, laborHours: 62, laborCost: 2860, source: "Toast" },
  { date: "Oct 7", day: "Tue", covers: 161, sales: 9115, laborHours: 64, laborCost: 2940, source: "Toast" },
  { date: "Oct 8", day: "Wed", covers: 189, sales: 10430, laborHours: 70, laborCost: 3180, source: "Toast" },
  { date: "Oct 9", day: "Thu", covers: 196, sales: 11005, laborHours: 72, laborCost: 3260, source: "Toast" },
  { date: "Oct 10", day: "Fri", covers: 298, sales: 16780, laborHours: 96, laborCost: 4390, source: "Toast" },
  { date: "Oct 11", day: "Sat", covers: 305, sales: 18420, laborHours: 104, laborCost: 4820, source: "Toast" },
  { date: "Oct 12", day: "Sun", covers: 244, sales: 12960, laborHours: 82, laborCost: 3760, source: "Manual" },
];

export const pmixItems: PmixItem[] = [
  { item: "Baja Fish Tacos (2)", sold: 86, revenue: 1419 },
  { item: "Chipotle Chicken Sandwich", sold: 74, revenue: 1036 },
  { item: "Chicken Burrito Bowl", sold: 68, revenue: 1054 },
  { item: "House Margarita", sold: 132, revenue: 1188 },
  { item: "Deviled Eggs", sold: 95, revenue: 570 },
];

export const initialBills: Bill[] = [
  { id: "BILL-0912", supplier: "Premium Meats Co.", invoiceRef: "INV-8841", amount: 412, paid: 0, dueDate: "Oct 24", status: "Due" },
  { id: "BILL-0910", supplier: "Fresh Produce Co.", invoiceRef: "INV-8838", amount: 96.2, paid: 0, dueDate: "Oct 18", scheduledFor: "Oct 17", status: "Scheduled" },
  { id: "BILL-0904", supplier: "Dry Goods Ltd.", invoiceRef: "INV-8835", amount: 640, paid: 300, dueDate: "Oct 15", status: "Partial" },
  { id: "BILL-0898", supplier: "Coastal Seafood", invoiceRef: "INV-8829", amount: 398.4, paid: 398.4, dueDate: "Oct 8", status: "Paid" },
  { id: "BILL-0891", supplier: "Vine & Barrel", invoiceRef: "INV-8820", amount: 210, paid: 210, dueDate: "Oct 1", status: "Paid" },
];

export const locationRollups: LocationRollup[] = [
  { name: "Downtown", sales: 87130, foodPct: 31.4, laborPct: 29.0, profit: 14520 },
  { name: "Riverside", sales: 62300, foodPct: 30.2, laborPct: 27.4, profit: 11860 },
  { name: "Airport (licensed)", sales: 44890, foodPct: 34.8, laborPct: 31.2, profit: 6420 },
];
