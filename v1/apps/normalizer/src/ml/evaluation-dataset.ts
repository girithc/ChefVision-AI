import type { NormalizationEvaluationSample } from "@chefvision/shared";

export const defaultEvaluationDataset: NormalizationEvaluationSample[] = [
  {
    id: "eval-1",
    rawText: "TOMATOES ROMA 25LB CASE",
    vendorId: null,
    rawQty: 25,
    rawUnit: "lb",
    expectedCanonicalName: "Tomato",
    description: "common tomato alias with quantity noise"
  },
  {
    id: "eval-2",
    rawText: "roma tomato",
    vendorId: null,
    rawQty: 5,
    rawUnit: "lb",
    expectedCanonicalName: "Tomato",
    description: "word-order variation"
  },
  {
    id: "eval-3",
    rawText: "extra virgin olive oil",
    vendorId: null,
    rawQty: 1,
    rawUnit: "l",
    expectedCanonicalName: "Olive Oil",
    description: "abbreviation-expanded oil example"
  },
  {
    id: "eval-4",
    rawText: "CHKN BRST 10LB",
    vendorId: null,
    rawQty: 10,
    rawUnit: "lb",
    expectedCanonicalName: "Chicken Breast",
    description: "protein abbreviation"
  },
  {
    id: "eval-5",
    rawText: "mystery herb bundle",
    vendorId: null,
    rawQty: 2,
    rawUnit: "unit",
    expectedCanonicalName: null,
    description: "unknown ingredient should remain unresolved"
  }
];
