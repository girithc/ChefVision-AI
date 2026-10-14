"use client";

import { StatusBadge, type Tone } from "../../../shared/ui";
import { dailyPnl } from "../data";

const money = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function DailyPnl() {
  const weekSales = dailyPnl.reduce((sum, row) => sum + row.sales, 0);
  const weekFood = dailyPnl.reduce((sum, row) => sum + row.foodCost, 0);
  const weekLabor = dailyPnl.reduce((sum, row) => sum + row.laborCost, 0);
  const weekProfit = weekSales - weekFood - weekLabor;
  const foodPct = (weekFood / weekSales) * 100;
  const laborPct = (weekLabor / weekSales) * 100;
  const primePct = foodPct + laborPct;

  const primeTone = (pct: number): Tone => (pct <= 60 ? "emerald" : pct <= 65 ? "amber" : "rose");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Week sales</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{money(weekSales)}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Food cost % of sales</div>
          <div className={`mt-1 text-lg font-bold ${foodPct <= 32 ? "text-emerald-600" : "text-amber-600"}`}>{foodPct.toFixed(1)}%</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Labor % of sales</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{laborPct.toFixed(1)}%</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            Prime cost (food + labor)
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-lg font-bold ${primePct <= 60 ? "text-emerald-600" : primePct <= 65 ? "text-amber-600" : "text-rose-600"}`}>
              {primePct.toFixed(1)}%
            </span>
            <StatusBadge label={primePct <= 60 ? "Healthy" : primePct <= 65 ? "Watch" : "Action needed"} tone={primeTone(primePct)} />
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">Target: under 60%</div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3">
          <div className="text-xs font-bold text-slate-800">Daily controllable P&L — last 7 days</div>
          <span className="text-[11px] font-semibold text-slate-500">
            Week controllable profit: <strong className="text-slate-900">{money(weekProfit)}</strong>
          </span>
        </div>
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-2.5 pt-4 pb-3 font-medium">Day</th>
                <th className="px-2.5 pt-4 pb-3 font-medium text-right">Sales</th>
                <th className="px-2.5 pt-4 pb-3 font-medium text-right">Covers</th>
                <th className="px-2.5 pt-4 pb-3 font-medium text-right">Food cost</th>
                <th className="px-2.5 pt-4 pb-3 font-medium text-right">Food %</th>
                <th className="px-2.5 pt-4 pb-3 font-medium text-right">Labor cost</th>
                <th className="px-2.5 pt-4 pb-3 font-medium text-right">Labor %</th>
                <th className="px-2.5 pt-4 pb-3 font-medium text-right">Prime cost</th>
                <th className="px-2.5 pt-4 pb-3 font-medium text-right">Controllable profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {dailyPnl.map((row) => {
                const foodPctDay = (row.foodCost / row.sales) * 100;
                const laborPctDay = (row.laborCost / row.sales) * 100;
                const prime = row.foodCost + row.laborCost;
                const profit = row.sales - prime;
                return (
                  <tr key={row.date}>
                    <td className="px-2.5 py-3.5 font-semibold text-slate-900">{row.day} · {row.date}</td>
                    <td className="px-2.5 py-3.5 text-right font-semibold text-slate-900">{money(row.sales)}</td>
                    <td className="px-2.5 py-3.5 text-right text-slate-600">{row.covers}</td>
                    <td className="px-2.5 py-3.5 text-right">{money(row.foodCost)}</td>
                    <td className="px-2.5 py-3.5 text-right">
                      <span className={foodPctDay <= 32 ? "text-emerald-600" : "text-amber-600"}>{foodPctDay.toFixed(1)}%</span>
                    </td>
                    <td className="px-2.5 py-3.5 text-right">{money(row.laborCost)}</td>
                    <td className="px-2.5 py-3.5 text-right">{laborPctDay.toFixed(1)}%</td>
                    <td className="px-2.5 py-3.5 text-right">
                      <StatusBadge label={`${((prime / row.sales) * 100).toFixed(1)}%`} tone={primeTone((prime / row.sales) * 100)} />
                    </td>
                    <td className={`px-2.5 py-3.5 text-right font-semibold ${profit > 0 ? "text-slate-900" : "text-rose-600"}`}>
                      {money(profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="px-1 pt-2 text-[10px] text-slate-400">
          Controllable profit = sales − food cost − labor cost. Prime cost badge: green ≤ 60% · amber ≤ 65% · red above.
        </p>
      </div>
    </div>
  );
}
