"use client";

import { FileSpreadsheet, Upload } from "lucide-react";
import { StatusBadge } from "../../../shared/ui";
import { dailySalesEntries, pmixItems } from "../data";

export default function SalesImports() {
  const weekSales = dailySalesEntries.reduce((sum, entry) => sum + entry.sales, 0);
  const weekCovers = dailySalesEntries.reduce((sum, entry) => sum + entry.covers, 0);
  const weekLabor = dailySalesEntries.reduce((sum, entry) => sum + entry.laborCost, 0);
  const maxRevenue = Math.max(...pmixItems.map((item) => item.revenue));
  const totalRevenue = pmixItems.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
          <div className="text-xs font-bold text-slate-800">Daily sales entries — imported from POS</div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Upload className="h-3.5 w-3.5" />
            Import now
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 pt-4 pb-3 font-medium">Day</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Covers</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Sales</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Labor hours</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Labor cost</th>
                <th className="px-5 pt-4 pb-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {dailySalesEntries.map((entry) => (
                <tr key={entry.date}>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{entry.day} · {entry.date}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{entry.covers}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">${entry.sales.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{entry.laborHours} h</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">${entry.laborCost.toLocaleString()}</td>
                  <td className="px-5 py-3.5"><StatusBadge label={entry.source} tone={entry.source === "Toast" ? "sky" : "slate"} /></td>
                </tr>
              ))}
              <tr className="bg-slate-50/80">
                <td className="px-5 py-3 text-xs font-bold text-slate-800">Week total</td>
                <td className="px-5 py-3 text-right text-xs font-bold text-slate-800">{weekCovers}</td>
                <td className="px-5 py-3 text-right text-xs font-bold text-slate-800">${weekSales.toLocaleString()}</td>
                <td className="px-5 py-3" />
                <td className="px-5 py-3 text-right text-xs font-bold text-slate-800">${weekLabor.toLocaleString()}</td>
                <td className="px-5 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
          <div className="text-xs font-bold text-slate-800">Product mix (PMIX) — top sellers this week</div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Import PMIX file
          </button>
        </div>
        <div className="space-y-2.5 rounded-xl bg-white p-4">
          {pmixItems.map((item) => (
            <div key={item.item} className="flex items-center gap-3 text-[11px]">
              <span className="w-44 shrink-0 truncate font-semibold text-slate-900">{item.item}</span>
              <span className="h-2.5 rounded-full bg-slate-800" style={{ width: `${(item.revenue / maxRevenue) * 60}%` }} />
              <span className="ml-auto shrink-0 text-slate-500">{item.sold} sold</span>
              <span className="w-20 shrink-0 text-right font-semibold text-slate-900">${item.revenue.toLocaleString()}</span>
              <span className="w-12 shrink-0 text-right text-slate-400">{((item.revenue / totalRevenue) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
