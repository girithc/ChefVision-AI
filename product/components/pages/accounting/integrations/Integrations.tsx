"use client";

import { useState } from "react";
import { Landmark, Link2 } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { integrations as seed, type Integration, type IntegrationKind } from "../data";

const kindLabel: Record<IntegrationKind, string> = {
  pos: "POS",
  payroll: "Labor / payroll",
  accounting: "Accounting",
};

const kindTint: Record<IntegrationKind, string> = {
  pos: "bg-sky-50 text-sky-600",
  payroll: "bg-emerald-50 text-emerald-600",
  accounting: "bg-violet-50 text-violet-600",
};

export default function Integrations() {
  const [items, setItems] = useState<Integration[]>(seed);

  function toggle(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              connected: !item.connected,
              lastSync: !item.connected ? "Just now" : null,
            }
          : item
      )
    );
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="flex items-center gap-2 px-1 pb-3 text-xs font-bold text-slate-800">
        <Landmark className="h-3.5 w-3.5 text-slate-500" />
        Connected systems
      </div>
      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl bg-white sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="flex flex-col border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{item.name}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{item.description}</div>
              </div>
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${kindTint[item.kind]}`}>
                {kindLabel[item.kind]}
              </span>
            </div>
            <div className="mt-auto flex items-center justify-between pt-3">
              <span className="text-[10px] text-slate-400">
                {item.connected ? `Last sync ${item.lastSync}` : "Not connected"}
              </span>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  item.connected
                    ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    : "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                {item.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
