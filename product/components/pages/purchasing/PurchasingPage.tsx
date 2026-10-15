"use client";

import { useState } from "react";
import { PageHeader } from "../../shared/ui";
import { initialOrders, type PurchaseOrder } from "./data";
import OrderGuide from "./guide/OrderGuide";
import SuggestedOrders from "./suggestions/SuggestedOrders";
import OrderHistory from "./history/OrderHistory";

type Tab = "guide" | "suggestions" | "history";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "guide", label: "Order guides" },
  { id: "suggestions", label: "Suggested orders" },
  { id: "history", label: "Purchase history" },
];

export default function PurchasingPage({ tab: tabProp, onTabChange }: { tab?: string; onTabChange?: (tab: string) => void }) {
  const [internalTab, setInternalTab] = useState<Tab>("guide");
  const tab = (tabProp as Tab | undefined) ?? internalTab;
  const setTab = (next: Tab) => {
    setInternalTab(next);
    onTabChange?.(next);
  };
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Purchasing & Ordering"
        action={
          <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
            {tabs.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTab(option.id)}
                className={`px-3.5 py-2 text-xs font-semibold transition-colors ${
                  index > 0 ? "border-l border-slate-200" : ""
                } ${tab === option.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      {tab === "guide" && <OrderGuide />}
      {tab === "suggestions" && (
        <SuggestedOrders
          onPlaced={(vendor, itemCount, total) =>
            setOrders((current) => [
              {
                id: `PO-D-${2262 + current.length}`,
                vendor,
                outlet: "Downtown",
                date: "Oct 14",
                itemCount,
                total,
                status: "Placed",
                via: "Vendor integration",
              },
              ...current,
            ])
          }
        />
      )}
      {tab === "history" && <OrderHistory orders={orders} />}
    </div>
  );
}
