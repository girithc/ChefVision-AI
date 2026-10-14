// Event planning and reorder engine (Model 2 planning logic, client-side).
// Expands recipes x servings into ingredient requirements, aggregates them,
// compares against the inventory ledger, and explains each shortage.
import type { InventoryRecord, PlannedEvent, Receipt, Recipe } from "./types";
import { canonicalUnit, convert, fmtQty, toBase } from "./units";

export interface RequirementDriver {
  eventId: string;
  eventName: string;
  eventDate: string;
  recipeName: string;
  servings: number;
  qty: number; // in requirement unit
}

export interface Requirement {
  key: string;
  name: string;
  qty: number;
  unit: string;
  drivers: RequirementDriver[];
}

export type CheckStatus = "ok" | "short" | "missing" | "unit_mismatch";

export interface InventoryCheckRow extends Requirement {
  onHand: number;
  shortage: number;
  status: CheckStatus;
  inventoryUnit: string | null;
}

export interface ReorderLine {
  key: string;
  name: string;
  qty: number;
  unit: string;
  reason: string;
}

/** Normalizes ingredient names so "Tomatoes" and "tomato " join on the same key. */
export function ingredientKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => (token.length > 3 && token.endsWith("es") ? token.slice(0, -2) : token))
    .map((token) => (token.length > 3 && token.endsWith("s") ? token.slice(0, -1) : token))
    .join(" ");
}

export function computeRequirements(events: PlannedEvent[], recipes: Recipe[]): Requirement[] {
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const byKey = new Map<string, Requirement>();

  for (const event of events) {
    for (const selection of event.recipes) {
      const recipe = recipeById.get(selection.recipeId);
      if (!recipe || selection.servings <= 0) {
        continue;
      }
      for (const ingredient of recipe.ingredients) {
        const base = toBase(ingredient.qtyPerServing * selection.servings, ingredient.unit);
        // Requirements in incompatible units are tracked separately under a unit-qualified key.
        const key = `${ingredientKey(ingredient.name)}|${base.unit}`;
        const existing =
          byKey.get(key) ?? { key, name: ingredient.name, qty: 0, unit: base.unit, drivers: [] };
        existing.qty += base.qty;
        existing.drivers.push({
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          recipeName: recipe.name,
          servings: selection.servings,
          qty: base.qty,
        });
        byKey.set(key, existing);
      }
    }
  }

  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function checkInventory(requirements: Requirement[], inventory: InventoryRecord[]): InventoryCheckRow[] {
  const inventoryByKey = new Map<string, InventoryRecord[]>();
  for (const record of inventory) {
    const key = ingredientKey(record.canonicalName);
    inventoryByKey.set(key, [...(inventoryByKey.get(key) ?? []), record]);
  }

  return requirements.map((requirement) => {
    const records = inventoryByKey.get(requirement.key.split("|")[0]) ?? [];
    if (records.length === 0) {
      return { ...requirement, onHand: 0, shortage: requirement.qty, status: "missing", inventoryUnit: null };
    }

    let onHand = 0;
    let compatible = false;
    for (const record of records) {
      const converted = convert(record.onHandQty, record.unit, requirement.unit);
      if (converted !== null) {
        onHand += converted;
        compatible = true;
      }
    }
    if (!compatible) {
      return {
        ...requirement,
        onHand: 0,
        shortage: requirement.qty,
        status: "unit_mismatch",
        inventoryUnit: canonicalUnit(records[0].unit),
      };
    }

    const shortage = Math.max(0, requirement.qty - onHand);
    return {
      ...requirement,
      onHand,
      shortage,
      status: shortage > 1e-9 ? "short" : "ok",
      inventoryUnit: requirement.unit,
    };
  });
}

/** Builds the explainable reorder list; bufferPct adds safety stock on top of the shortage. */
export function buildReorderLines(rows: InventoryCheckRow[], bufferPct: number): ReorderLine[] {
  return rows
    .filter((row) => row.status !== "ok")
    .map((row) => {
      const qty = roundUp(row.shortage * (1 + bufferPct / 100));
      const drivers = summarizeDrivers(row);
      const stock =
        row.status === "missing"
          ? "not in inventory"
          : row.status === "unit_mismatch"
            ? `inventory tracked in ${row.inventoryUnit}, cannot convert`
            : `${fmtQty(row.onHand)} ${row.unit} on hand`;
      return {
        key: row.key,
        name: row.name,
        qty,
        unit: row.unit,
        reason: `Need ${fmtQty(row.qty)} ${row.unit} for ${drivers}; ${stock}${
          bufferPct > 0 ? `; +${bufferPct}% safety buffer` : ""
        }.`,
      };
    });
}

function summarizeDrivers(row: Requirement): string {
  const byEvent = new Map<string, string[]>();
  for (const driver of row.drivers) {
    byEvent.set(driver.eventName, [
      ...(byEvent.get(driver.eventName) ?? []),
      `${driver.recipeName} x${driver.servings}`,
    ]);
  }
  return [...byEvent.entries()].map(([event, recipes]) => `${event} (${recipes.join(", ")})`).join(", ");
}

function roundUp(qty: number): number {
  if (qty >= 10) return Math.ceil(qty);
  return Math.ceil(qty * 10) / 10;
}

/**
 * Offline fallback for the inventory ledger when the API is unreachable:
 * sums receipt line items by ingredient name in base units.
 */
export function inventoryFromReceipts(receipts: Receipt[]): InventoryRecord[] {
  const byKey = new Map<string, InventoryRecord>();
  for (const receipt of receipts) {
    for (const item of receipt.items) {
      if (!item.name.trim() || item.qty <= 0) continue;
      const base = toBase(item.qty, item.unit || "each");
      const key = `${ingredientKey(item.name)}|${base.unit}`;
      const existing = byKey.get(key) ?? {
        canonicalId: key,
        canonicalName: titleCase(item.name),
        onHandQty: 0,
        unit: base.unit,
      };
      existing.onHandQty += base.qty;
      byKey.set(key, existing);
    }
  }
  return [...byKey.values()].sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));
}

export function receiptSubtotal(receipt: Pick<Receipt, "items">): number {
  return receipt.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

export function receiptTotal(receipt: Pick<Receipt, "items" | "tax" | "tip">): number {
  return receiptSubtotal(receipt) + receipt.tax + receipt.tip;
}

function titleCase(text: string): string {
  return text.trim().toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
