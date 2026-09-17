import type { InvoiceStore, InvoiceStatusPublisher } from "./store.js";
import type { InvoiceStorage } from "./storage.js";
import type { NormalizerClient } from "./normalizer-client.js";
import { extractInvoice } from "./extractor.js";

export async function processInvoiceJob(
  invoiceId: string,
  dependencies: {
    store: InvoiceStore;
    storage: InvoiceStorage;
    normalizer: NormalizerClient;
    events: InvoiceStatusPublisher;
  }
) {
  const { store, storage, normalizer, events } = dependencies;
  const invoice = await store.getInvoiceById(invoiceId);
  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} not found`);
  }

  try {
    await store.setInvoiceStatus(invoiceId, "processing");
    events.publish({
      invoiceId,
      status: "processing",
      message: "Invoice job started",
      at: new Date().toISOString()
    });

    const file = await storage.getObject(invoice.storageKey);
    const extracted = extractInvoice(file, invoice.mimeType);
    await store.setExtractedInvoice(invoiceId, extracted.supplierName, extracted.invoiceDate);
    const lineItems = await store.replaceLineItems(invoiceId, extracted.lineItems);

    for (const lineItem of lineItems) {
      const normalized = await normalizer.normalize({
        lineItemId: lineItem.id,
        vendorId: null,
        rawText: lineItem.rawName,
        rawQty: lineItem.rawQty,
        rawUnit: lineItem.rawUnit
      });

      await store.saveNormalization(lineItem.id, {
        canonicalId: normalized.topMatch?.canonicalId ?? null,
        canonicalName: normalized.topMatch?.canonicalName ?? null,
        normalizedQty: normalized.normalizedQty,
        normalizedUnit: normalized.normalizedUnit,
        confidence: normalized.topMatch?.confidence ?? null,
        routing: normalized.routing
      });

      if (normalized.routing === "auto_commit" && normalized.topMatch) {
        await store.incrementInventory({
          restaurantId: invoice.restaurantId,
          canonicalId: normalized.topMatch.canonicalId,
          canonicalName: normalized.topMatch.canonicalName,
          quantity: normalized.normalizedQty,
          unit: normalized.normalizedUnit
        });
      }
    }

    await store.setInvoiceStatus(invoiceId, "done");
    events.publish({
      invoiceId,
      status: "done",
      message: "Invoice processed successfully",
      at: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown processing error";
    await store.setInvoiceStatus(invoiceId, "error", message);
    events.publish({
      invoiceId,
      status: "error",
      message,
      at: new Date().toISOString()
    });
    throw error;
  }
}
