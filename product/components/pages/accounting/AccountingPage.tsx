"use client";

import { useState } from "react";
import { PageHeader } from "../../shared/ui";
import Integrations from "./integrations/Integrations";
import SalesImports from "./sales/SalesImports";
import BillPay from "./bills/BillPay";
import Consolidated from "./consolidated/Consolidated";

type Tab = "integrations" | "sales" | "bills" | "consolidated";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "integrations", label: "Integrations" },
  { id: "sales", label: "Sales & PMIX" },
  { id: "bills", label: "Bill pay" },
  { id: "consolidated", label: "Consolidated" },
];

export default function AccountingPage({ tab: tabProp, onTabChange }: { tab?: string; onTabChange?: (tab: string) => void }) {
  const [internalTab, setInternalTab] = useState<Tab>("integrations");
  const tab = (tabProp as Tab | undefined) ?? internalTab;
  const setTab = (next: Tab) => {
    setInternalTab(next);
    onTabChange?.(next);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Accounting & Labor"
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

      {tab === "integrations" && <Integrations />}
      {tab === "sales" && <SalesImports />}
      {tab === "bills" && <BillPay />}
      {tab === "consolidated" && <Consolidated />}
    </div>
  );
}
