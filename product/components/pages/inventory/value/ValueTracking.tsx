"use client";

import { StatusBadge, type Tone } from "../../../shared/ui";
import { stockItems, valueFlowWeeks } from "../data";

export default function ValueTracking() {
  const latest = valueFlowWeeks[valueFlowWeeks.length - 1];
  const maxClosing = Math.max(...valueFlowWeeks.map((week) => Math.max(week.opening, week.closing)));
  const topMovers = [...stockItems]
    .sort((a, b) => b.quantity * b.unitCost - a.quantity * a.unitCost)
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Opening value (Oct 6)</div>
          <div className="mt-1 text-lg font-bold text-slate-900">${latest.opening.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Closing value (Oct 12)</div>
          <div className="mt-1 text-lg font-bold text-slate-900">${latest.closing.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Purchased this week</div>
          <div className="mt-1 text-lg font-bold text-slate-900">+${latest.purchased.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Used this week</div>
          <div className="mt-1 text-lg font-bold text-slate-900">−${latest.used.toLocaleString()}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">
          Inventory value over time — opening vs closing
        </div>
        <div className="space-y-3 rounded-xl bg-white p-4">
          {valueFlowWeeks.map((week) => (
            <div key={week.label} className="flex items-center gap-3 text-[11px]">
              <span className="w-24 shrink-0 text-slate-500">{week.label}</span>
              <div className="relative h-3 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-slate-300"
                  style={{ width: `${(week.opening / maxClosing) * 100}%` }}
                  title={`Opening $${week.opening.toLocaleString()}`}
                />
                <span
                  className="absolute inset-y-0 rounded-full bg-slate-900"
                  style={{ left: `${Math.min(week.opening, week.closing) / maxClosing * 100}%`, width: `${(Math.abs(week.closing - week.opening) / maxClosing) * 100}%` }}
                  title={`Closing $${week.closing.toLocaleString()}`}
                />
              </div>
              <span className="ml-auto shrink-0">
                <StatusBadge
                  label={`${week.closing - week.opening >= 0 ? "+" : "−"}$${Math.abs(week.closing - week.opening).toLocaleString()} vs open`}
                  tone={(week.closing - week.opening >= 0 ? "emerald" : "amber") as Tone}
                />
              </span>
            </div>
          ))}
          <p className="pt-1 text-[10px] text-slate-400">
            Grey = opening value · black segment = change to closing · badge = weekly change.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">
          Stock flow — purchased, used, remaining (top items by value)
        </div>
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 pt-4 pb-3 font-medium">Item</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Purchased (30d)</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Used (30d)</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Remaining</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Remaining value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topMovers.map((item) => {
                const purchased = Math.round(item.parLevel * 1.4);
                const used = Math.max(purchased - item.quantity, 0);
                return (
                  <tr key={item.id}>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{purchased} {item.unit}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{used} {item.unit}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900">{item.quantity} {item.unit}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                      ${(item.quantity * item.unitCost).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
