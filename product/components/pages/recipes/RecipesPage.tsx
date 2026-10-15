"use client";

import { useState } from "react";
import { PageHeader } from "../../shared/ui";
import { recipes } from "./data";
import RecipeList from "./recipes/RecipeList";
import RecipeDetail from "./recipes/RecipeDetail";
import IngredientMaster from "./ingredients/IngredientMaster";
import LabelStudio from "./labels/LabelStudio";

type Tab = "recipes" | "ingredients" | "labels";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "recipes", label: "Recipes" },
  { id: "ingredients", label: "Ingredients" },
  { id: "labels", label: "Labels" },
];

export default function RecipesPage({ tab: tabProp, onTabChange }: { tab?: string; onTabChange?: (tab: string) => void }) {
  const [internalTab, setInternalTab] = useState<Tab>("recipes");
  const tab = (tabProp as Tab | undefined) ?? internalTab;
  const setTab = (next: Tab) => {
    setInternalTab(next);
    onTabChange?.(next);
  };
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null;
  const finished = recipes.filter((recipe) => recipe.type === "finished");
  const prep = recipes.filter((recipe) => recipe.type === "prep");

  if (selectedRecipe) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-y-auto app-scrollbar">
        <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipeId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Recipes & Costs"
        action={
          <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
            {tabs.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTab(option.id)}
                className={`px-3.5 py-2 text-xs font-semibold transition-colors ${
                  index > 0 ? "border-l border-slate-200" : ""
                } ${tab === option.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      {tab === "recipes" && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="px-1 pb-3 text-xs font-bold text-slate-800">Finished dishes</div>
            <RecipeList recipes={finished} onSelect={setSelectedRecipeId} />
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="px-1 pb-3 text-xs font-bold text-slate-800">
              Prep recipes & sub-recipes — cost flows into every dish that uses them
            </div>
            <RecipeList recipes={prep} onSelect={setSelectedRecipeId} />
          </div>
        </div>
      )}

      {tab === "ingredients" && <IngredientMaster />}

      {tab === "labels" && <LabelStudio />}
    </div>
  );
}
