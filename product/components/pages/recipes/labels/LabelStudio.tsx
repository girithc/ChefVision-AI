"use client";

import { useState } from "react";
import { Printer, Tag } from "lucide-react";
import { costPerServing, recipeAllergens, recipes } from "../data";

const prepRecipes = recipes.filter((recipe) => recipe.type === "prep");
const finishedRecipes = recipes.filter((recipe) => recipe.type === "finished");

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function LabelStudio() {
  const [selectedId, setSelectedId] = useState(prepRecipes[0]?.id ?? "");
  const recipe = [...prepRecipes, ...finishedRecipes].find((item) => item.id === selectedId);
  const today = new Date().toISOString().slice(0, 10);

  if (!recipe) return null;
  const allergens = recipeAllergens(recipe);
  const shelfLife = recipe.type === "prep" ? 3 : 2;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Tag className="h-3.5 w-3.5 text-slate-500" />
            Prep & product labels
          </div>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400"
          >
            <optgroup label="Prep recipes">
              {prepRecipes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </optgroup>
            <optgroup label="Finished dishes">
              {finishedRecipes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-xs rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 text-center">
            <div className="font-display text-base font-bold text-slate-900">{recipe.name}</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {recipe.type === "prep" ? "Prep label" : "Product label"}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-left text-[10px]">
              <div className="rounded-lg bg-slate-50 p-2">
                <div className="text-slate-400">Prepped</div>
                <div className="font-bold text-slate-800">{addDays(today, 0)}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <div className="text-slate-400">Use by</div>
                <div className="font-bold text-rose-600">{addDays(today, shelfLife)}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <div className="text-slate-400">Batch</div>
                <div className="font-bold text-slate-800">B-{String(new Date().getDate()).padStart(2, "0")}{recipe.id.replace("r", "")}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <div className="text-slate-400">Yield</div>
                <div className="font-bold text-slate-800">{recipe.portions} × {recipe.portionSize}</div>
              </div>
            </div>

            {allergens.length > 0 && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                <div className="text-[9px] font-bold uppercase tracking-widest text-rose-600">Contains allergens</div>
                <div className="mt-0.5 text-[11px] font-semibold text-rose-800">{allergens.join(" · ")}</div>
              </div>
            )}

            <div className="mt-3 text-[10px] text-slate-400">
              Cost label: ${costPerServing(recipe).toFixed(2)} / {recipe.portionSize}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-5">
            <p className="text-xs leading-relaxed text-slate-600">
              Labels are generated from the recipe: name, prep + use-by dates (auto shelf-life), batch code, yield,
              allergen banner, and portion cost. Print batches for the walk-in, freezer, and pass.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
              >
                <Printer className="h-4 w-4" />
                Print label
              </button>
              <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
                Shelf life rule: prep {shelfLife} days · dishes {shelfLife} days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
