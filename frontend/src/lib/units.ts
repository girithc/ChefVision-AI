// Unit handling for comparing recipe requirements with the inventory ledger.
// The normalizer stores mass in kg and volume in l (server/apps/normalizer/src/unit-conversion.ts).

type Dimension = "mass" | "volume" | "count";

const UNITS: Record<string, { dim: Dimension; toBase: number }> = {
  // mass, base = kg
  kg: { dim: "mass", toBase: 1 },
  g: { dim: "mass", toBase: 0.001 },
  lb: { dim: "mass", toBase: 0.453592 },
  lbs: { dim: "mass", toBase: 0.453592 },
  oz: { dim: "mass", toBase: 0.0283495 },
  // volume, base = l
  l: { dim: "volume", toBase: 1 },
  ml: { dim: "volume", toBase: 0.001 },
  tsp: { dim: "volume", toBase: 0.00492892 },
  tbsp: { dim: "volume", toBase: 0.0147868 },
  cup: { dim: "volume", toBase: 0.236588 },
  c: { dim: "volume", toBase: 0.236588 },
  "fl oz": { dim: "volume", toBase: 0.0295735 },
  qt: { dim: "volume", toBase: 0.946353 },
  gal: { dim: "volume", toBase: 3.78541 },
  // count, base = each
  each: { dim: "count", toBase: 1 },
  ea: { dim: "count", toBase: 1 },
  pc: { dim: "count", toBase: 1 },
  unit: { dim: "count", toBase: 1 },
  dozen: { dim: "count", toBase: 12 },
  doz: { dim: "count", toBase: 12 },
};

const BASE_UNIT: Record<Dimension, string> = { mass: "kg", volume: "l", count: "each" };

export const COMMON_UNITS = ["kg", "g", "lb", "oz", "l", "ml", "cup", "tbsp", "tsp", "gal", "each", "dozen"];

export function canonicalUnit(unit: string): string {
  return unit.trim().toLowerCase().replace(/\.$/, "");
}

export function unitInfo(unit: string) {
  return UNITS[canonicalUnit(unit)] ?? null;
}

/** Converts a quantity to its dimension's base unit; unknown units pass through unchanged. */
export function toBase(qty: number, unit: string): { qty: number; unit: string; dim: Dimension | null } {
  const info = unitInfo(unit);
  if (!info) {
    return { qty, unit: canonicalUnit(unit), dim: null };
  }
  return { qty: qty * info.toBase, unit: BASE_UNIT[info.dim], dim: info.dim };
}

/** Converts qty from one unit to another, or returns null if they are incompatible. */
export function convert(qty: number, from: string, to: string): number | null {
  const a = unitInfo(from);
  const b = unitInfo(to);
  if (!a || !b) {
    return canonicalUnit(from) === canonicalUnit(to) ? qty : null;
  }
  if (a.dim !== b.dim) {
    return null;
  }
  return (qty * a.toBase) / b.toBase;
}

export function fmtQty(qty: number, digits = 2): string {
  return Number.isInteger(qty) ? String(qty) : qty.toFixed(digits).replace(/\.?0+$/, "");
}
