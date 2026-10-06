import { useState } from "react";
import { ChefHat, Pencil, Plus, Search, Trash2, X } from "lucide-react";

import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { newId, useApp } from "@/lib/app-context";
import type { Recipe } from "@/lib/types";
import { COMMON_UNITS, fmtQty } from "@/lib/units";

function blankRecipe(): Recipe {
  return { id: newId("r"), name: "", category: "Entree", ingredients: [{ name: "", qtyPerServing: 0, unit: "g" }] };
}

/** Screen 6: recipes with ingredient quantity and unit per serving. */
export function Recipes() {
  const { recipes, events, inventory, saveRecipe, deleteRecipe } = useApp();
  const [draft, setDraft] = useState<Recipe | null>(null);
  const [query, setQuery] = useState("");

  const filtered = recipes.filter((recipe) => recipe.name.toLowerCase().includes(query.trim().toLowerCase()));
  // Suggest canonical names so recipe ingredients join with the inventory ledger.
  const ingredientSuggestions = [
    ...new Set([
      ...inventory.map((item) => item.canonicalName),
      ...recipes.flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.name)),
    ]),
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        title="Recipes"
        subtitle="Ingredients are listed per serving and scaled by each event's serving count."
        actions={<Button icon={Plus} onClick={() => setDraft(blankRecipe())}>New recipe</Button>}
      />

      <datalist id="ingredient-options">
        {ingredientSuggestions.map((name) => <option key={name} value={name} />)}
      </datalist>

      {draft && (
        <RecipeForm
          recipe={draft}
          onCancel={() => setDraft(null)}
          onSave={(recipe) => {
            saveRecipe(recipe);
            setDraft(null);
          }}
        />
      )}

      {recipes.length > 0 && (
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search recipes…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      )}

      {recipes.length === 0 ? (
        <Card>
          <EmptyState
            icon={ChefHat}
            title="No recipes yet"
            description="Add recipes with per-serving ingredient quantities to plan events."
            action={<Button icon={Plus} onClick={() => setDraft(blankRecipe())}>New recipe</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => {
            const usedBy = events.filter((event) => event.recipes.some((selection) => selection.recipeId === recipe.id)).length;
            return (
              <Card key={recipe.id} className="flex flex-col p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{recipe.name}</h3>
                    <div className="mt-1 flex gap-1">
                      <Badge tone="sky">{recipe.category}</Badge>
                      {usedBy > 0 && <Badge tone="green">{usedBy} event{usedBy > 1 ? "s" : ""}</Badge>}
                    </div>
                  </div>
                  <div className="flex">
                    <Button variant="ghost" icon={Pencil} aria-label="Edit recipe" onClick={() => setDraft(recipe)} />
                    <Button
                      variant="danger"
                      icon={Trash2}
                      aria-label="Delete recipe"
                      onClick={() =>
                        confirm(
                          usedBy
                            ? `“${recipe.name}” is used by ${usedBy} event(s). Delete anyway?`
                            : `Delete “${recipe.name}”?`,
                        ) && deleteRecipe(recipe.id)
                      }
                    />
                  </div>
                </div>
                <div className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Per serving</div>
                <ul className="mt-1 space-y-1 text-sm">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex justify-between gap-2">
                      <span className="text-slate-600">{ingredient.name}</span>
                      <span className="font-medium tabular-nums">{fmtQty(ingredient.qtyPerServing, 3)} {ingredient.unit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function RecipeForm({ recipe: initial, onSave, onCancel }: { recipe: Recipe; onSave(recipe: Recipe): void; onCancel(): void }) {
  const [recipe, setRecipe] = useState(initial);
  const valid = recipe.name.trim() && recipe.ingredients.some((ingredient) => ingredient.name.trim() && ingredient.qtyPerServing > 0);

  const setIngredient = (index: number, patch: Partial<Recipe["ingredients"][number]>) => {
    const ingredients = [...recipe.ingredients];
    ingredients[index] = { ...ingredients[index], ...patch };
    setRecipe({ ...recipe, ingredients });
  };

  return (
    <Card className="mb-6 border-brand-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">{initial.name ? "Edit recipe" : "New recipe"}</h2>
        <Button variant="ghost" icon={X} aria-label="Close" onClick={onCancel} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Recipe name</label>
          <input className="input" value={recipe.name} onChange={(e) => setRecipe({ ...recipe, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={recipe.category} onChange={(e) => setRecipe({ ...recipe, category: e.target.value })}>
            {["Appetizer", "Entree", "Side", "Dessert", "Beverage"].map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="label mt-5">Ingredients (per serving)</label>
      <div className="space-y-2">
        {recipe.ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              className="input flex-1"
              list="ingredient-options"
              placeholder="Ingredient (use catalog name)"
              value={ingredient.name}
              onChange={(e) => setIngredient(index, { name: e.target.value })}
            />
            <input
              type="number"
              min={0}
              step="any"
              className="input w-24"
              value={ingredient.qtyPerServing}
              onChange={(e) => setIngredient(index, { qtyPerServing: Number(e.target.value) })}
            />
            <select className="input w-24" value={ingredient.unit} onChange={(e) => setIngredient(index, { unit: e.target.value })}>
              {COMMON_UNITS.map((unit) => <option key={unit}>{unit}</option>)}
            </select>
            <Button
              variant="danger"
              icon={Trash2}
              aria-label="Remove ingredient"
              onClick={() => setRecipe({ ...recipe, ingredients: recipe.ingredients.filter((_, i) => i !== index) })}
            />
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        icon={Plus}
        className="mt-2"
        onClick={() => setRecipe({ ...recipe, ingredients: [...recipe.ingredients, { name: "", qtyPerServing: 0, unit: "g" }] })}
      >
        Add ingredient
      </Button>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={!valid}
          onClick={() =>
            onSave({ ...recipe, ingredients: recipe.ingredients.filter((ingredient) => ingredient.name.trim()) })
          }
        >
          Save recipe
        </Button>
      </div>
    </Card>
  );
}
