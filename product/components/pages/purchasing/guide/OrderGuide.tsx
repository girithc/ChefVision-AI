"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "../../../shared/ui";
import { orderGuide, suggestedQty } from "../data";

export default function OrderGuide() {
  const [vendorFilter, setVendorFilter] = useState("All");
  const [dimension, setDimension] = useState<"category" | "location">("category");

  const vendors = useMemo(() => [...new Set(orderGuide.map((item) => item.vendor))], []);
  const items = useMemo(
    () => (vendorFilter === "All" ? orderGuide : orderGuide.filter((item) => item.vendor === vendorFilter)),
    [vendorFilter]
  );
  const groups = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const key = dimension === "category" ? item.category : item.location;
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [items, dimension]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
          <div className="text-xs font-bold text-slate-800">
            Vendor order guides
            <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
              Shared — all outlets
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
              {(["category", "location"] as const).map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDimension(option)}
                  className={`px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors ${
                    index > 0 ? "border-l border-slate-200" : ""
                  } ${dimension === option ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  By {option}
                </button>
              ))}
            </div>
            <select
              value={vendorFilter}
              onChange={(event) => setVendorFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="All">All vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor} value={vendor}>{vendor}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {groups.map(([group, groupItems]) => (
            <section key={group} className="overflow-hidden rounded-xl bg-white">
              <div className="border-b border-slate-100 px-5 py-2.5 text-[11px] font-bold text-slate-700">
                {group} <span className="font-medium text-slate-400">· {groupItems.length} items</span>
              </div>
              <table className="w-full text-left text-[11.5px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="px-5 pt-3 pb-2.5 font-medium">Item</th>
                    <th className="px-5 pt-3 pb-2.5 font-medium">Storage</th>
                    <th className="px-5 pt-3 pb-2.5 font-medium text-right">Par level</th>
                    <th className="px-5 pt-3 pb-2.5 font-medium text-right">On hand</th>
                    <th className="px-5 pt-3 pb-2.5 font-medium text-right">Suggested</th>
                    <th className="px-5 pt-3 pb-2.5 font-medium text-right">Last price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {groupItems.map((item) => {
                    const suggested = suggestedQty(item);
                    return (
                      <tr key={item.id}>
                        <td className="px-5 py-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="px-5 py-3 text-slate-600">{item.location}</td>
                        <td className="px-5 py-3 text-right text-slate-600">{item.parLevel} {item.unit}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={suggested > 0 ? "font-semibold text-amber-600" : "font-semibold text-emerald-600"}>
                            {item.onHand} {item.unit}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {suggested > 0 ? (
                            <StatusBadge label={`Order ${suggested} ${item.unit}`} tone="sky" />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-900">${item.lastPrice.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
