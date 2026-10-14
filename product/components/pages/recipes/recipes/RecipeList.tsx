"use client";

import { ChevronRight } from "lucide-react";
import { StatusBadge } from "../../../shared/ui";
import { costPerServing, recipeAllergens, type Recipe } from "../data";

type RecipeListProps = {
  recipes: Recipe[];
  onSelect: (id: string) => void;
};

export default function RecipeList({ recipes, onSelect }: RecipeListProps) {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl bg-white sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => {
        const cost = costPerServing(recipe);
        const allergens = recipeAllergens(recipe);
        return (
          <button
            key={recipe.id}
            type="button"
            onClick={() => onSelect(recipe.id)}
            className="flex flex-col border border-slate-100 p-4 text-left transition-colors hover:bg-slate-50/60"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-bold text-slate-900">{recipe.name}</h3>
              {recipe.type === "prep" && (
                <StatusBadge label="Prep recipe" tone="indigo" />
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {recipe.category} · {recipe.station} · {recipe.portionSize}
            </p>
            <div className="flex flex-1 items-center py-2">
              <div className="flex w-full items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">Cost / serving</div>
                  <div className="text-sm font-bold text-slate-900">${cost.toFixed(2)}</div>
                </div>
                {recipe.menuPrice ? (
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Food cost</div>
                    <div className={`text-sm font-bold ${cost / recipe.menuPrice > 0.35 ? "text-rose-600" : cost / recipe.menuPrice > 0.32 ? "text-amber-600" : "text-emerald-600"}`}>
                      {Math.round((cost / recipe.menuPrice) * 100)}%
                    </div>
                  </div>
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                )}
              </div>
            </div>
            <div className="flex min-h-[26px] flex-wrap items-center gap-1 pt-1">
              {allergens.map((allergen) => (
                <span key={allergen} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                  {allergen}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
