"use client";

import { Camera, ChevronDown, Mail, Plug, ScanLine, Upload } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import type { Invoice, InvoiceSource, InvoiceStatus } from "../data";

const statusTone: Record<InvoiceStatus, Tone> = {
  Queued: "slate",
  Extracting: "indigo",
  "Needs review": "amber",
  Published: "emerald",
};

const sourceIcon = { Photo: Camera, PDF: Upload, Email: Mail, Integration: Plug } as const;

type InvoiceInboxProps = {
  invoices: Invoice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpload: (source: InvoiceSource) => void;
};

const uploadOptions: Array<{ source: InvoiceSource; label: string; icon: typeof Camera }> = [
  { source: "Photo", label: "Take photo", icon: Camera },
  { source: "PDF", label: "Upload PDF", icon: Upload },
  { source: "Email", label: "Email in", icon: Mail },
];

export default function InvoiceInbox({ invoices, selectedId, onSelect, onUpload }: InvoiceInboxProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="text-xs font-bold text-slate-800">Capture an invoice</div>
          <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
            {uploadOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.source}
                  type="button"
                  onClick={() => onUpload(option.source)}
                  className={`inline-flex items-center gap-2 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${
                    index > 0 ? "border-l border-slate-200" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">Invoice history</div>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
          {invoices.map((invoice) => {
            const Icon = sourceIcon[invoice.source];
            const expanded = invoice.id === selectedId && invoice.lines.length > 0;
            return (
              <div key={invoice.id}>
                <button
                  type="button"
                  onClick={() => onSelect(invoice.id)}
                  className={`flex w-full items-center justify-between gap-3 p-5 text-left transition-colors ${
                    expanded ? "bg-slate-50" : "hover:bg-slate-50/60"
                  }`}
                >
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">{invoice.supplier}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {invoice.invoiceNumber} · {invoice.date} · <ScanLine className="mr-1 inline h-3 w-3 text-slate-400" />
                      {invoice.source}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-900">
                      ${invoice.lines.reduce((sum, line) => sum + line.lineTotal + line.tax + line.charges, 0).toFixed(2)}
                    </span>
                    <StatusBadge label={invoice.status} tone={statusTone[invoice.status]} />
                    <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                    <div className="overflow-x-auto rounded-lg bg-white">
                      <table className="w-full text-left text-[11.5px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400">
                            <th className="px-3 pt-3.5 pb-2.5 font-medium">Supplier item</th>
                            <th className="px-3 pt-3.5 pb-2.5 font-medium">Matched ingredient</th>
                            <th className="px-3 pt-3.5 pb-2.5 font-medium">Qty</th>
                            <th className="px-3 pt-3.5 pb-2.5 font-medium text-right">Price</th>
                            <th className="px-3 pt-3.5 pb-2.5 font-medium text-right">Tax + charges</th>
                            <th className="px-3 pt-3.5 pb-2.5 font-medium text-right">Total</th>
                            <th className="px-3 pt-3.5 pb-2.5 font-medium">Category</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {invoice.lines.map((line) => (
                            <tr key={line.id}>
                              <td className="px-3 py-3.5">
                                <div className="font-semibold text-slate-900">{line.rawName}</div>
                                <div className="mt-0.5 text-[10px] text-slate-400">SKU {line.sku}</div>
                              </td>
                              <td className="px-3 py-3.5">
                                <div className="text-slate-900">{line.matchedIngredient}</div>
                                <div className="mt-0.5 text-[10px] text-slate-400">{line.matchConfidence}% match</div>
                              </td>
                              <td className="px-3 py-3.5 text-slate-600">{line.quantity} {line.unit}</td>
                              <td className="px-3 py-3.5 text-right font-semibold text-slate-900">${line.unitPrice.toFixed(2)}/{line.unit}</td>
                              <td className="px-3 py-3.5 text-right text-slate-600">${(line.tax + line.charges).toFixed(2)}</td>
                              <td className="px-3 py-3.5 text-right font-semibold text-slate-900">${line.lineTotal.toFixed(2)}</td>
                              <td className="px-3 py-3.5 text-slate-600">{line.category}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
