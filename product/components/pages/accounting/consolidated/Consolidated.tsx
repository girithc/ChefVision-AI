"use client";

import { useState } from "react";
import { Building2, Sparkles } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { locationRollups } from "../data";

const sampleQuestions = [
  "Why did food cost rise this week?",
  "Which location has the best margin?",
  "How are we tracking vs labor budget?",
];

export default function Consolidated() {
  const [answer, setAnswer] = useState<string | null>(null);

  const totalSales = locationRollups.reduce((sum, row) => sum + row.sales, 0);
  const totalProfit = locationRollups.reduce((sum, row) => sum + row.profit, 0);
  const blendedFood = locationRollups.reduce((sum, row) => sum + row.foodPct * row.sales, 0) / totalSales;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex items-center gap-2 px-1 pb-3 text-xs font-bold text-slate-800">
          <Building2 className="h-3.5 w-3.5 text-slate-500" />
          Consolidated — all restaurants, this month
        </div>
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 pt-4 pb-3 font-medium">Location</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Sales</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Food cost %</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Labor %</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Controllable profit</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {locationRollups.map((row) => {
                const prime = row.foodPct + row.laborPct;
                return (
                  <tr key={row.name}>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{row.name}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900">${row.sales.toLocaleString()}</td>
                    <td className={`px-5 py-3.5 text-right ${row.foodPct <= 32 ? "text-emerald-600" : "text-rose-600"}`}>{row.foodPct}%</td>
                    <td className="px-5 py-3.5 text-right">{row.laborPct}%</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900">${row.profit.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <StatusBadge
                        label={prime <= 60 ? "Healthy" : prime <= 65 ? "Watch" : "Action needed"}
                        tone={(prime <= 60 ? "emerald" : prime <= 65 ? "amber" : "rose") as Tone}
                      />
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50/80">
                <td className="px-5 py-3 text-xs font-bold text-slate-800">All locations</td>
                <td className="px-5 py-3 text-right text-xs font-bold text-slate-800">${totalSales.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-xs font-bold text-slate-800">{blendedFood.toFixed(1)}%</td>
                <td className="px-5 py-3" />
                <td className="px-5 py-3 text-right text-xs font-bold text-slate-800">${totalProfit.toLocaleString()}</td>
                <td className="px-5 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />
          <span className="text-xs font-semibold text-violet-900">Ask the AI assistant about costs & performance</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {sampleQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() =>
                setAnswer(
                  question.startsWith("Why")
                    ? "Food cost rose 0.6pp this week: chicken breast +8% (Premium Meats Co.) and romaine +9.6% are the drivers. Actual usage also ran 2.2% over theoretical — mostly over-portioning on the fish tacos."
                    : question.startsWith("Which")
                      ? "Riverside leads this month: 30.2% food cost, 27.4% labor — a 42.4% controllable margin. Downtown is close; Airport is dragging (34.8% food cost, licensed menu pricing)."
                      : "You're at 100.0% of the labor budget ($25,210 of $25,200). Weekday shifts are on track — Friday/Saturday overtime is where the overage risk sits."
                )
              }
              className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-violet-700 transition-colors hover:bg-violet-100"
            >
              {question}
            </button>
          ))}
        </div>
        {answer && (
          <div className="mt-2.5 rounded-xl bg-white/90 px-4 py-3 text-xs leading-relaxed text-violet-950">{answer}</div>
        )}
      </div>
    </div>
  );
}
