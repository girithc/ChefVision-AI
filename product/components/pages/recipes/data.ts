export type Allergen = "Gluten" | "Dairy" | "Eggs" | "Fish" | "Shellfish" | "Nuts" | "Soy" | "Sesame";

export type Ingredient = {
  id: string;
  name: string;
  category: string;
  costPerUnit: number;
  unit: string;
  /** Usable yield after trimming/prep, as a percentage. */
  yieldPct: number;
  /** Where the current cost came from — invoice-driven updates. */
  costUpdatedAt: string;
  trendPct: number;
  allergens: Allergen[];
};

export type RecipeLine = { ingredientId: string; quantity: number; unit: string; prepNote?: string };

export type SubRecipeLine = { recipeId: string; quantity: number; unit: string };

export type Recipe = {
  id: string;
  name: string;
  /** finished-dish vs prep (sub-recipe) */
  type: "finished" | "prep";
  category: string;
  station: string;
  /** batch yield */
  portions: number;
  portionSize: string;
  menuPrice: number | null;
  /** per-portion menu price reference for prep batches */
  photoGradient: string;
  hasVideo: boolean;
  steps: string[];
  lines: RecipeLine[];
  subRecipes: SubRecipeLine[];
};

export const ingredients: Ingredient[] = [
  { id: "i1", name: "Chicken Breast", category: "Protein", costPerUnit: 6.2, unit: "lb", yieldPct: 88, costUpdatedAt: "Oct 10 · INV-8841", trendPct: 8, allergens: [] },
  { id: "i2", name: "Brioche Bun", category: "Bakery", costPerUnit: 0.78, unit: "ea", yieldPct: 100, costUpdatedAt: "Oct 7 · INV-8835", trendPct: 4, allergens: ["Gluten"] },
  { id: "i3", name: "Cheddar Cheese", category: "Dairy", costPerUnit: 4.4, unit: "lb", yieldPct: 100, costUpdatedAt: "Oct 7 · INV-8835", trendPct: 3, allergens: ["Dairy"] },
  { id: "i4", name: "Romaine Lettuce", category: "Produce", costPerUnit: 2.85, unit: "lb", yieldPct: 75, costUpdatedAt: "Oct 9 · INV-8838", trendPct: 9, allergens: [] },
  { id: "i5", name: "Roma Tomato", category: "Produce", costPerUnit: 3.68, unit: "lb", yieldPct: 90, costUpdatedAt: "Oct 9 · INV-8838", trendPct: -4, allergens: [] },
  { id: "i6", name: "Red Snapper Fillet", category: "Seafood", costPerUnit: 13.0, unit: "lb", yieldPct: 92, costUpdatedAt: "Oct 10 · INV-8841", trendPct: 5, allergens: ["Fish"] },
  { id: "i7", name: "Extra Virgin Olive Oil", category: "Pantry", costPerUnit: 18.3, unit: "L", yieldPct: 100, costUpdatedAt: "Oct 7 · INV-8835", trendPct: 6, allergens: [] },
  { id: "i8", name: "Garlic", category: "Produce", costPerUnit: 3.3, unit: "lb", yieldPct: 88, costUpdatedAt: "Oct 9 · INV-8838", trendPct: 3, allergens: [] },
  { id: "i9", name: "Lime", category: "Produce", costPerUnit: 0.35, unit: "ea", yieldPct: 80, costUpdatedAt: "Oct 9 · INV-8838", trendPct: 0, allergens: [] },
  { id: "i10", name: "Cilantro", category: "Produce", costPerUnit: 1.2, unit: "bunch", yieldPct: 70, costUpdatedAt: "Oct 9 · INV-8838", trendPct: 0, allergens: [] },
  { id: "i11", name: "Flour Tortilla 12\"", category: "Bakery", costPerUnit: 0.45, unit: "ea", yieldPct: 100, costUpdatedAt: "Oct 7 · INV-8835", trendPct: 2, allergens: ["Gluten"] },
  { id: "i12", name: "Bacon", category: "Protein", costPerUnit: 5.9, unit: "lb", yieldPct: 70, costUpdatedAt: "Oct 10 · INV-8841", trendPct: 5, allergens: [] },
  { id: "i13", name: "Heavy Cream", category: "Dairy", costPerUnit: 3.95, unit: "qt", yieldPct: 100, costUpdatedAt: "Oct 7 · INV-8835", trendPct: 2, allergens: ["Dairy"] },
  { id: "i14", name: "Butter", category: "Dairy", costPerUnit: 4.15, unit: "lb", yieldPct: 100, costUpdatedAt: "Oct 7 · INV-8835", trendPct: 1, allergens: ["Dairy"] },
  { id: "i15", name: "Mayonnaise", category: "Pantry", costPerUnit: 0.15, unit: "oz", yieldPct: 100, costUpdatedAt: "Oct 7 · INV-8835", trendPct: 0, allergens: ["Eggs"] },
  { id: "i16", name: "White Onion", category: "Produce", costPerUnit: 0.85, unit: "lb", yieldPct: 88, costUpdatedAt: "Oct 9 · INV-8838", trendPct: 0, allergens: [] },
  { id: "i17", name: "Jalapeño", category: "Produce", costPerUnit: 2.4, unit: "lb", yieldPct: 85, costUpdatedAt: "Oct 9 · INV-8838", trendPct: 0, allergens: [] },
  { id: "i18", name: "Cabbage", category: "Produce", costPerUnit: 0.9, unit: "lb", yieldPct: 78, costUpdatedAt: "Oct 9 · INV-8838", trendPct: 0, allergens: [] },
  { id: "i19", name: "Long-Grain Rice", category: "Dry goods", costPerUnit: 0.9, unit: "lb", yieldPct: 100, costUpdatedAt: "Oct 7 · INV-8835", trendPct: 0, allergens: [] },
  { id: "i20", name: "Chipotle in Adobo", category: "Pantry", costPerUnit: 2.6, unit: "can", yieldPct: 100, costUpdatedAt: "Oct 7 · INV-8835", trendPct: 0, allergens: [] },
  { id: "i21", name: "Corn Kernels", category: "Dry goods", costPerUnit: 1.1, unit: "lb", yieldPct: 100, costUpdatedAt: "Oct 7 · INV-8835", trendPct: 0, allergens: [] },
];

export const recipes: Recipe[] = [
  {
    id: "r1",
    name: "Chipotle Mayo",
    type: "prep",
    category: "Sub-recipe",
    station: "Prep",
    portions: 40,
    portionSize: "1 oz",
    menuPrice: null,
    photoGradient: "from-amber-100 to-orange-100",
    hasVideo: false,
    steps: [
      "Combine mayonnaise, minced chipotle, and lime juice in a bowl.",
      "Whisk until smooth; season with salt.",
      "Label with prep date — use within 5 days.",
    ],
    lines: [
      { ingredientId: "i15", quantity: 32, unit: "oz" },
      { ingredientId: "i20", quantity: 1, unit: "can", prepNote: "minced" },
      { ingredientId: "i9", quantity: 0.05, unit: "lb", prepNote: "grated" },
    ],
    subRecipes: [],
  },
  {
    id: "r2",
    name: "Pico de Gallo",
    type: "prep",
    category: "Sub-recipe",
    station: "Prep",
    portions: 16,
    portionSize: "2 oz",
    menuPrice: null,
    photoGradient: "from-emerald-100 to-lime-100",
    hasVideo: false,
    steps: [
      "Dice tomatoes, onion, and jalapeño; chop cilantro.",
      "Toss with lime juice and salt; rest 15 minutes.",
      "Label — use within 3 days.",
    ],
    lines: [
      { ingredientId: "i5", quantity: 2, unit: "lb", prepNote: "deseeded, diced" },
      { ingredientId: "i16", quantity: 0.5, unit: "lb", prepNote: "diced" },
      { ingredientId: "i17", quantity: 0.15, unit: "lb", prepNote: "fine dice" },
      { ingredientId: "i10", quantity: 1, unit: "bunch", prepNote: "chopped" },
      { ingredientId: "i9", quantity: 0.05, unit: "lb" },
    ],
    subRecipes: [],
  },
  {
    id: "r3",
    name: "Chipotle Chicken Sandwich",
    type: "finished",
    category: "Main",
    station: "Hot line",
    portions: 1,
    portionSize: "1 sandwich",
    menuPrice: 14.0,
    photoGradient: "from-orange-100 to-rose-100",
    hasVideo: true,
    steps: [
      "Season chicken; grill 6–7 min per side to 165°F internal.",
      "Toast brioche cut-side down in butter.",
      "Build: chipotle mayo base, chicken, cheddar, shredded lettuce.",
      "Serve with pickles; check plate against photo standard.",
    ],
    lines: [
      { ingredientId: "i1", quantity: 0.375, unit: "lb", prepNote: "6 oz portion" },
      { ingredientId: "i2", quantity: 1, unit: "ea" },
      { ingredientId: "i3", quantity: 0.0625, unit: "lb", prepNote: "1 oz slice" },
      { ingredientId: "i4", quantity: 0.03, unit: "lb", prepNote: "shredded" },
      { ingredientId: "i14", quantity: 0.01, unit: "lb", prepNote: "for toasting" },
    ],
    subRecipes: [{ recipeId: "r1", quantity: 1, unit: "oz" }],
  },
  {
    id: "r4",
    name: "Baja Fish Tacos (2)",
    type: "finished",
    category: "Main",
    station: "Hot line",
    portions: 1,
    portionSize: "2 tacos",
    menuPrice: 16.5,
    photoGradient: "from-sky-100 to-cyan-100",
    hasVideo: true,
    steps: [
      "Season snapper; grill 3–4 min per side.",
      "Warm tortillas; flake fish over double tortilla.",
      "Top with pico, cabbage slaw, chipotle crema drizzle.",
      "Lime wedge; check 165°F log entry.",
    ],
    lines: [
      { ingredientId: "i6", quantity: 0.3125, unit: "lb", prepNote: "5 oz portion" },
      { ingredientId: "i11", quantity: 2, unit: "ea" },
      { ingredientId: "i18", quantity: 0.1, unit: "lb", prepNote: "shredded" },
      { ingredientId: "i10", quantity: 0.25, unit: "bunch" },
    ],
    subRecipes: [{ recipeId: "r2", quantity: 2, unit: "oz" }],
  },
  {
    id: "r5",
    name: "Chicken Burrito Bowl",
    type: "finished",
    category: "Main",
    station: "Hot line",
    portions: 1,
    portionSize: "1 bowl",
    menuPrice: 15.5,
    photoGradient: "from-teal-100 to-emerald-100",
    hasVideo: false,
    steps: [
      "Sauté chicken with garlic and oil; hold at 165°F.",
      "Steam rice; season with lime and cilantro.",
      "Build bowl: rice, chicken, pico, corn, chipotle drizzle.",
    ],
    lines: [
      { ingredientId: "i1", quantity: 0.5, unit: "lb", prepNote: "8 oz portion" },
      { ingredientId: "i19", quantity: 0.25, unit: "lb" },
      { ingredientId: "i21", quantity: 0.1, unit: "lb" },
      { ingredientId: "i7", quantity: 0.01, unit: "L", prepNote: "sauté" },
      { ingredientId: "i8", quantity: 0.02, unit: "lb" },
    ],
    subRecipes: [{ recipeId: "r2", quantity: 3, unit: "oz" }],
  },
  {
    id: "r6",
    name: "Grilled Chicken Salad",
    type: "finished",
    category: "Main",
    station: "Cold line",
    portions: 1,
    portionSize: "1 salad",
    menuPrice: 13.5,
    photoGradient: "from-lime-100 to-emerald-100",
    hasVideo: false,
    steps: [
      "Grill chicken; slice against the grain.",
      "Toss romaine, pico, and tortilla strips with lime vinaigrette.",
      "Top with sliced chicken; serve chilled.",
    ],
    lines: [
      { ingredientId: "i1", quantity: 0.3, unit: "lb", prepNote: "4.8 oz portion" },
      { ingredientId: "i4", quantity: 0.35, unit: "lb", prepNote: "chopped" },
      { ingredientId: "i7", quantity: 0.015, unit: "L", prepNote: "vinaigrette" },
    ],
    subRecipes: [{ recipeId: "r2", quantity: 2, unit: "oz" }],
  },
  {
    id: "r7",
    name: "Cheddar Quesadilla",
    type: "finished",
    category: "Starter",
    station: "Hot line",
    portions: 1,
    portionSize: "1 quesadilla",
    menuPrice: 9.0,
    photoGradient: "from-amber-100 to-yellow-100",
    hasVideo: false,
    steps: [
      "Fill tortilla with cheddar; griddle until crisp.",
      "Cut into wedges; serve with pico.",
    ],
    lines: [
      { ingredientId: "i11", quantity: 2, unit: "ea" },
      { ingredientId: "i3", quantity: 0.25, unit: "lb", prepNote: "shredded" },
    ],
    subRecipes: [{ recipeId: "r2", quantity: 2, unit: "oz" }],
  },
];

const ingredientMap = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));

/** Yield-adjusted effective cost per usable unit. */
export function effectiveUnitCost(ingredient: Ingredient): number {
  return ingredient.costPerUnit / (ingredient.yieldPct / 100);
}

/** Recursive cost of a recipe, including nested sub-recipes. */
export function recipeCost(recipe: Recipe, seen: Set<string> = new Set()): number {
  if (seen.has(recipe.id)) return 0;
  seen.add(recipe.id);
  let total = 0;
  for (const line of recipe.lines) {
    const ingredient = ingredientMap.get(line.ingredientId);
    if (ingredient) total += line.quantity * effectiveUnitCost(ingredient);
  }
  for (const sub of recipe.subRecipes) {
    const subRecipe = recipes.find((r) => r.id === sub.recipeId);
    if (subRecipe) total += sub.quantity * recipeCost(subRecipe, seen);
  }
  return total;
}

export function costPerServing(recipe: Recipe): number {
  return recipeCost(recipe) / recipe.portions;
}

/** Aggregated allergens across a recipe's ingredients and sub-recipes. */
export function recipeAllergens(recipe: Recipe): Allergen[] {
  const set = new Set<Allergen>();
  for (const line of recipe.lines) {
    const ingredient = ingredientMap.get(line.ingredientId);
    ingredient?.allergens.forEach((allergen) => set.add(allergen));
  }
  for (const sub of recipe.subRecipes) {
    const subRecipe = recipes.find((r) => r.id === sub.recipeId);
    subRecipe?.lines.forEach((line) => {
      const ingredient = ingredientMap.get(line.ingredientId);
      ingredient?.allergens.forEach((allergen) => set.add(allergen));
    });
  }
  return [...set];
}
