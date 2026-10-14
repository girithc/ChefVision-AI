"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { accountingCategories } from "../data";
import type { Invoice } from "../data";

const categoryIconTone: Record<string, string> = {
  "Food — Produce": "bg-emerald-50 text-emerald-600",
  "Food — Protein": "bg-rose-50 text-rose-600",
  "Food — Dairy": "bg-sky-50 text-sky-600",
  "Food — Dry goods": "bg-amber-50 text-amber-600",
  Beverage: "bg-indigo-50 text-indigo-600",
  "Chemicals & sanitation": "bg-teal-50 text-teal-600",
  Packaging: "bg-slate-100 text-slate-600",
  Utilities: "bg-violet-50 text-violet-600",
};

type AccountingExportProps = {
  invoices: Invoice[];
};

export default function AccountingExport({ invoices }: AccountingExportProps) {
  const [lastExportedAt, setLastExportedAt] = useState<string | null>(null);

  const publishedLines = invoices
    .filter((invoice) => invoice.status === "Published")
    .flatMap((invoice) => invoice.lines);

  const totalsByCategory = accountingCategories
    .map((category) => {
      const lines = publishedLines.filter((line) => line.category === category);
      return {
        category,
        total: lines.reduce((sum, line) => sum + line.lineTotal + line.tax + line.charges, 0),
        count: lines.length,
      };
    })
    .filter((entry) => entry.count > 0);

  const grandTotal = totalsByCategory.reduce((sum, entry) => sum + entry.total, 0);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">Purchases by accounting category</div>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
          {totalsByCategory.length === 0 && (
            <p className="px-5 py-4 text-[11px] text-slate-400">No published invoices yet — nothing to transfer.</p>
          )}
          {totalsByCategory.map((entry) => (
            <div key={entry.category} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${categoryIconTone[entry.category] ?? "bg-slate-100 text-slate-600"}`}>
                  {entry.category.split("— ").pop()?.[0]}
                </span>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{entry.category}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{entry.count} line items</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-900">${entry.total.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-slate-50/80 px-5 py-3.5">
            <span className="text-xs font-bold text-slate-800">Total</span>
            <span className="text-sm font-bold text-slate-900">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">Transfer to accounting system</div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-900">
              {publishedLines.length} published line items ready to transfer
            </div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              {lastExportedAt
                ? `Last transferred ${lastExportedAt} — QuickBooks Online, category-mapped`
                : "Destinations: QuickBooks Online · Xero · XLSX export"}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setLastExportedAt(
                new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
              )
            }
            disabled={publishedLines.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {lastExportedAt ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Send className="h-4 w-4" />}
            {lastExportedAt ? "Transfer again" : "Transfer now"}
          </button>
        </div>
      </div>
    </div>
  );
}
