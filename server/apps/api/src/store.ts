import type { InvoiceEventPayload, InvoiceStatus, InventoryRecord, NormalizationRouting, UserRole } from "@chefvision/shared";

export interface UserRecord {
  id: string;
  email: string;
  password: string;
  restaurantId: string;
  role: UserRole;
}

export interface InvoiceRecord {
  id: string;
  restaurantId: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  externalReceiptId: string | null;
  source: "scan" | "manual";
  invoiceNumber: string | null;
  tax: number;
  tip: number;
  notes: string;
  supplierName: string | null;
  invoiceDate: string | null;
  status: InvoiceStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItemRecord {
  id: string;
  invoiceId: string;
  rawName: string;
  rawQty: number;
  rawUnit: string;
  unitPrice: number;
  canonicalId: string | null;
  canonicalName: string | null;
  normalizedQty: number | null;
  normalizedUnit: string | null;
  confidence: number | null;
  routing: NormalizationRouting | null;
}

export interface RecipeRecord {
  id: string;
  name: string;
  category: string;
  ingredients: Array<{ name: string; qtyPerServing: number; unit: string }>;
}

export interface PlannedEventRecord {
  id: string;
  name: string;
  date: string;
  guests: number;
  notes: string;
  recipes: Array<{ recipeId: string; servings: number }>;
}

export interface InvoiceStore {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  createInvoice(input: {
    id: string;
    restaurantId: string;
    storageKey: string;
    originalFilename: string;
    mimeType: string;
    externalReceiptId?: string | null;
    source?: "scan" | "manual";
    invoiceNumber?: string | null;
    tax?: number;
    tip?: number;
    notes?: string;
  }): Promise<InvoiceRecord>;
  getInvoiceById(invoiceId: string): Promise<InvoiceRecord | null>;
  listInvoices(restaurantId: string): Promise<InvoiceRecord[]>;
  updateInvoiceMetadata(input: {
    invoiceId: string;
    restaurantId: string;
    invoiceNumber: string;
    tax: number;
    tip: number;
    notes: string;
  }): Promise<boolean>;
  deleteInvoice(invoiceId: string, restaurantId: string): Promise<boolean>;
  setInvoiceStatus(invoiceId: string, status: InvoiceStatus, errorMessage?: string | null): Promise<void>;
  setExtractedInvoice(invoiceId: string, supplierName: string, invoiceDate: string): Promise<void>;
  replaceLineItems(
    invoiceId: string,
    items: Array<{ rawName: string; rawQty: number; rawUnit: string; unitPrice?: number }>
  ): Promise<InvoiceLineItemRecord[]>;
  saveNormalization(
    lineItemId: string,
    normalization: {
      canonicalId: string | null;
      canonicalName: string | null;
      normalizedQty: number;
      normalizedUnit: string;
      confidence: number | null;
      routing: NormalizationRouting;
    }
  ): Promise<void>;
  incrementInventory(input: {
    restaurantId: string;
    canonicalId: string;
    canonicalName: string;
    quantity: number;
    unit: string;
  }): Promise<void>;
  listInventory(restaurantId: string): Promise<InventoryRecord[]>;
  listLineItems(invoiceId: string): Promise<InvoiceLineItemRecord[]>;
  listRecipes(restaurantId: string): Promise<RecipeRecord[]>;
  upsertRecipe(restaurantId: string, recipe: RecipeRecord): Promise<void>;
  deleteRecipe(restaurantId: string, recipeId: string): Promise<boolean>;
  listEvents(restaurantId: string): Promise<PlannedEventRecord[]>;
  upsertEvent(restaurantId: string, event: PlannedEventRecord): Promise<void>;
  deleteEvent(restaurantId: string, eventId: string): Promise<boolean>;
}

export interface InvoiceStatusPublisher {
  publish(payload: InvoiceEventPayload): void;
}
