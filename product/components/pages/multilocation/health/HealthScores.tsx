"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { locationHealth } from "../data";

function scoreTone(score: number): Tone {
  return score >= 85 ? "emerald" : score >= 75 ? "amber" : "rose";
}

export default function HealthScores() {
  const ranked = [...locationHealth].sort((a, b) => b.score - a.score);
  const regions = [...new Set(locationHealth.map((location) => location.region))];
  const companySales = locationHealth.reduce((sum, row) => sum + row.sales, 0);
  const companyScore = Math.round(locationHealth.reduce((sum, row) => sum + row.score, 0) / locationHealth.length);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl bg-white sm:grid-cols-2 lg:grid-cols-3">
        {locationHealth.map((location) => (
          <article key={location.name} className="border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-900">{location.name}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{location.region} region</div>
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${location.trend === "up" ? "text-emerald-600" : location.trend === "down" ? "text-rose-600" : "text-slate-400"}`}>
                {location.trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : location.trend === "down" ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                {location.trend === "flat" ? "flat" : `${location.trend === "up" ? "+" : "−"}${Math.abs(location.trend === "up" ? 3 : 2)} pts`}
              </span>
            </div>
            <div className="mt-3 flex items-end gap-3">
              <span className={`text-3xl font-black tracking-tight ${location.score >= 85 ? "text-emerald-600" : location.score >= 75 ? "text-amber-600" : "text-rose-600"}`}>
                {location.score}
              </span>
              <span className="pb-1 text-[10px] text-slate-400">/ 100 operational health</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${location.score >= 85 ? "bg-emerald-500" : location.score >= 75 ? "bg-amber-500" : "bg-rose-500"}`}
                style={{ width: `${location.score}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-2.5 text-center text-[10px] text-slate-400">
              <div><div className="font-bold text-slate-900">{location.foodPct}%</div>food</div>
              <div><div className="font-bold text-slate-900">{location.laborPct}%</div>labor</div>
              <div><div className={`font-bold ${location.checklistCompletion >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{location.checklistCompletion}%</div>checklists</div>
            </div>
            {location.openIssues > 0 && (
              <div className="mt-2 text-[10px] font-semibold text-rose-600">{location.openIssues} open issues</div>
            )}
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="px-1 pb-3 text-xs font-bold text-slate-800">Outlet ranking & comparison</div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
            {ranked.map((location, index) => (
              <div key={location.name} className="flex items-center gap-3 px-5 py-3 text-[11px]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">{index + 1}</span>
                <span className="flex-1 font-semibold text-slate-900">{location.name}</span>
                <span className="text-slate-500">${location.sales.toLocaleString()} sales</span>
                <StatusBadge label={`${location.score}`} tone={scoreTone(location.score)} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="px-1 pb-3 text-xs font-bold text-slate-800">Regional & company-wide</div>
          <div className="space-y-2.5 rounded-xl bg-white p-4">
            {regions.map((region) => {
              const rows = locationHealth.filter((location) => location.region === region);
              const sales = rows.reduce((sum, row) => sum + row.sales, 0);
              return (
                <div key={region} className="flex items-center gap-3 text-[11px]">
                  <span className="w-20 shrink-0 font-semibold text-slate-900">{region}</span>
                  <span className="h-2.5 rounded-full bg-sky-500" style={{ width: `${(sales / companySales) * 60}%` }} />
                  <span className="ml-auto shrink-0 text-slate-500">${sales.toLocaleString()}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
              <span className="font-bold text-slate-800">Company-wide</span>
              <span className="text-slate-500">${companySales.toLocaleString()} · avg health {companyScore}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
