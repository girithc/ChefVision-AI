import { todayIso } from "./cn";
import { newId } from "./app-context";
import type { OcrResult, Receipt } from "./types";

export function blankReceipt(source: Receipt["source"]): Receipt {
  return {
    id: newId("rc"),
    invoiceId: null,
    source,
    supplier: "",
    date: todayIso(),
    invoiceNumber: "",
    items: [{ name: "", qty: 1, unit: "each", unitPrice: 0 }],
    tax: 0,
    tip: 0,
    notes: "",
    status: "local",
    createdAt: new Date().toISOString(),
  };
}

/** Line-item confidence below this is routed to the owner for review (matches flag_fields in ocr_invoice.py). */
const LINE_REVIEW_THRESHOLD = 0.7;

export function receiptFromOcr(ocr: OcrResult): Receipt {
  const { result } = ocr;
  const receipt = blankReceipt("scan");
  const flaggedIndices = new Set(
    result.flagged_fields
      .map((field) => /^line_items\[(\d+)\]/.exec(field)?.[1])
      .filter((index): index is string => index !== undefined)
      .map(Number),
  );

  return {
    ...receipt,
    supplier: result.vendor.value ?? "",
    date: toIsoDate(result.date.value) ?? receipt.date,
    invoiceNumber: result.invoice_number.value ?? "",
    tax: result.tax.value ?? 0,
    items: result.line_items.map((item, index) => {
      const qty = item.quantity ?? 1;
      return {
        name: item.item_name,
        qty,
        unit: item.unit ?? "each",
        unitPrice: item.unit_price ?? (item.line_total !== null ? item.line_total / qty : 0),
        confidence: item.confidence,
        flagged: flaggedIndices.has(index) || item.confidence < LINE_REVIEW_THRESHOLD,
      };
    }),
  };
}

function toIsoDate(value: string | null): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : todayIso(parsed);
}
