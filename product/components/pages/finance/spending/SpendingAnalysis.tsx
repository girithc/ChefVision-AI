"use client";

import { TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { StatusBadge } from "../../../shared/ui";
import { budgets, ingredientAlerts, priceMovements, supplierSpend } from "../data";

const sliceColors = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#6366f1", "#64748b"];

function donutSlice(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  const x1 = cx + rOuter * Math.cos(start);
  const y1 = cy + rOuter * Math.sin(start);
  const x2 = cx + rOuter * Math.cos(end);
  const y2 = cy + rOuter * Math.sin(end);
  const x3 = cx + rInner * Math.cos(end);
  const y3 = cy + rInner * Math.sin(end);
  const x4 = cx + rInner * Math.cos(start);
  const y4 = cy + rInner * Math.sin(start);
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${x1},${y1} A ${rOuter},${rOuter} 0 ${large} 1 ${x2},${y2} L ${x3},${y3} A ${rInner},${rInner} 0 ${large} 0 ${x4},${y4} Z`;
}

export default function SpendingAnalysis() {
  const maxSpend = Math.max(...supplierSpend.map((entry) => entry.spend));

  const totalSpend = budgets.reduce((sum, row) => sum + row.actual, 0);
  const pieCenter = 100;
  let pieAngle = -Math.PI / 2;
  const slices = budgets.map((row, index) => {
    const sweep = (row.actual / totalSpend) * Math.PI * 2;
    const slice = {
      row,
      color: sliceColors[index % sliceColors.length],
      path: donutSlice(pieCenter, pieCenter, 88, 54, pieAngle, pieAngle + sweep - 0.02),
    };
    pieAngle += sweep;
    return slice;
  });

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">Category budgets — budget versus actual spending</div>
        <div className="grid items-center gap-5 rounded-xl bg-white p-5 lg:grid-cols-[240px_1fr]">
          <svg viewBox="0 0 200 200" className="mx-auto w-48" role="img" aria-label="Actual spending by category">
            {slices.map((slice) => (
              <path key={slice.row.category} d={slice.path} fill={slice.color} stroke="#ffffff" strokeWidth={2} />
            ))}
            <text x={pieCenter} y={pieCenter - 4} textAnchor="middle" fontSize="11" fill="#64748b">
              Total actual
            </text>
            <text x={pieCenter} y={pieCenter + 12} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
              ${totalSpend.toLocaleString()}
            </text>
          </svg>

          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
            {budgets.map((row, index) => {
              const pct = (row.actual / row.budget) * 100;
              const over = row.actual > row.budget;
              return (
                <div key={row.category} className="flex items-center gap-3 px-4 py-3 text-[11px]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: sliceColors[index % sliceColors.length] }} />
                  <span className="min-w-0 flex-1 truncate font-semibold text-slate-900">{row.category}</span>
                  <span className="shrink-0 text-slate-500">
                    ${row.actual.toLocaleString()} of ${row.budget.toLocaleString()}
                  </span>
                  <StatusBadge label={`${pct.toFixed(0)}% ${over ? "over" : "used"}`} tone={over ? "rose" : pct > 90 ? "amber" : "emerald"} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="px-1 pb-3 text-xs font-bold text-slate-800">Price movement report — 30 days</div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
            {priceMovements.map((row) => {
              const pct = ((row.to - row.from) / row.from) * 100;
              const up = row.to > row.from;
              return (
                <div key={row.ingredient} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{row.ingredient}</div>
                    <p className="mt-0.5 text-[11px] text-slate-400">{row.supplier}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-rose-600" : "text-emerald-600"}`}>
                    {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    ${row.from.toFixed(2)} → ${row.to.toFixed(2)}/{row.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-center gap-2 px-1">
              <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">Ingredient price alerts</span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {ingredientAlerts.map((alert) => (
                <li key={alert.id} className="rounded-xl bg-white/90 px-3 py-2 text-[11px] text-amber-900">
                  <strong className="font-semibold">{alert.ingredient}</strong> — {alert.message}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="px-1 pb-3 text-xs font-bold text-slate-800">Inventory & purchasing analysis — spend by supplier</div>
            <div className="space-y-2.5 rounded-xl bg-white p-4">
              {supplierSpend.map((entry) => (
                <div key={entry.supplier} className="flex items-center gap-3 text-[11px]">
                  <span className="w-32 shrink-0 truncate text-slate-500">{entry.supplier}</span>
                  <span className="h-2.5 rounded-full bg-sky-500" style={{ width: `${(entry.spend / maxSpend) * 55}%` }} />
                  <span className="ml-auto shrink-0 font-semibold text-slate-900">${entry.spend.toLocaleString()}</span>
                  <span className="shrink-0 text-slate-400">{entry.invoices} inv.</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
