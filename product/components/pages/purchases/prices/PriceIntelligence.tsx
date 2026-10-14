"use client";

import { useMemo, useState } from "react";
import { ChevronDown, History, TriangleAlert } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { priceAlerts, priceRows, type PriceRow } from "../data";

const trendTone: Record<"up" | "down" | "flat", Tone> = { up: "rose", down: "emerald", flat: "slate" };

/** % change across the product's price history: (latest − oldest) / oldest. */
function trendOf(row: PriceRow): { changePct: number; trend: "up" | "down" | "flat" } {
  const first = row.history[0]?.price ?? 0;
  const last = row.history[row.history.length - 1]?.price ?? 0;
  if (!first) return { changePct: 0, trend: "flat" };
  const changePct = Math.round(((last - first) / first) * 100);
  const trend = changePct > 1 ? "up" : changePct < -1 ? "down" : "flat";
  return { changePct, trend };
}

type ViewMode = "cheapest" | "select";

export default function PriceIntelligence() {
  const [mode, setMode] = useState<ViewMode>("cheapest");
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);

  const allSuppliers = useMemo(
    () => [...new Set(priceRows.flatMap((row) => row.offers.map((offer) => offer.supplier)))],
    []
  );

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>(allSuppliers);

  function cheapestFor(row: PriceRow) {
    const pool = mode === "cheapest" ? row.offers : row.offers.filter((offer) => selectedSuppliers.includes(offer.supplier));
    if (pool.length === 0) return null;
    return pool.reduce((best, offer) => (offer.price < best.price ? offer : best));
  }

  function toggleSupplier(supplier: string) {
    setSelectedSuppliers((current) =>
      current.includes(supplier) ? current.filter((item) => item !== supplier) : [...current, supplier]
    );
  }

  return (
    <div className="space-y-5">
      {priceAlerts.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-2 px-1">
            <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="text-xs font-semibold text-amber-800">
              {priceAlerts.length} unexpected price {priceAlerts.length > 1 ? "increases" : "increase"} detected
            </span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {priceAlerts.map((alert) => (
              <li key={alert.id} className="rounded-xl bg-white/90 px-3 py-2 text-[11px] text-amber-900">
                <strong className="font-semibold">{alert.ingredient}</strong> · {alert.supplier} — {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
          <div className="text-xs font-bold text-slate-800">Price comparison across suppliers</div>
          <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
            {(["cheapest", "select"] as ViewMode[]).map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  index > 0 ? "border-l border-slate-200" : ""
                } ${mode === option ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {option === "cheapest" ? "Cheapest" : "Choose suppliers"}
              </button>
            ))}
          </div>
        </div>

        {mode === "select" && (
          <div className="flex flex-wrap gap-1.5 px-1 pb-3">
            {allSuppliers.map((supplier) => {
              const active = selectedSuppliers.includes(supplier);
              return (
                <button
                  key={supplier}
                  type="button"
                  onClick={() => toggleSupplier(supplier)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    active ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {supplier}
                </button>
              );
            })}
          </div>
        )}

        <div className="app-scrollbar max-h-[19.5rem] overflow-y-auto overscroll-contain rounded-xl bg-white">
          <div className="grid grid-cols-1 items-start sm:grid-cols-2 lg:grid-cols-4">
          {priceRows.map((row) => {
            const cheapest = cheapestFor(row);
            const considered = mode === "cheapest" ? row.offers.length : row.offers.filter((offer) => selectedSuppliers.includes(offer.supplier)).length;
            const expanded = expandedIngredient === row.ingredient;
            return (
              <article
                key={row.ingredient}
                onClick={() => setExpandedIngredient((current) => (current === row.ingredient ? null : row.ingredient))}
                className="cursor-pointer border border-slate-100 p-3.5 transition-colors hover:bg-slate-50/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-900">{row.ingredient}</div>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
                {cheapest ? (
                  <>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-bold tracking-tight text-slate-900">${cheapest.price.toFixed(2)}</span>
                      <span className="text-[11px] text-slate-500">/{cheapest.unit}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] font-medium text-emerald-700">{cheapest.supplier}</div>
                    <div className="mt-1.5 text-[10px] text-slate-400">
                      {considered === 0
                        ? "No comparison"
                        : mode === "cheapest"
                          ? `Cheapest of ${considered} suppliers`
                          : `Cheapest of ${considered} selected`}
                    </div>
                  </>
                ) : (
                  <div className="mt-2 text-[11px] text-slate-400">
                    Not offered by the selected suppliers.
                  </div>
                )}

                {expanded && (
                  <div className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2.5">
                    {[...row.offers]
                      .sort((a, b) => a.price - b.price)
                      .map((offer) => {
                        const isBest = cheapest?.supplier === offer.supplier;
                        const inScope = mode === "cheapest" || selectedSuppliers.includes(offer.supplier);
                        return (
                          <div key={offer.supplier} className="flex items-center justify-between gap-2 text-[11px]">
                            <span className={isBest ? "font-semibold text-emerald-700" : inScope ? "text-slate-600" : "text-slate-400"}>
                              {offer.supplier}
                              {isBest && " · best"}
                            </span>
                            <span className={`font-semibold ${inScope ? "text-slate-900" : "text-slate-400"}`}>
                              ${offer.price.toFixed(2)}/{offer.unit}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </article>
            );
          })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex items-center gap-2 px-1 pb-3 text-xs font-bold text-slate-800">
          <History className="h-3.5 w-3.5 text-slate-500" />
          Product-level price history
        </div>
        <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl bg-white sm:grid-cols-2 lg:grid-cols-3">
          {priceRows.map((row) => {
            const { changePct, trend } = trendOf(row);
            return (
              <article key={row.ingredient} className="border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{row.ingredient}</span>
                  <StatusBadge label={`${changePct === 0 ? "Flat" : `${changePct > 0 ? "+" : ""}${changePct}%`} (3 mo)`} tone={trendTone[trend]} />
                </div>
                <div className="mt-2.5 space-y-1.5">
                  {row.history.map((point) => (
                    <div key={point.date} className="flex items-center gap-2 text-[11px]">
                      <span className="w-16 text-slate-400">{point.date}</span>
                      <span className="h-1.5 rounded-full bg-slate-200" style={{ width: `${(point.price / Math.max(...row.history.map((h) => h.price))) * 100}%` }} />
                      <span className="ml-auto font-semibold text-slate-700">${point.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
