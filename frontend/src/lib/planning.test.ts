import { describe, expect, it } from "vitest";

import { buildReorderLines, checkInventory, computeRequirements, ingredientKey, receiptTotal } from "./planning";
import type { PlannedEvent, Receipt, Recipe } from "./types";

const recipes: Recipe[] = [{
  id: "recipe-pasta",
  name: "Tomato Pasta",
  category: "Dinner",
  ingredients: [
    { name: "Roma Tomatoes", qtyPerServing: 0.25, unit: "kg" },
    { name: "Olive Oil", qtyPerServing: 10, unit: "ml" },
  ],
}];

const events: PlannedEvent[] = [{
  id: "event-1",
  name: "Friday Dinner",
  date: "2026-10-16",
  guests: 20,
  notes: "",
  recipes: [{ recipeId: "recipe-pasta", servings: 20 }],
}];

describe("planning and reorder calculations", () => {
  it("normalizes plural ingredient names", () => {
    expect(ingredientKey(" Roma Tomatoes ")).toBe("roma tomato");
  });

  it("scales recipes and explains inventory shortages", () => {
    const requirements = computeRequirements(events, recipes);
    const checked = checkInventory(requirements, [
      { canonicalId: "tomato", canonicalName: "Roma Tomato", onHandQty: 3, unit: "kg" },
      { canonicalId: "oil", canonicalName: "Olive Oil", onHandQty: 0.5, unit: "l" },
    ]);
    const reorder = buildReorderLines(checked, 10);

    expect(requirements.find((item) => item.name === "Roma Tomatoes")?.qty).toBe(5);
    expect(checked.find((item) => item.name === "Olive Oil")?.status).toBe("ok");
    expect(reorder).toHaveLength(1);
    expect(reorder[0]).toMatchObject({ name: "Roma Tomatoes", qty: 2.2, unit: "kg" });
    expect(reorder[0].reason).toContain("Friday Dinner");
  });

  it("calculates receipt totals from persisted prices, tax, and tip", () => {
    const receipt = {
      items: [{ name: "Tomato", qty: 2, unit: "kg", unitPrice: 4 }],
      tax: 0.8,
      tip: 1.2,
    } satisfies Pick<Receipt, "items" | "tax" | "tip">;
    expect(receiptTotal(receipt)).toBe(10);
  });
});
