"use client";

import { useState } from "react";
import { PageHeader } from "../../shared/ui";
import { stockItems } from "./data";
import StockTable from "./stock/StockTable";
import CountSheets from "./counts/CountSheets";
import ValueTracking from "./value/ValueTracking";

type Tab = "stock" | "counts" | "value";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "stock", label: "Stock" },
  { id: "counts", label: "Counts" },
  { id: "value", label: "Value & flow" },
];

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("stock");
  const [counted, setCounted] = useState<Record<string, number>>({});

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory"
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

      {tab === "stock" && <StockTable items={stockItems} />}
      {tab === "counts" && <CountSheets onCountChange={setCounted} />}
      {tab === "value" && <ValueTracking />}
    </div>
  );
}
