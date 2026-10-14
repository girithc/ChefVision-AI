"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { yearOverYear, weekOverWeek } from "../data";

export default function SalesTrends() {
  const thisWeekTotal = weekOverWeek.reduce((sum, row) => sum + row.thisWeek, 0);
  const lastWeekTotal = weekOverWeek.reduce((sum, row) => sum + row.lastWeek, 0);
  const wowPct = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
  const maxBar = Math.max(...weekOverWeek.flatMap((row) => [row.thisWeek, row.lastWeek]));

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3">
          <div className="text-xs font-bold text-slate-800">Week-over-week sales</div>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${wowPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {wowPct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {wowPct >= 0 ? "+" : ""}{wowPct.toFixed(1)}% vs last week
          </span>
        </div>
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 pt-4 pb-3 font-medium">Day</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">This week</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Last week</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Change</th>
                <th className="px-5 pt-4 pb-3 font-medium">Comparison</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {weekOverWeek.map((row) => {
                const diff = row.thisWeek - row.lastWeek;
                const pct = (diff / row.lastWeek) * 100;
                const up = diff >= 0;
                return (
                  <tr key={row.day}>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{row.day}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900">${row.thisWeek.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-slate-500">${row.lastWeek.toLocaleString()}</td>
                    <td className={`px-5 py-3.5 text-right font-semibold ${up ? "text-emerald-600" : "text-rose-600"}`}>
                      {up ? "+" : ""}{pct.toFixed(1)}%
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="relative h-2.5 w-full min-w-32">
                        <span className="absolute inset-y-0 left-0 rounded-full bg-slate-200" style={{ width: `${(row.lastWeek / maxBar) * 100}%` }} />
                        <span className="absolute inset-y-0 left-0 rounded-full bg-slate-800" style={{ width: `${(row.thisWeek / maxBar) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center gap-4 border-t border-slate-100 px-5 py-2.5 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-800" /> This week (${thisWeekTotal.toLocaleString()})</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-200" /> Last week (${lastWeekTotal.toLocaleString()})</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">Year-over-year — October</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {yearOverYear.map((row) => {
            const pct = ((row.thisYear - row.lastYear) / row.lastYear) * 100;
            const up = pct >= 0;
            return (
              <article key={row.metric} className="border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">{row.metric}</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${up ? "text-emerald-600" : "text-rose-600"}`}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {up ? "+" : ""}{pct.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                  {row.unit === "$" ? `$${row.thisYear.toLocaleString(undefined, { maximumFractionDigits: row.thisYear < 1000 ? 2 : 0 })}` : row.thisYear.toLocaleString()}
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400">
                  Last October: {row.unit === "$" ? `$${row.lastYear.toLocaleString(undefined, { maximumFractionDigits: row.lastYear < 1000 ? 2 : 0 })}` : row.lastYear.toLocaleString()}
                </div>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(row.lastYear / row.thisYear) * 100}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
