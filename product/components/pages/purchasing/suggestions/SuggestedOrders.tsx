"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { StatusBadge } from "../../../shared/ui";
import { orderGuide, suggestedQty, vendors, type OrderGuideItem } from "../data";

type SuggestedOrdersProps = {
  onPlaced: (vendor: string, itemCount: number, total: number) => void;
};

export default function SuggestedOrders({ onPlaced }: SuggestedOrdersProps) {
  const [placedVendors, setPlacedVendors] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const suggestions = useMemo(
    () =>
      vendors
        .map((vendor) => {
          const items = orderGuide
            .filter((item) => item.vendor === vendor && suggestedQty(item) > 0)
            .map((item) => {
              const suggested = suggestedQty(item);
              return { item, qty: quantities[item.id] ?? suggested, suggested };
            });
          const total = items.reduce((sum, entry) => sum + entry.qty * entry.item.lastPrice, 0);
          return { vendor, items, total };
        })
        .filter((group) => group.items.length > 0),
    [quantities]
  );

  return (
    <div className="space-y-5">
      {suggestions.length === 0 && (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <p className="text-xs text-slate-400">Everything is at par — no ordering needed right now.</p>
        </div>
      )}

      {suggestions.map((group) => {
        const placed = placedVendors.includes(group.vendor);
        return (
          <section key={group.vendor} className="rounded-2xl bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
              <div className="text-xs font-bold text-slate-800">
                Suggested order — {group.vendor}
                <span className="ml-2 text-slate-400">{group.items.length} items · ${group.total.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (placed) return;
                  setPlacedVendors((current) => [...current, group.vendor]);
                  onPlaced(group.vendor, group.items.length, group.total);
                }}
                disabled={placed}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                  placed
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                {placed ? "Placed via integration ✓" : "Place via integration"}
              </button>
            </div>

            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
              {group.items.map(({ item, qty, suggested }) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-[11px]">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {item.location} · on hand {item.onHand} {item.unit} · par {item.parLevel} · {item.caseSize}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={`Par gap ${suggested} ${item.unit}`} tone="amber" />
                    <input
                      type="number"
                      value={qty}
                      onChange={(event) =>
                        setQuantities((current) => ({ ...current, [item.id]: Number(event.target.value) }))
                      }
                      className="w-20 rounded-lg border border-slate-200 px-2.5 py-1.5 text-right text-xs font-semibold text-slate-900 outline-none focus:border-slate-400"
                    />
                    <span className="w-8 text-slate-500">{item.unit}</span>
                    <span className="w-16 text-right font-bold text-slate-900">${(qty * item.lastPrice).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
