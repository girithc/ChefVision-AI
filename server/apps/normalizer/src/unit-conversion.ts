import { round } from "@chefvision/shared";

const conversions = new Map<string, { unit: string; multiplier: number }>([
  ["lb", { unit: "kg", multiplier: 0.453592 }],
  ["lbs", { unit: "kg", multiplier: 0.453592 }],
  ["oz", { unit: "kg", multiplier: 0.0283495 }],
  ["g", { unit: "kg", multiplier: 0.001 }],
  ["ml", { unit: "l", multiplier: 0.001 }],
  ["c", { unit: "l", multiplier: 0.236588 }],
  ["cup", { unit: "l", multiplier: 0.236588 }]
]);

export function normalizeQuantity(quantity: number, unit: string, fallbackUnit?: string): { qty: number; unit: string } {
  const normalizedUnit = unit.toLowerCase().trim();
  const conversion = conversions.get(normalizedUnit);

  if (!conversion) {
    return { qty: round(quantity), unit: fallbackUnit ?? normalizedUnit };
  }

  return {
    qty: round(quantity * conversion.multiplier),
    unit: conversion.unit
  };
}
