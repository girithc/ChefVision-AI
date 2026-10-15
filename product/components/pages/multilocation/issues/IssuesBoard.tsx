"use client";

import { useState } from "react";
import { Bell, Check, CircleCheck, Repeat2, TriangleAlert } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { initialIssues, recurringProblems, type Issue, type IssueStatus } from "../data";

const statusTone: Record<IssueStatus, Tone> = {
  Open: "sky",
  "Due soon": "amber",
  Overdue: "rose",
  Escalated: "rose",
  Closed: "emerald",
};

export default function IssuesBoard() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [confirmed, setConfirmed] = useState<string[]>([]);

  function closeIssue(id: string) {
    setIssues((current) =>
      current.map((issue) =>
        issue.id === id ? { ...issue, status: "Closed", closedAt: "Oct 14" } : issue
      )
    );
    setConfirmed((current) => [...current, id]);
  }

  const open = issues.filter((issue) => issue.status !== "Closed");
  const closed = issues.filter((issue) => issue.status === "Closed");

  return (
    <div className="space-y-5">
      {recurringProblems.length > 0 && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-center gap-2 px-1">
            <Repeat2 className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="text-xs font-semibold text-rose-700">Recurring problems across locations</span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {recurringProblems.map((problem) => (
              <li key={problem.id} className="rounded-xl bg-white/90 px-3 py-2 text-[11px] text-rose-900">
                <strong className="font-semibold">{problem.problem}</strong> — {problem.occurrences}× across{" "}
                {problem.locations.join(", ")} · last seen {problem.lastSeen}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">Open issues — owners, due dates, escalation</div>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
          {open.map((issue) => (
            <div key={issue.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  {issue.title}
                  {issue.recurring && <Repeat2 className="h-3.5 w-3.5 text-slate-300" />}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {issue.location} · owner: <strong className="font-semibold text-slate-700">{issue.owner}</strong> · due {issue.dueDate} · reminder {issue.reminder}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge label={issue.status} tone={statusTone[issue.status]} />
                {issue.status === "Escalated" && <TriangleAlert className="h-3.5 w-3.5 text-rose-500" />}
                <button
                  type="button"
                  title="Send reminder to owner"
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <Bell className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => closeIssue(issue.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    confirmed.includes(issue.id)
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  {confirmed.includes(issue.id) ? "Closed ✓" : "Confirm closed"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {closed.length > 0 && (
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="flex items-center gap-2 px-1 pb-3 text-xs font-bold text-slate-800">
            <CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
            Closed — corrective actions confirmed
          </div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
            {closed.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between gap-3 px-5 py-3 text-[11px]">
                <span className="font-semibold text-slate-900">{issue.title}</span>
                <span className="text-slate-500">{issue.location} · {issue.owner} · closed {issue.closedAt}</span>
                <StatusBadge label="Verified closed" tone="emerald" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
