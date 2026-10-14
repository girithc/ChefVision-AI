"use client";

import { useState } from "react";
import { ClipboardList, TriangleAlert } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { countSessions, type CountSession } from "../data";

const statusTone: Record<CountSession["status"], Tone> = {
  Open: "amber",
  Completed: "emerald",
};

type CountSheetsProps = {
  onCountChange: (counted: Record<string, number>) => void;
};

export default function CountSheets({ onCountChange }: CountSheetsProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  const openSession = countSessions.find((session) => session.status === "Open")!;
  const history = countSessions.filter((session) => session.status === "Completed");

  function setCount(itemId: string, value: string) {
    const parsed = value === "" ? NaN : Number(value);
    const next = { ...counts, [itemId]: parsed };
    setCounts(next);
    setSaved(false);
    onCountChange(next);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ClipboardList className="h-3.5 w-3.5 text-slate-500" />
            Digital count sheet — {openSession.location} ({openSession.id})
          </div>
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            {saved ? "Count saved ✓" : "Save count"}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 pt-4 pb-3 font-medium">Item</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Expected</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Counted</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Variance</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {openSession.items.map((item) => {
                const counted = counts[item.id];
                const hasCount = counted !== undefined && !Number.isNaN(counted);
                const diff = hasCount ? counted - item.expected : 0;
                const significant = hasCount && Math.abs(diff) / item.expected > 0.1;
                return (
                  <tr key={item.id}>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">
                      {item.expected} {item.unit}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="—"
                        value={Number.isNaN(counted) ? "" : counted ?? ""}
                        onChange={(event) => setCount(item.id, event.target.value)}
                        className="w-20 rounded-lg border border-slate-200 px-2.5 py-1.5 text-right text-xs text-slate-800 outline-none focus:border-slate-400"
                      />
                    </td>
                    <td className={`px-5 py-3.5 text-right font-semibold ${hasCount ? (diff >= 0 ? "text-emerald-600" : "text-rose-600") : "text-slate-300"}`}>
                      {hasCount ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)} ${item.unit}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {significant && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-rose-600">
                          <TriangleAlert className="h-3 w-3" />
                          {diff < 0 ? "Possible waste" : "Overage"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">Count history</div>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
          {history.map((session) => (
            <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  {session.location} — {session.id}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {session.date} · {session.items.length} items counted
                </p>
              </div>
              <div className="flex items-center gap-2">
                {session.varianceCost !== undefined && session.varianceCost < 0 && (
                  <span className="text-[11px] font-semibold text-rose-600">
                    {session.varianceCost < 0 ? `${session.varianceCost.toFixed(2).replace("-", "-$")}` : ""} shrink
                  </span>
                )}
                <StatusBadge label={session.status} tone={statusTone[session.status]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
