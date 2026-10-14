"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { ingredients, type Allergen } from "../data";

const allergenTone: Record<Allergen, Tone> = {
  Gluten: "amber",
  Dairy: "sky",
  Eggs: "amber",
  Fish: "sky",
  Shellfish: "rose",
  Nuts: "rose",
  Soy: "slate",
  Sesame: "slate",
};

export default function IngredientMaster() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
        <TrendingUp className="h-4 w-4 shrink-0 text-sky-600" />
        <span className="text-xs text-sky-900">
          <strong className="font-semibold">AI-assisted matching:</strong> 4 invoice items were matched to this catalog this
          week (e.g. "snapper fillet 8lb" → Red Snapper Fillet, 91%) — ingredient costs below update automatically from
          published invoices.
        </span>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 pb-3 text-xs font-bold text-slate-800">
          Ingredient master database — {ingredients.length} items
        </div>
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 pt-4 pb-3 font-medium">Ingredient</th>
                <th className="px-5 pt-4 pb-3 font-medium">Category</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Cost / unit</th>
                <th className="px-5 pt-4 pb-3 font-medium">Yield</th>
                <th className="px-5 pt-4 pb-3 font-medium text-right">Price trend</th>
                <th className="px-5 pt-4 pb-3 font-medium">Allergens</th>
                <th className="px-5 pt-4 pb-3 font-medium">Cost updated from</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{ingredient.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{ingredient.category}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                    ${ingredient.costPerUnit.toFixed(2)}/{ingredient.unit}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{ingredient.yieldPct}%</td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        ingredient.trendPct > 0 ? "text-rose-600" : ingredient.trendPct < 0 ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {ingredient.trendPct > 0 && <TrendingUp className="h-3 w-3" />}
                      {ingredient.trendPct < 0 && <TrendingDown className="h-3 w-3" />}
                      {ingredient.trendPct === 0 ? "—" : `${ingredient.trendPct > 0 ? "+" : ""}${ingredient.trendPct}%`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {ingredient.allergens.length === 0 && <span className="text-slate-300">—</span>}
                      {ingredient.allergens.map((allergen) => (
                        <StatusBadge key={allergen} label={allergen} tone={allergenTone[allergen]} />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[10px] text-slate-400">{ingredient.costUpdatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
