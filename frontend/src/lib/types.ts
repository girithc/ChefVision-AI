// Mirrors server/packages/shared/src/index.ts and server/apps/api/src/store.ts
export type UserRole = "admin" | "owner";
export type InvoiceStatus = "pending" | "processing" | "done" | "error";
export type NormalizationRouting = "auto_commit" | "needs_review" | "new_ingredient";

export interface Session {
  token: string | null; // null when running in offline demo mode
  role: UserRole;
  restaurantId: string;
  email: string;
}

export interface InventoryRecord {
  canonicalId: string;
  canonicalName: string;
  onHandQty: number;
  unit: string;
}

export interface InvoiceLineItemRecord {
  id: string;
  invoiceId: string;
  rawName: string;
  rawQty: number;
  rawUnit: string;
  canonicalId: string | null;
  canonicalName: string | null;
  normalizedQty: number | null;
  normalizedUnit: string | null;
  confidence: number | null;
  routing: NormalizationRouting | null;
}

export interface InvoiceRecord {
  id: string;
  supplierName: string | null;
  invoiceDate: string | null;
  status: InvoiceStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  lineItems: InvoiceLineItemRecord[];
}

export interface InvoiceEventPayload {
  invoiceId: string;
  status: InvoiceStatus;
  message: string;
  at: string;
}

// Response of Ocr-Model-1 POST /api/extract
export interface OcrField<T> {
  value: T | null;
  confidence: number;
}

export interface OcrLineItem {
  item_name: string;
  quantity: number | null;
  unit: string | null;
  unit_price: number | null;
  line_total: number | null;
  confidence: number;
}

export interface OcrResult {
  status: string;
  result: {
    vendor: OcrField<string>;
    date: OcrField<string>;
    invoice_number: OcrField<string>;
    line_items: OcrLineItem[];
    subtotal: OcrField<number>;
    tax: OcrField<number>;
    total: OcrField<number>;
    flagged_fields: string[];
  };
}

// Client-side entities (no API endpoints exist for these yet; persisted in localStorage)
export interface ReceiptItem {
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  confidence?: number;
  flagged?: boolean;
}

export interface Receipt {
  id: string;
  invoiceId: string | null; // API invoice id once submitted
  source: "scan" | "manual";
  supplier: string;
  date: string;
  invoiceNumber: string;
  items: ReceiptItem[];
  tax: number;
  tip: number;
  notes: string;
  status: InvoiceStatus | "local";
  statusMessage?: string;
  normalized?: InvoiceLineItemRecord[];
  createdAt: string;
}

export interface RecipeIngredient {
  name: string; // should match a canonical ingredient name
  qtyPerServing: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: RecipeIngredient[];
}

export interface EventRecipe {
  recipeId: string;
  servings: number;
}

export interface PlannedEvent {
  id: string;
  name: string;
  date: string;
  guests: number;
  notes: string;
  recipes: EventRecipe[];
}
