"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { StatusBadge } from "../../../shared/ui";
import { buildDishRows, ingredientCostById, ingredientNameById, quadrantMeta, type Quadrant } from "../data";

const quadrantClasses: Record<Quadrant, string> = {
  star: "border-emerald-200 bg-emerald-50/70",
  "plow-horse": "border-sky-200 bg-sky-50/70",
  puzzle: "border-amber-200 bg-amber-50/70",
  dog: "border-rose-200 bg-rose-50/70",
};

export default function MenuMatrix() {
  const dishRows = useMemo(() => buildDishRows(), []);
  const [simIngredient, setSimIngredient] = useState("Chicken Breast");
  const [simPct, setSimPct] = useState(10);

  // ingredient price-change impact on each dish
  const ingredientNames = [
    ...new Set(dishRows.flatMap((row) => row.recipe.lines.map((line) => ingredientNameById[line.ingredientId]))),
  ].filter(Boolean).sort();
  const impacted = dishRows.map((row) => {
    const delta = row.recipe.lines.reduce((sum, line) => {
      const matches = ingredientNameById[line.ingredientId] === simIngredient;
      return matches ? sum + line.quantity * (ingredientCostById[line.ingredientId] ?? 0) * (simPct / 100) : sum;
    }, 0);
    return { row, delta, newCost: row.cost + delta, newPct: ((row.cost + delta) / row.price) * 100 };
  });

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">
          Menu engineering matrix — popularity (units sold) vs contribution margin
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["star", "plow-horse", "puzzle", "dog"] as Quadrant[]).map((quadrant) => {
            const dishes = dishRows.filter((row) => row.quadrant === quadrant);
            const meta = quadrantMeta[quadrant];
            return (
              <section key={quadrant} className={`rounded-2xl border p-4 ${quadrantClasses[quadrant]}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{meta.label}s</h3>
                  <span className="text-[10px] text-slate-500">{dishes.length} dish{dishes.length === 1 ? "" : "es"}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-500">{meta.advice}</p>
                <ul className="mt-2.5 space-y-1">
                  {dishes.map((dish) => (
                    <li key={dish.recipe.id} className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 text-[11px]">
                      <span className="truncate font-semibold text-slate-900">{dish.recipe.name}</span>
                      <span className="shrink-0 text-slate-500">
                        {dish.unitsSold} sold · +${dish.contribution.toFixed(2)}
                      </span>
                    </li>
                  ))}
                  {dishes.length === 0 && <li className="px-3 py-2 text-[11px] text-slate-400">None this period.</li>}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">Sales mix — dish-level contribution</div>
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 pt-4 pb-3 font-medium">Dish</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Sold (30d)</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Price</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Food cost</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Contribution</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Food cost %</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {dishRows.map((row) => (
                <tr key={row.recipe.id}>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{row.recipe.name}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{row.unitsSold}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">${row.price.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">${row.cost.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">+${row.contribution.toFixed(2)}</td>
                  <td className={`px-5 py-3.5 text-right ${row.foodCostPct > 32 ? "text-rose-600" : row.foodCostPct > 28 ? "text-amber-600" : "text-emerald-600"}`}>
                    {row.foodCostPct.toFixed(1)}%
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <StatusBadge label={quadrantMeta[row.quadrant].label} tone={quadrantMeta[row.quadrant].tone} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">
          Ingredient price impact — what happens to margins when a price moves?
        </div>
        <div className="rounded-xl bg-white p-5">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={simIngredient}
              onChange={(event) => setSimIngredient(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            >
              {ingredientNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <input
              type="range"
              min={-20}
              max={20}
              value={simPct}
              onChange={(event) => setSimPct(Number(event.target.value))}
              className="w-56 accent-slate-900"
            />
            <span className={`text-sm font-bold ${simPct > 0 ? "text-rose-600" : simPct < 0 ? "text-emerald-600" : "text-slate-600"}`}>
              {simPct > 0 ? "+" : ""}{simPct}%
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {impacted.map(({ row, delta, newCost, newPct }) => {
              const affected = Math.abs(delta) > 0.001;
              return (
                <div key={row.recipe.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px]">
                  <span className="font-semibold text-slate-900">{row.recipe.name}</span>
                  <span className="text-slate-500">
                    cost ${row.cost.toFixed(2)} → <strong className="text-slate-900">${newCost.toFixed(2)}</strong>
                  </span>
                  <span className={`inline-flex items-center gap-1 font-semibold ${delta > 0 ? "text-rose-600" : delta < 0 ? "text-emerald-600" : "text-slate-400"}`}>
                    {delta > 0.001 ? <ArrowUpRight className="h-3.5 w-3.5" /> : delta < -0.001 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                    food cost {newPct.toFixed(1)}% ({delta >= 0 ? "+" : ""}${delta.toFixed(2)}/serving)
                  </span>
                  {affected && newPct > 32 && (
                    <StatusBadge label="Price review" tone="rose" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
