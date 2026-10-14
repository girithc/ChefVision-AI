"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { StatusBadge } from "../../shared/ui";
import { workflowTraces } from "./traces/traceData";
import TraceView from "./traces/TraceView";
import UptimeBoard from "./uptime/UptimeBoard";

type Workflow = {
  id: string;
  name: string;
  detail: string;
  status: string;
};

type PageView = "traces" | "uptime";

const initialWorkflows: Workflow[] = [
  { id: "invoice-intake", name: "Invoice intake", detail: "Photo → OCR → normalize → inventory ledger", status: "Active" },
  { id: "recipe-recost", name: "Recipe re-costing", detail: "Invoice published → ingredient costs → dish costs", status: "Active" },
  { id: "sensor-watchtower", name: "Sensor watchtower", detail: "Sensor reading → anomaly → work order", status: "Active" },
  { id: "daily-report", name: "Daily P&L report", detail: "POS + invoices → controllable P&L + summary", status: "Active" },
  { id: "assistant-rag", name: "AI assistant (RAG)", detail: "Question → retrieve context → DeepSeek answer", status: "Active" },
];

function AgentList({ workflows }: { workflows: Workflow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="overflow-hidden rounded-xl bg-white">
        <table className="w-full text-left text-[11.5px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="px-5 pt-4 pb-3 font-medium">Process</th>
              <th className="px-5 pt-4 pb-3 font-medium">Status</th>
              <th className="w-10 px-5 pt-4 pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {workflows.map((workflow) => {
              const expanded = expandedId === workflow.id;
              const traceSteps = workflowTraces[workflow.id];
              return (
                <Fragment key={workflow.id}>
                  <tr
                    onClick={() => setExpandedId((current) => (current === workflow.id ? null : workflow.id))}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-slate-900">{workflow.name}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{workflow.detail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        label={workflow.status}
                        tone={workflow.status === "Active" ? "emerald" : "sky"}
                      />
                    </td>
                    <td className="px-5 py-4 text-right text-slate-300">
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </td>
                  </tr>
                  {expanded && traceSteps && (
                    <tr>
                      <td colSpan={3} className="bg-slate-50/70 p-4">
                        <TraceView steps={traceSteps} name={workflow.name} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [view, setView] = useState<PageView>("traces");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <button
          type="button"
          onClick={() => setView("traces")}
          className={`font-display text-xl font-bold tracking-tight transition-colors sm:text-2xl ${
            view === "traces" ? "text-slate-900" : "text-slate-300 hover:text-slate-500"
          }`}
        >
          Traces
        </button>
        <span className="text-slate-300">&amp;</span>
        <button
          type="button"
          onClick={() => setView("uptime")}
          className={`font-display text-xl font-bold tracking-tight transition-colors sm:text-2xl ${
            view === "uptime" ? "text-slate-900" : "text-slate-300 hover:text-slate-500"
          }`}
        >
          Uptime
        </button>
      </div>

      {view === "traces" && <AgentList workflows={initialWorkflows} />}
      {view === "uptime" && <UptimeBoard />}
    </div>
  );
}
