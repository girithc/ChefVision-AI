"use client";

import { useState } from "react";
import { ArrowLeft, Info, Printer } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import {
  costPerServing,
  effectiveUnitCost,
  ingredients,
  recipeAllergens,
  recipeCost,
  recipes,
  type Recipe,
} from "../data";

const allergenTone: Record<string, Tone> = {
  Gluten: "amber",
  Dairy: "sky",
  Eggs: "amber",
  Fish: "sky",
  Shellfish: "rose",
  Nuts: "rose",
  Soy: "slate",
  Sesame: "slate",
};

type Section = "cost" | "recipe" | "allergens";

const sections: Array<{ id: Section; label: string }> = [
  { id: "cost", label: "Cost" },
  { id: "recipe", label: "Recipe" },
  { id: "allergens", label: "Allergens" },
];

type RecipeDetailProps = {
  recipe: Recipe;
  onBack: () => void;
};

export default function RecipeDetail({ recipe, onBack }: RecipeDetailProps) {
  const [section, setSection] = useState<Section>("cost");
  const total = recipeCost(recipe);
  const perServing = costPerServing(recipe);
  const allergens = recipeAllergens(recipe);
  const lineRows = [
    ...recipe.lines.map((line, index) => {
      const ingredient = ingredients.find((item) => item.id === line.ingredientId)!;
      return {
        key: `line-${index}`,
        name: ingredient.name,
        note: line.prepNote,
        qty: `${line.quantity} ${line.unit}`,
        yieldAdjusted: `${Math.round(ingredient.yieldPct)}% yield`,
        cost: line.quantity * effectiveUnitCost(ingredient),
      };
    }),
    ...recipe.subRecipes.map((sub, index) => {
      const subRecipe = recipes.find((item) => item.id === sub.recipeId)!;
      return {
        key: `sub-${index}`,
        name: `${subRecipe.name} (sub-recipe)`,
        note: subRecipe.portionSize,
        qty: `${sub.quantity} ${sub.unit}`,
        yieldAdjusted: `${subRecipe.portions} portions/batch`,
        cost: sub.quantity * recipeCost(subRecipe),
      };
    }),
  ];

  return (
    <div className="space-y-5">
      <div className="min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{recipe.name}</h1>
            <StatusBadge label={recipe.type === "prep" ? "Prep recipe" : "Menu item"} tone={recipe.type === "prep" ? "indigo" : "emerald"} />
          </div>
          <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
            {sections.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSection(option.id)}
                className={`px-3.5 py-2 text-xs font-semibold transition-colors ${
                  index > 0 ? "border-l border-slate-200" : ""
                } ${section === option.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 pr-1 text-xs text-slate-500">
          <span>{recipe.station} · {recipe.portions} × {recipe.portionSize} per batch</span>
          <button
            type="button"
            aria-label="Ingredient details"
            title="Ingredient details"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {section === "cost" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-xs">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Batch cost</div>
              <div className="mt-1 text-base font-bold text-slate-900">${total.toFixed(2)}</div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-xs">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Cost / serving</div>
              <div className="mt-1 text-base font-bold text-slate-900">${perServing.toFixed(2)}</div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-xs">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Menu price</div>
              <div className="mt-1 text-base font-bold text-slate-900">{recipe.menuPrice ? `$${recipe.menuPrice.toFixed(2)}` : "—"}</div>
            </div>
          </div>

          <section className="rounded-2xl bg-slate-50 p-5">
            <div className="px-1 pb-2 text-xs font-bold text-slate-800">Costed ingredients (yield-adjusted)</div>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
              {lineRows.map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">{row.name}</div>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {row.qty} · {row.yieldAdjusted}{row.note ? ` · ${row.note}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-900">${row.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {section === "recipe" && (
        <section className="rounded-2xl bg-slate-50 p-5">
          <div className="flex items-center justify-between px-1 pb-2">
            <div className="text-xs font-bold text-slate-800">Kitchen recipe card</div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Printer className="h-3.5 w-3.5" />
              Print for tablet
            </button>
          </div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
            {recipe.steps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 px-4 py-3.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-[11px] leading-relaxed text-slate-700">{step}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {section === "allergens" && (
        <section className="rounded-2xl bg-slate-50 p-5">
          <div className="px-1 pb-2 text-xs font-bold text-slate-800">Allergens in this recipe</div>
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-white p-4">
            {allergens.length === 0 && <span className="text-[11px] text-slate-400">No allergens in this recipe.</span>}
            {allergens.map((allergen) => (
              <StatusBadge key={allergen} label={allergen} tone={allergenTone[allergen]} />
            ))}
          </div>
          <p className="px-1 pt-2 text-[10px] text-slate-400">
            Aggregated automatically from every ingredient and sub-recipe — keep in sync with menu disclosures.
          </p>
        </section>
      )}
    </div>
  );
}
