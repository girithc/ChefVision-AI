"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { StatusBadge } from "../../shared/ui";
import { workflowTraces } from "./traces/traceData";
import TraceView from "./traces/TraceView";

type Workflow = {
  id: string;
  name: string;
  detail: string;
  status: string;
};

const initialWorkflows: Workflow[] = [
  { id: "invoice-intake", name: "Invoice intake agent", detail: "Reads invoices and extracts line items", status: "Active" },
  { id: "inventory-sync", name: "Inventory sync agent", detail: "Keeps stock levels aligned across systems", status: "Active" },
  { id: "purchase-order", name: "Purchase order agent", detail: "Drafts reorder requests from inventory gaps", status: "Draft" },
];

function AgentList({ workflows }: { workflows: Workflow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="overflow-hidden rounded-xl bg-white">
        <table className="w-full text-left text-[11.5px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="px-5 pt-4 pb-3 font-medium">Agent</th>
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
  const workflows = initialWorkflows;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Traces</h1>
      </div>
      <div className="mt-5 min-h-0 flex-1">
        <AgentList workflows={workflows} />
      </div>
    </div>
  );
}
