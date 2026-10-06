import { Plus, Trash2, TriangleAlert } from "lucide-react";

import { Button, Confidence } from "@/components/ui";
import { cn, currency } from "@/lib/cn";
import { receiptSubtotal, receiptTotal } from "@/lib/planning";
import type { Receipt, ReceiptItem } from "@/lib/types";
import { COMMON_UNITS } from "@/lib/units";

export interface ReceiptEditorProps {
  receipt: Receipt;
  onChange(receipt: Receipt): void;
  /** Header fields flagged by Model 1 (vendor, date, invoice_number, tax, ...). */
  flaggedFields?: string[];
  showTip?: boolean;
}

const emptyItem: ReceiptItem = { name: "", qty: 1, unit: "each", unitPrice: 0 };

/** Editable receipt form used by Scan Receipt (human-in-the-loop review), Manual Entry, and Receipt Details. */
export function ReceiptEditor({ receipt, onChange, flaggedFields = [], showTip = true }: ReceiptEditorProps) {
  const flagged = new Set(flaggedFields);
  const set = <K extends keyof Receipt>(key: K, value: Receipt[K]) => onChange({ ...receipt, [key]: value });

  const setItem = (index: number, patch: Partial<ReceiptItem>) => {
    const items = receipt.items.map((item, i) =>
      // Editing a flagged line counts as the owner confirming it.
      i === index ? { ...item, ...patch, flagged: false } : item,
    );
    set("items", items);
  };

  const flaggedItems = receipt.items.filter((item) => item.flagged).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Supplier" flagged={flagged.has("vendor")}>
          <input
            className={cn("input", flagged.has("vendor") && "input-flagged")}
            value={receipt.supplier}
            onChange={(e) => set("supplier", e.target.value)}
            placeholder="e.g. Sysco"
          />
        </Field>
        <Field label="Date" flagged={flagged.has("date")}>
          <input
            type="date"
            className={cn("input", flagged.has("date") && "input-flagged")}
            value={receipt.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
        <Field label="Invoice #" flagged={flagged.has("invoice_number")}>
          <input
            className={cn("input", flagged.has("invoice_number") && "input-flagged")}
            value={receipt.invoiceNumber}
            onChange={(e) => set("invoiceNumber", e.target.value)}
          />
        </Field>
      </div>

      {flaggedItems > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {flaggedItems} line item{flaggedItems > 1 ? "s" : ""} had low OCR confidence or missing fields. Please check the
          highlighted rows.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table-base min-w-[640px]">
          <thead>
            <tr>
              <th className="w-[38%]">Item</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit price</th>
              <th className="text-right">Line total</th>
              <th className="text-right">OCR</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={index} className={cn(item.flagged && "bg-amber-50/60")}>
                <td>
                  <input
                    className={cn("input", item.flagged && !item.name && "input-flagged")}
                    value={item.name}
                    onChange={(e) => setItem(index, { name: e.target.value })}
                    placeholder="Ingredient"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className="input w-20"
                    value={item.qty}
                    onChange={(e) => setItem(index, { qty: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <input
                    className="input w-24"
                    list="unit-options"
                    value={item.unit}
                    onChange={(e) => setItem(index, { unit: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="input w-24"
                    value={item.unitPrice}
                    onChange={(e) => setItem(index, { unitPrice: Number(e.target.value) })}
                  />
                </td>
                <td className="text-right font-medium tabular-nums">{currency.format(item.qty * item.unitPrice)}</td>
                <td className="text-right">
                  <Confidence value={item.confidence} />
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    aria-label="Remove item"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => set("items", receipt.items.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <datalist id="unit-options">
          {COMMON_UNITS.map((unit) => (
            <option key={unit} value={unit} />
          ))}
        </datalist>
      </div>

      <Button variant="secondary" icon={Plus} onClick={() => set("items", [...receipt.items, { ...emptyItem }])}>
        Add item
      </Button>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Notes">
          <textarea
            className="input min-h-24"
            value={receipt.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Delivery notes, substitutions…"
          />
        </Field>
        <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
          <Row label="Subtotal" value={currency.format(receiptSubtotal(receipt))} />
          <Row
            label="Tax"
            flagged={flagged.has("tax")}
            value={
              <input
                type="number"
                min={0}
                step="0.01"
                className={cn("input w-28 text-right", flagged.has("tax") && "input-flagged")}
                value={receipt.tax}
                onChange={(e) => set("tax", Number(e.target.value))}
              />
            }
          />
          {showTip && (
            <Row
              label="Tip"
              value={
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="input w-28 text-right"
                  value={receipt.tip}
                  onChange={(e) => set("tip", Number(e.target.value))}
                />
              }
            />
          )}
          <div className="border-t border-slate-200 pt-2">
            <Row label={<span className="font-bold text-slate-900">Total</span>} value={<span className="text-lg font-bold">{currency.format(receiptTotal(receipt))}</span>} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, flagged, children }: { label: string; flagged?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label flex items-center gap-1">
        {label}
        {flagged && <span className="text-[10px] font-bold text-amber-600 uppercase">· check</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value, flagged }: { label: React.ReactNode; value: React.ReactNode; flagged?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">
        {label}
        {flagged && <span className="ml-1 text-[10px] font-bold text-amber-600 uppercase">· check</span>}
      </span>
      {value}
    </div>
  );
}
