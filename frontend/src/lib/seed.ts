import { todayIso } from "./cn";
import type { PlannedEvent, Receipt, Recipe } from "./types";

// Ingredient names match the canonical catalog seeded in server/sql/001_init.sql where possible.
export const seedRecipes: Recipe[] = [
  {
    id: "r-margherita",
    name: "Margherita Pasta",
    category: "Entree",
    ingredients: [
      { name: "Tomato", qtyPerServing: 0.15, unit: "kg" },
      { name: "Olive Oil", qtyPerServing: 15, unit: "ml" },
      { name: "Pasta", qtyPerServing: 0.12, unit: "kg" },
      { name: "Basil", qtyPerServing: 5, unit: "g" },
      { name: "Mozzarella", qtyPerServing: 60, unit: "g" },
    ],
  },
  {
    id: "r-grilled-chicken",
    name: "Grilled Chicken Plate",
    category: "Entree",
    ingredients: [
      { name: "Chicken Breast", qtyPerServing: 0.2, unit: "kg" },
      { name: "Olive Oil", qtyPerServing: 10, unit: "ml" },
      { name: "Garlic", qtyPerServing: 5, unit: "g" },
      { name: "Lemon", qtyPerServing: 0.5, unit: "each" },
    ],
  },
  {
    id: "r-caprese",
    name: "Caprese Salad",
    category: "Appetizer",
    ingredients: [
      { name: "Tomato", qtyPerServing: 0.1, unit: "kg" },
      { name: "Mozzarella", qtyPerServing: 50, unit: "g" },
      { name: "Basil", qtyPerServing: 3, unit: "g" },
      { name: "Olive Oil", qtyPerServing: 1, unit: "tbsp" },
    ],
  },
];

function isoDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return todayIso(date);
}

export const seedEvents: PlannedEvent[] = [
  {
    id: "e-wedding",
    name: "Rivera Wedding Catering",
    date: isoDaysFromNow(5),
    guests: 100,
    notes: "Buffet service, 2 entrees + appetizer",
    recipes: [
      { recipeId: "r-margherita", servings: 60 },
      { recipeId: "r-grilled-chicken", servings: 40 },
      { recipeId: "r-caprese", servings: 100 },
    ],
  },
  {
    id: "e-corporate",
    name: "Tech Co. Lunch",
    date: isoDaysFromNow(12),
    guests: 40,
    notes: "",
    recipes: [{ recipeId: "r-grilled-chicken", servings: 40 }],
  },
];

export function sampleReceipts(): Receipt[] {
  const now = new Date().toISOString();
  return [
    {
      id: "rc-sample-1",
      invoiceId: null,
      source: "manual",
      supplier: "Roma Farms",
      date: isoDaysFromNow(-3),
      invoiceNumber: "RF-10422",
      items: [
        { name: "Tomato", qty: 25, unit: "lb", unitPrice: 1.8 },
        { name: "Basil", qty: 200, unit: "g", unitPrice: 0.03 },
        { name: "Olive Oil", qty: 3, unit: "l", unitPrice: 12.5 },
      ],
      tax: 4.2,
      tip: 0,
      notes: "Sample data",
      status: "local",
      createdAt: now,
    },
    {
      id: "rc-sample-2",
      invoiceId: null,
      source: "manual",
      supplier: "Sysco",
      date: isoDaysFromNow(-1),
      invoiceNumber: "SY-88213",
      items: [
        { name: "Chicken Breast", qty: 10, unit: "lb", unitPrice: 3.9 },
        { name: "Pasta", qty: 5, unit: "kg", unitPrice: 2.4 },
        { name: "Mozzarella", qty: 2, unit: "kg", unitPrice: 9.75 },
      ],
      tax: 6.1,
      tip: 0,
      notes: "Sample data",
      status: "local",
      createdAt: now,
    },
  ];
}
