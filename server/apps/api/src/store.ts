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
  canonicalId: string | null;
  canonicalName: string | null;
  normalizedQty: number | null;
  normalizedUnit: string | null;
  confidence: number | null;
  routing: NormalizationRouting | null;
}

export interface InvoiceStore {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  createInvoice(input: {
    id: string;
    restaurantId: string;
    storageKey: string;
    originalFilename: string;
    mimeType: string;
  }): Promise<InvoiceRecord>;
  getInvoiceById(invoiceId: string): Promise<InvoiceRecord | null>;
  setInvoiceStatus(invoiceId: string, status: InvoiceStatus, errorMessage?: string | null): Promise<void>;
  setExtractedInvoice(invoiceId: string, supplierName: string, invoiceDate: string): Promise<void>;
  replaceLineItems(
    invoiceId: string,
    items: Array<{ rawName: string; rawQty: number; rawUnit: string }>
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
}

export interface InvoiceStatusPublisher {
  publish(payload: InvoiceEventPayload): void;
}
