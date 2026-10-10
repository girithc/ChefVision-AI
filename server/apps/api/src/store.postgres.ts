import { Pool } from "pg";
import type { InventoryRecord } from "@chefvision/shared";

import type { InvoiceLineItemRecord, InvoiceRecord, InvoiceStore, UserRecord } from "./store.js";

export class PostgresInvoiceStore implements InvoiceStore {
  constructor(private readonly pool: Pool) {}

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.pool.query<UserRecord>(
      `
        select
          id,
          email,
          password_hash as password,
          restaurant_id as "restaurantId",
          role
        from app_user
        where email = $1
        limit 1
      `,
      [email]
    );
    return result.rows[0] ?? null;
  }

  async createInvoice(input: {
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
  }): Promise<InvoiceRecord> {
    const result = await this.pool.query<InvoiceRecord>(
      `
        insert into invoice (
          id,
          restaurant_id,
          storage_key,
          original_filename,
          mime_type,
          external_receipt_id,
          source,
          invoice_number,
          tax,
          tip,
          notes,
          status
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
        returning
          id,
          restaurant_id as "restaurantId",
          storage_key as "storageKey",
          original_filename as "originalFilename",
          mime_type as "mimeType",
          external_receipt_id as "externalReceiptId",
          source,
          invoice_number as "invoiceNumber",
          tax,
          tip,
          notes,
          supplier_name as "supplierName",
          invoice_date as "invoiceDate",
          status,
          error_message as "errorMessage",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `,
      [
        input.id,
        input.restaurantId,
        input.storageKey,
        input.originalFilename,
        input.mimeType,
        input.externalReceiptId ?? null,
        input.source ?? "scan",
        input.invoiceNumber ?? null,
        input.tax ?? 0,
        input.tip ?? 0,
        input.notes ?? ""
      ]
    );
    return parseInvoiceRecord(result.rows[0]);
  }

  async getInvoiceById(invoiceId: string): Promise<InvoiceRecord | null> {
    const result = await this.pool.query<InvoiceRecord>(
      `
        select
          id,
          restaurant_id as "restaurantId",
          storage_key as "storageKey",
          original_filename as "originalFilename",
          mime_type as "mimeType",
          external_receipt_id as "externalReceiptId",
          source,
          invoice_number as "invoiceNumber",
          tax,
          tip,
          notes,
          supplier_name as "supplierName",
          invoice_date as "invoiceDate",
          status,
          error_message as "errorMessage",
          created_at as "createdAt",
          updated_at as "updatedAt"
        from invoice
        where id = $1
        limit 1
      `,
      [invoiceId]
    );
    return result.rows[0] ? parseInvoiceRecord(result.rows[0]) : null;
  }

  async listInvoices(restaurantId: string): Promise<InvoiceRecord[]> {
    const result = await this.pool.query<InvoiceRecord>(
      `
        select
          id,
          restaurant_id as "restaurantId",
          storage_key as "storageKey",
          original_filename as "originalFilename",
          mime_type as "mimeType",
          external_receipt_id as "externalReceiptId",
          source,
          invoice_number as "invoiceNumber",
          tax,
          tip,
          notes,
          supplier_name as "supplierName",
          invoice_date as "invoiceDate",
          status,
          error_message as "errorMessage",
          created_at as "createdAt",
          updated_at as "updatedAt"
        from invoice
        where restaurant_id = $1
        order by created_at desc
      `,
      [restaurantId]
    );
    return result.rows.map(parseInvoiceRecord);
  }

  async updateInvoiceMetadata(input: {
    invoiceId: string;
    restaurantId: string;
    invoiceNumber: string;
    tax: number;
    tip: number;
    notes: string;
  }): Promise<boolean> {
    const result = await this.pool.query(
      `
        update invoice
        set invoice_number = $3,
            tax = $4,
            tip = $5,
            notes = $6,
            updated_at = now()
        where id = $1 and restaurant_id = $2
      `,
      [input.invoiceId, input.restaurantId, input.invoiceNumber, input.tax, input.tip, input.notes]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async deleteInvoice(invoiceId: string, restaurantId: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const invoice = await client.query(
        "select id from invoice where id = $1 and restaurant_id = $2 for update",
        [invoiceId, restaurantId]
      );
      if (!invoice.rowCount) {
        await client.query("rollback");
        return false;
      }
      await client.query(
        `
          update inventory_ledger inventory
          set on_hand_qty = greatest(0, inventory.on_hand_qty - consumed.quantity),
              updated_at = now()
          from (
            select canonical_id, sum(normalized_qty) as quantity
            from invoice_line_item
            where invoice_id = $1
              and routing = 'auto_commit'
              and canonical_id is not null
              and normalized_qty is not null
            group by canonical_id
          ) consumed
          where inventory.restaurant_id = $2
            and inventory.canonical_id = consumed.canonical_id
        `,
        [invoiceId, restaurantId]
      );
      await client.query("delete from invoice where id = $1", [invoiceId]);
      await client.query("commit");
      return true;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async setInvoiceStatus(invoiceId: string, status: InvoiceRecord["status"], errorMessage?: string | null): Promise<void> {
    await this.pool.query(
      `
        update invoice
        set status = $2,
            error_message = $3,
            updated_at = now()
        where id = $1
      `,
      [invoiceId, status, errorMessage ?? null]
    );
  }

  async setExtractedInvoice(invoiceId: string, supplierName: string, invoiceDate: string): Promise<void> {
    await this.pool.query(
      `
        update invoice
        set supplier_name = $2,
            invoice_date = $3,
            updated_at = now()
        where id = $1
      `,
      [invoiceId, supplierName, invoiceDate]
    );
  }

  async replaceLineItems(
    invoiceId: string,
    items: Array<{ rawName: string; rawQty: number; rawUnit: string; unitPrice?: number }>
  ): Promise<InvoiceLineItemRecord[]> {
    await this.pool.query("delete from invoice_line_item where invoice_id = $1", [invoiceId]);
    const inserted: InvoiceLineItemRecord[] = [];

    for (const item of items) {
      const result = await this.pool.query<InvoiceLineItemRecord>(
        `
          insert into invoice_line_item (
            invoice_id,
            raw_name,
            raw_qty,
            raw_unit,
            unit_price
          )
          values ($1, $2, $3, $4, $5)
          returning
            id,
            invoice_id as "invoiceId",
            raw_name as "rawName",
            raw_qty as "rawQty",
            raw_unit as "rawUnit",
            unit_price as "unitPrice",
            canonical_id as "canonicalId",
            canonical_name as "canonicalName",
            normalized_qty as "normalizedQty",
            normalized_unit as "normalizedUnit",
            confidence,
            routing
        `,
        [invoiceId, item.rawName, item.rawQty, item.rawUnit, item.unitPrice ?? 0]
      );
      inserted.push(parseInvoiceLineItem(result.rows[0]));
    }

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
    await this.pool.query(
      `
        update invoice_line_item
        set canonical_id = $2,
            canonical_name = $3,
            normalized_qty = $4,
            normalized_unit = $5,
            confidence = $6,
            routing = $7
        where id = $1
      `,
      [
        lineItemId,
        normalization.canonicalId,
        normalization.canonicalName,
        normalization.normalizedQty,
        normalization.normalizedUnit,
        normalization.confidence,
        normalization.routing
      ]
    );

    await this.pool.query(
      `
        insert into normalization_match (
          line_item_id,
          canonical_id,
          confidence,
          routing,
          is_confirmed
        )
        values ($1, $2, $3, $4, $5)
        on conflict (line_item_id) do update
          set canonical_id = excluded.canonical_id,
              confidence = excluded.confidence,
              routing = excluded.routing,
              is_confirmed = excluded.is_confirmed
      `,
      [
        lineItemId,
        normalization.canonicalId,
        normalization.confidence,
        normalization.routing,
        normalization.routing === "auto_commit"
      ]
    );
  }

  async incrementInventory(input: {
    restaurantId: string;
    canonicalId: string;
    canonicalName: string;
    quantity: number;
    unit: string;
  }): Promise<void> {
    await this.pool.query(
      `
        insert into inventory_ledger (
          restaurant_id,
          canonical_id,
          canonical_name,
          on_hand_qty,
          unit
        )
        values ($1, $2, $3, $4, $5)
        on conflict (restaurant_id, canonical_id) do update
          set on_hand_qty = inventory_ledger.on_hand_qty + excluded.on_hand_qty,
              canonical_name = excluded.canonical_name,
              unit = excluded.unit,
              updated_at = now()
      `,
      [input.restaurantId, input.canonicalId, input.canonicalName, input.quantity, input.unit]
    );
  }

  async listInventory(restaurantId: string): Promise<InventoryRecord[]> {
    const result = await this.pool.query<InventoryRecord>(
      `
        select
          canonical_id as "canonicalId",
          canonical_name as "canonicalName",
          on_hand_qty as "onHandQty",
          unit
        from inventory_ledger
        where restaurant_id = $1
        order by canonical_name asc
      `,
      [restaurantId]
    );
    return result.rows.map(parseInventoryRecord);
  }

  async listLineItems(invoiceId: string): Promise<InvoiceLineItemRecord[]> {
    const result = await this.pool.query<InvoiceLineItemRecord>(
      `
        select
          id,
          invoice_id as "invoiceId",
          raw_name as "rawName",
          raw_qty as "rawQty",
          raw_unit as "rawUnit",
          unit_price as "unitPrice",
          canonical_id as "canonicalId",
          canonical_name as "canonicalName",
          normalized_qty as "normalizedQty",
          normalized_unit as "normalizedUnit",
          confidence,
          routing
        from invoice_line_item
        where invoice_id = $1
        order by raw_name asc
      `,
      [invoiceId]
    );
    return result.rows.map(parseInvoiceLineItem);
  }
}

function parseInvoiceLineItem(row: InvoiceLineItemRecord): InvoiceLineItemRecord {
  return {
    ...row,
    rawQty: parseDecimal(row.rawQty),
    unitPrice: parseDecimal(row.unitPrice),
    normalizedQty: row.normalizedQty === null ? null : parseDecimal(row.normalizedQty),
    confidence: row.confidence === null ? null : parseDecimal(row.confidence)
  };
}

function parseInvoiceRecord(row: InvoiceRecord): InvoiceRecord {
  return {
    ...row,
    tax: parseDecimal(row.tax),
    tip: parseDecimal(row.tip),
    invoiceDate: row.invoiceDate ? String(row.invoiceDate).slice(0, 10) : null,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString()
  };
}

function parseInventoryRecord(row: InventoryRecord): InventoryRecord {
  return {
    ...row,
    onHandQty: parseDecimal(row.onHandQty)
  };
}

function parseDecimal(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}
