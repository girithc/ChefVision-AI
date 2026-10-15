"use client";

import { useMemo, useState } from "react";
import { ChevronRight, TriangleAlert } from "lucide-react";
import { PageHeader, StatusBadge, type Tone } from "../../shared/ui";
import { checklists, type Checklist, type Frequency } from "./data";
import ChecklistRun from "./run/ChecklistRun";

const frequencyTone: Record<Frequency, Tone> = {
  daily: "sky",
  weekly: "indigo",
  monthly: "amber",
};

const filters: Array<{ id: "all" | Frequency; label: string }> = [
  { id: "all", label: "All" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export default function ChecklistsPage({ tab: tabProp, onTabChange }: { tab?: string; onTabChange?: (tab: string) => void }) {
  const [internalFilter, setInternalFilter] = useState<"all" | Frequency>("all");
  const filter = (tabProp as "all" | Frequency | undefined) ?? internalFilter;
  const setFilter = (next: "all" | Frequency) => {
    setInternalFilter(next);
    onTabChange?.(next);
  };
  const [running, setRunning] = useState<Checklist | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? checklists : checklists.filter((checklist) => checklist.frequency === filter)),
    [filter]
  );

  const overdue = visible.filter((checklist) => checklist.overdue);

  if (running) {
    return <ChecklistRun checklist={running} onBack={() => setRunning(null)} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Checklist & SOPs"
        action={
          <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
            {filters.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  index > 0 ? "border-l border-slate-200" : ""
                } ${
                  filter === option.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      {overdue.length > 0 && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="text-xs font-semibold text-rose-700">
              {overdue.length} checklist{overdue.length > 1 ? "s" : ""} overdue
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {overdue.map((checklist) => (
              <button
                key={checklist.id}
                type="button"
                onClick={() => setRunning(checklist)}
                className="rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 transition-colors hover:bg-rose-100"
              >
                {checklist.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
          {visible.map((checklist) => (
            <button
              key={checklist.id}
              type="button"
              onClick={() => setRunning(checklist)}
              className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-slate-50"
            >
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">{checklist.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {checklist.outlet} · {checklist.department} · {checklist.shift} shift
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {checklist.due} · {checklist.items.length} checks · {checklist.reminder}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {checklist.overdue && <StatusBadge label="Overdue" tone="rose" />}
                <StatusBadge label={checklist.frequency} tone={frequencyTone[checklist.frequency]} />
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
