"use client";

import { useMemo } from "react";
import { TriangleAlert } from "lucide-react";
import { StatusBadge } from "../../../shared/ui";
import { formatDate, type Asset } from "../data";

type ScheduleRow = { asset: Asset; task: Asset["preventive"][number] };

type MaintenanceTimelineProps = {
  rows: ScheduleRow[];
};

type Group = {
  id: string;
  label: string;
  tone: "rose" | "sky";
  rows: ScheduleRow[];
};

export default function MaintenanceTimeline({ rows }: MaintenanceTimelineProps) {
  const groups = useMemo<Group[]>(() => {
    const now = new Date();
    const todayIso = toIso(now);

    const buckets: Record<string, ScheduleRow[]> = {
      overdue: [],
      planned: [],
    };

    for (const row of rows) {
      if (row.task.nextDue < todayIso) buckets.overdue.push(row);
      else buckets.planned.push(row);
    }

    const sortByDue = (a: ScheduleRow, b: ScheduleRow) => a.task.nextDue.localeCompare(b.task.nextDue);
    buckets.overdue.sort(sortByDue);
    buckets.planned.sort(sortByDue);

    const defined: Group[] = [
      { id: "overdue", label: "Overdue", tone: "rose", rows: buckets.overdue },
      { id: "planned", label: "Planned tasks", tone: "sky", rows: buckets.planned },
    ];
    return defined.filter((group) => group.rows.length > 0);
  }, [rows]);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.id}>
          <div className={`rounded-2xl p-5 ${group.id === "overdue" ? "bg-rose-50/70" : "bg-slate-50"}`}>
            <div className="flex items-center gap-2 px-1 pb-3">
              {group.id === "overdue" && <TriangleAlert className="h-3.5 w-3.5 text-rose-600" />}
              <h3 className="text-xs font-bold text-slate-800">{group.label}</h3>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                {group.rows.length}
              </span>
            </div>
            <div className="app-scrollbar max-h-64 divide-y divide-slate-100 overflow-y-auto overscroll-contain rounded-xl bg-white">
              {group.rows.map(({ asset, task }) => (
                <div key={`${asset.id}-${task.task}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 h-8 w-1 shrink-0 rounded-full ${group.id === "overdue" ? "bg-rose-300" : "bg-slate-200"}`} />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{task.task}</div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {asset.name} · {asset.location} · {task.cadence}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">Last done {formatDate(task.lastDone)}</p>
                    </div>
                  </div>
                  <StatusBadge
                    label={
                      group.id === "overdue"
                        ? `Overdue · was due ${formatDate(task.nextDue)}`
                        : task.nextDue === toIso(new Date())
                          ? "Due today"
                          : `Due ${formatDate(task.nextDue)}`
                    }
                    tone={group.id === "overdue" ? "rose" : "sky"}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {groups.length === 0 && (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <p className="text-xs text-slate-400">No preventive maintenance scheduled.</p>
        </div>
      )}
    </div>
  );
}

function toIso(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
