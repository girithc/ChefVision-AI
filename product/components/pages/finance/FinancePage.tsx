"use client";

import { useState } from "react";
import { PageHeader } from "../../shared/ui";
import DailyPnl from "./daily/DailyPnl";
import CostAnalysis from "./cost/CostAnalysis";
import SpendingAnalysis from "./spending/SpendingAnalysis";
import SalesTrends from "./trends/SalesTrends";

type Tab = "daily" | "cost" | "spending" | "trends";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "daily", label: "Daily P&L" },
  { id: "cost", label: "Food cost" },
  { id: "spending", label: "Spending & budgets" },
  { id: "trends", label: "Sales trends" },
];

export default function FinancePage({ tab: tabProp, onTabChange }: { tab?: string; onTabChange?: (tab: string) => void }) {
  const [internalTab, setInternalTab] = useState<Tab>("daily");
  const tab = (tabProp as Tab | undefined) ?? internalTab;
  const setTab = (next: Tab) => {
    setInternalTab(next);
    onTabChange?.(next);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Financial Reports"
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

      {tab === "daily" && <DailyPnl />}
      {tab === "cost" && <CostAnalysis />}
      {tab === "spending" && <SpendingAnalysis />}
      {tab === "trends" && <SalesTrends />}
    </div>
  );
}
