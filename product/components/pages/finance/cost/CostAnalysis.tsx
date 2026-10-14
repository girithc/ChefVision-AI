"use client";

import { TriangleAlert } from "lucide-react";
import { StatusBadge } from "../../../shared/ui";
import { categoryUsage, usageVariance } from "../data";

export default function CostAnalysis() {
  const actualFood = usageVariance.reduce((sum, row) => sum + row.actual * row.costPerUnit, 0);
  const theoreticalFood = usageVariance.reduce((sum, row) => sum + row.theoretical * row.costPerUnit, 0);
  const variance = actualFood - theoreticalFood;
  const maxCategory = Math.max(...categoryUsage.map((entry) => entry.used));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Actual food cost (week)</div>
          <div className="mt-1 text-lg font-bold text-slate-900">${actualFood.toFixed(0)}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Theoretical food cost (week)</div>
          <div className="mt-1 text-lg font-bold text-slate-900">${theoreticalFood.toFixed(0)}</div>
          <div className="mt-0.5 text-[10px] text-slate-400">From POS sales × recipe BOM</div>
        </div>
        <div className={`rounded-2xl border p-4 shadow-xs ${variance > 0 ? "border-rose-200 bg-rose-50/60" : "border-emerald-200 bg-emerald-50/60"}`}>
          <div className="text-[11px] font-medium text-slate-400">Usage variance</div>
          <div className={`mt-1 text-lg font-bold ${variance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {variance > 0 ? "+" : ""}${variance.toFixed(0)}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            {variance > 0 ? "Using more than recipes predict" : "Using less than recipes predict"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">
          Actual versus theoretical ingredient usage
        </div>
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 pt-4 pb-3 font-medium">Ingredient</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Theoretical</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Actual</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Variance</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Cost of variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {usageVariance.map((row) => {
                const diff = row.actual - row.theoretical;
                const cost = diff * row.costPerUnit;
                const negative = diff > 0;
                return (
                  <tr key={row.ingredient}>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{row.ingredient}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{row.theoretical.toFixed(1)} {row.unit}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{row.actual.toFixed(1)} {row.unit}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={negative ? "font-semibold text-rose-600" : "font-semibold text-emerald-600"}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)} {row.unit}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-semibold ${negative ? "text-rose-600" : "text-emerald-600"}`}>
                      {cost > 0 ? "+" : ""}${cost.toFixed(0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">Food usage report — week by category</div>
        <div className="space-y-2.5 rounded-xl bg-white p-4">
          {categoryUsage.map((entry) => (
            <div key={entry.category} className="flex items-center gap-3 text-[11px]">
              <span className="w-20 shrink-0 text-slate-500">{entry.category}</span>
              <span className="h-2.5 rounded-full bg-slate-800" style={{ width: `${(entry.used / maxCategory) * 70}%` }} />
              <span className="ml-auto shrink-0 font-semibold text-slate-900">${entry.used.toLocaleString()}</span>
            </div>
          ))}
        </div>
        {variance > 200 && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span className="text-xs text-rose-700">
              Variance is trending high — likely over-portioning or unrecorded waste. Check chicken and lettuce first.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
