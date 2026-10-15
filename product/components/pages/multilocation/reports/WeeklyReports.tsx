"use client";

import { FileChartColumn, Send } from "lucide-react";
import { weeklyReport } from "../data";

export default function WeeklyReports() {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <FileChartColumn className="h-3.5 w-3.5 text-slate-500" />
          Weekly management & leadership report — {weeklyReport.week}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <Send className="h-3.5 w-3.5" />
          Send to leadership
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {weeklyReport.sections.map((section) => (
          <section key={section.title} className="rounded-xl border border-slate-100 bg-white p-4">
            <h3 className="text-xs font-bold text-slate-900">{section.title}</h3>
            <ul className="mt-2 space-y-1.5">
              {section.lines.map((line) => (
                <li key={line} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="px-1 text-[10px] text-slate-400">
        Auto-compiled every Monday 7 AM from sales, invoices, checklists, and equipment — with the DeepSeek-written
        executive summary.
      </p>
    </div>
  );
}
