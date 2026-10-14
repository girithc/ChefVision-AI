"use client";

import { useMemo, useState } from "react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { locations, stockItems, type StockItem } from "../data";

type StockTableProps = {
  items: StockItem[];
};

export default function StockTable({ items }: StockTableProps) {
  const [locationFilter, setLocationFilter] = useState<string>("All");

  const visible = useMemo(
    () => (locationFilter === "All" ? items : items.filter((item) => item.location === locationFilter)),
    [items, locationFilter]
  );

  const totalValue = visible.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const belowPar = visible.filter((item) => item.quantity < item.parLevel).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Stock valuation</div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Items tracked</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{visible.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Below par</div>
          <div className={`mt-1 text-lg font-bold ${belowPar ? "text-amber-600" : "text-slate-900"}`}>{belowPar}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Storage locations</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{locations.length}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
          <div className="text-xs font-bold text-slate-800">Stock on hand — quantities & valuation</div>
          <div role="group" className="inline-flex flex-wrap overflow-hidden rounded-lg border border-slate-200">
            {["All", ...locations].map((location, index) => (
              <button
                key={location}
                type="button"
                onClick={() => setLocationFilter(location)}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  index > 0 ? "border-l border-slate-200" : ""
                } ${locationFilter === location ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 pt-4 pb-3 font-medium">Item</th>
                <th className="px-5 pt-4 pb-3 font-medium">Category</th>
                <th className="px-5 pt-4 pb-3 font-medium">Location</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">On hand</th>
                <th className="px-5 pt-4 pb-3 font-medium">Conversion</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Unit cost</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Value</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Par status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {visible.map((item) => {
                const below = item.quantity < item.parLevel;
                return (
                  <tr key={item.id}>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{item.category}</td>
                    <td className="px-5 py-3.5 text-slate-600">{item.location}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-5 py-3.5 text-[10px] text-slate-400">{item.conversion}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="font-semibold text-slate-900">${item.unitCost.toFixed(2)}</div>
                      <div className="mt-0.5 text-[9px] text-slate-400">via {item.costSource}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                      ${(item.quantity * item.unitCost).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <StatusBadge
                        label={below ? "Below par" : "On par"}
                        tone={below ? "amber" : "emerald"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
