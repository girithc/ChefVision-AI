"use client";

import { useState } from "react";
import { PageHeader } from "../../shared/ui";
import HealthScores from "./health/HealthScores";
import IssuesBoard from "./issues/IssuesBoard";
import WeeklyReports from "./reports/WeeklyReports";
import AiAccess from "./ai/AiAccess";

type Tab = "health" | "issues" | "reports" | "ai";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "health", label: "Health & rankings" },
  { id: "issues", label: "Issues" },
  { id: "reports", label: "Weekly report" },
  { id: "ai", label: "AI & integrations" },
];

export default function MultiLocationPage({ tab: tabProp, onTabChange }: { tab?: string; onTabChange?: (tab: string) => void }) {
  const [internalTab, setInternalTab] = useState<Tab>("health");
  const tab = (tabProp as Tab | undefined) ?? internalTab;
  const setTab = (next: Tab) => {
    setInternalTab(next);
    onTabChange?.(next);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Multi-location & AI"
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

      {tab === "health" && <HealthScores />}
      {tab === "issues" && <IssuesBoard />}
      {tab === "reports" && <WeeklyReports />}
      {tab === "ai" && <AiAccess />}
    </div>
  );
}
