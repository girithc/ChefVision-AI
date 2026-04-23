import type { InventoryRecord } from "@chefvision/shared";

import type { InvoiceLineItemRecord, InvoiceRecord, InvoiceStore, UserRecord } from "./store.js";

export class MemoryInvoiceStore implements InvoiceStore {
  private readonly users = new Map<string, UserRecord>();

  private readonly invoices = new Map<string, InvoiceRecord>();

  private readonly invoiceLineItems = new Map<string, InvoiceLineItemRecord[]>();

  private readonly inventory = new Map<string, InventoryRecord[]>();

  constructor(users: UserRecord[] = []) {
    users.forEach((user) => this.users.set(user.email, user));
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.users.get(email) ?? null;
  }

  async createInvoice(input: {
    id: string;
    restaurantId: string;
    storageKey: string;
    originalFilename: string;
    mimeType: string;
  }): Promise<InvoiceRecord> {
    const invoice: InvoiceRecord = {
      ...input,
      supplierName: null,
      invoiceDate: null,
      status: "pending",
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.invoices.set(invoice.id, invoice);
    this.invoiceLineItems.set(invoice.id, []);
    return invoice;
  }

  async getInvoiceById(invoiceId: string): Promise<InvoiceRecord | null> {
    return this.invoices.get(invoiceId) ?? null;
  }

  async setInvoiceStatus(invoiceId: string, status: InvoiceRecord["status"], errorMessage?: string | null): Promise<void> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return;
    }
    invoice.status = status;
    invoice.errorMessage = errorMessage ?? null;
    invoice.updatedAt = new Date().toISOString();
  }

  async setExtractedInvoice(invoiceId: string, supplierName: string, invoiceDate: string): Promise<void> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return;
    }
    invoice.supplierName = supplierName;
    invoice.invoiceDate = invoiceDate;
    invoice.updatedAt = new Date().toISOString();
  }

  async replaceLineItems(
    invoiceId: string,
    items: Array<{ rawName: string; rawQty: number; rawUnit: string }>
  ): Promise<InvoiceLineItemRecord[]> {
    const inserted = items.map((item, index) => ({
      id: `${invoiceId}-line-${index + 1}`,
      invoiceId,
      rawName: item.rawName,
      rawQty: item.rawQty,
      rawUnit: item.rawUnit,
      canonicalId: null,
      canonicalName: null,
      normalizedQty: null,
      normalizedUnit: null,
      confidence: null,
      routing: null
    }));
    this.invoiceLineItems.set(invoiceId, inserted);
    return inserted;
  }

  async saveNormalization(
    lineItemId: string,
    normalization: {
      canonicalId: string | null;
      canonicalName: string | null;
      normalizedQty: number;
      normalizedUnit: string;
      confidence: number | null;
      routing: InvoiceLineItemRecord["routing"];
    }
  ): Promise<void> {
    for (const items of this.invoiceLineItems.values()) {
      const lineItem = items.find((entry) => entry.id === lineItemId);
      if (!lineItem) {
        continue;
      }
      lineItem.canonicalId = normalization.canonicalId;
      lineItem.canonicalName = normalization.canonicalName;
      lineItem.normalizedQty = normalization.normalizedQty;
      lineItem.normalizedUnit = normalization.normalizedUnit;
      lineItem.confidence = normalization.confidence;
      lineItem.routing = normalization.routing;
    }
  }

  async incrementInventory(input: {
    restaurantId: string;
    canonicalId: string;
    canonicalName: string;
    quantity: number;
    unit: string;
  }): Promise<void> {
    const current = this.inventory.get(input.restaurantId) ?? [];
    const record = current.find((entry) => entry.canonicalId === input.canonicalId);
    if (record) {
      record.onHandQty += input.quantity;
      record.unit = input.unit;
    } else {
      current.push({
        canonicalId: input.canonicalId,
        canonicalName: input.canonicalName,
        onHandQty: input.quantity,
        unit: input.unit
      });
      this.inventory.set(input.restaurantId, current);
    }
  }

  async listInventory(restaurantId: string): Promise<InventoryRecord[]> {
    return [...(this.inventory.get(restaurantId) ?? [])];
  }

  async listLineItems(invoiceId: string): Promise<InvoiceLineItemRecord[]> {
    return [...(this.invoiceLineItems.get(invoiceId) ?? [])];
  }
}
