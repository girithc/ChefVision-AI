import { costPerServing, ingredients, recipes, type Recipe } from "../recipes/data";

export type Quadrant = "star" | "plow-horse" | "puzzle" | "dog";

export type MixRow = { recipeId: string; unitsSold: number };

/** Units sold over the analysis window (last 30 days). */
export const salesMix: MixRow[] = [
  { recipeId: "r4", unitsSold: 420 }, // Baja Fish Tacos
  { recipeId: "r3", unitsSold: 385 }, // Chipotle Chicken Sandwich
  { recipeId: "r5", unitsSold: 298 }, // Chicken Burrito Bowl
  { recipeId: "r6", unitsSold: 190 }, // Grilled Chicken Salad
  { recipeId: "r7", unitsSold: 120 }, // Cheddar Quesadilla
];

export type DishRow = {
  recipe: Recipe;
  unitsSold: number;
  price: number;
  cost: number;
  contribution: number;
  foodCostPct: number;
  revenue: number;
  quadrant: Quadrant;
};

const quadrantMeta: Record<Quadrant, { label: string; tone: Tone2; advice: string }> = {
  "star": { label: "Star", tone: "emerald", advice: "Keep and feature — protect quality and price carefully." },
  "plow-horse": { label: "Plow Horse", tone: "sky", advice: "Popular but thin — raise price slightly or re-engineer ingredients." },
  "puzzle": { label: "Puzzle", tone: "amber", advice: "Profitable but slow — reposition on the menu or promote." },
  "dog": { label: "Dog", tone: "rose", advice: "Low popularity, low margin — redesign or drop." },
};

type Tone2 = "emerald" | "sky" | "amber" | "rose";
export const quadrantTone = quadrantMeta;

/** Menu engineering classification (Kasavana–Smith): compare vs averages. */
export function buildDishRows(): DishRow[] {
  const rows = salesMix.flatMap((mix) => {
    const recipe = recipes.find((r) => r.id === mix.recipeId);
    if (!recipe?.menuPrice) return [];
    const cost = costPerServing(recipe);
    return [{
      recipe,
      unitsSold: mix.unitsSold,
      price: recipe.menuPrice,
      cost,
      contribution: recipe.menuPrice - cost,
      foodCostPct: (cost / recipe.menuPrice) * 100,
      revenue: recipe.menuPrice * mix.unitsSold,
      quadrant: "star" as Quadrant,
    }];
  });

  const avgPopularity = rows.reduce((sum, row) => sum + row.unitsSold, 0) / rows.length;
  const avgContribution = rows.reduce((sum, row) => sum + row.contribution, 0) / rows.length;

  return rows.map((row) => {
    const popular = row.unitsSold >= avgPopularity;
    const profitable = row.contribution >= avgContribution;
    const quadrant: Quadrant = popular && profitable ? "star" : popular ? "plow-horse" : profitable ? "puzzle" : "dog";
    return { ...row, quadrant };
  });
}

export { quadrantMeta };

/** id → name / cost lookups for the price-impact simulator. */
export const ingredientNameById: Record<string, string> = Object.fromEntries(
  ingredients.map((ingredient) => [ingredient.id, ingredient.name])
);
export const ingredientCostById: Record<string, number> = Object.fromEntries(
  ingredients.map((ingredient) => [ingredient.id, ingredient.costPerUnit])
);
