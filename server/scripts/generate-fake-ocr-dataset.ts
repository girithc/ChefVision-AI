import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type Unit = "lb" | "kg" | "oz" | "g" | "l" | "ml" | "case" | "bag" | "box" | "ea";

interface IngredientTemplate {
  canonicalName: string;
  category: string;
  defaultUnit: Unit;
  aliases: string[];
  abbreviation?: string;
}

interface GeneratedLineItem {
  rawName: string;
  rawQty: number;
  rawUnit: Unit;
  canonicalName: string;
  category: string;
}

interface GeneratedInvoice {
  invoiceId: string;
  supplierName: string;
  supplierCode: string;
  invoiceDate: string;
  restaurantId: string;
  ocrText: string;
  expectedLineItems: GeneratedLineItem[];
  metadata: {
    lineItemCount: number;
    noiseFlags: string[];
    hasHeaderNoise: boolean;
    hasFooterNoise: boolean;
  };
}

const OUTPUT_DIR = path.resolve("test/fixtures/fake-ocr");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "fake-ocr-invoices-1000.jsonl");
const SUMMARY_PATH = path.join(OUTPUT_DIR, "fake-ocr-invoices-1000.summary.json");
const COUNT = 1000;
const SEED = 2952026;

const suppliers = [
  ["Golden State Produce", "GSP"],
  ["Pacific Fresh Foods", "PFF"],
  ["Metro Restaurant Supply", "MRS"],
  ["Prime Vendor Wholesale", "PVW"],
  ["Bayline Kitchen Goods", "BKG"],
  ["Harvest Depot", "HDP"],
  ["Chef Source Direct", "CSD"],
  ["West Coast Pantry", "WCP"],
  ["MarketLine Ingredients", "MLI"],
  ["Anchor Food Traders", "AFT"]
] as const;

const restaurantIds = ["rest-1", "rest-2", "rest-3", "rest-4", "rest-5"];

const ingredients: IngredientTemplate[] = [
  { canonicalName: "Tomato", category: "produce", defaultUnit: "lb", aliases: ["roma tomato", "tomato roma", "fresh roma tomatoes"], abbreviation: "TOM" },
  { canonicalName: "Chicken Breast", category: "protein", defaultUnit: "lb", aliases: ["boneless chicken breast", "chicken brst", "chkn breast"], abbreviation: "CHKN BRST" },
  { canonicalName: "Olive Oil", category: "oil", defaultUnit: "l", aliases: ["extra virgin olive oil", "olive oil evoo", "evoo"], abbreviation: "EVOO" },
  { canonicalName: "Lettuce", category: "produce", defaultUnit: "case", aliases: ["romaine lettuce", "iceberg lettuce", "letuce"], abbreviation: "LTC" },
  { canonicalName: "Onion", category: "produce", defaultUnit: "lb", aliases: ["yellow onion", "sweet onion", "onions jumbo"], abbreviation: "ONION" },
  { canonicalName: "Garlic", category: "produce", defaultUnit: "lb", aliases: ["peeled garlic", "garlic whole", "garlic cloves"], abbreviation: "GAR" },
  { canonicalName: "Bell Pepper", category: "produce", defaultUnit: "case", aliases: ["green bell pepper", "bell peppers mixed", "pepper bell"], abbreviation: "BL PPR" },
  { canonicalName: "Spinach", category: "produce", defaultUnit: "case", aliases: ["baby spinach", "spinach leaf", "spnach"], abbreviation: "SPNCH" },
  { canonicalName: "Basil", category: "herb", defaultUnit: "ea", aliases: ["fresh basil", "sweet basil", "basil bunch"], abbreviation: "BSL" },
  { canonicalName: "Cilantro", category: "herb", defaultUnit: "ea", aliases: ["fresh cilantro", "cilantro bunch", "cilantr"], abbreviation: "CIL" },
  { canonicalName: "Parsley", category: "herb", defaultUnit: "ea", aliases: ["italian parsley", "parsley flat", "parsly"], abbreviation: "PRSLY" },
  { canonicalName: "Carrot", category: "produce", defaultUnit: "lb", aliases: ["carrots jumbo", "whole carrot", "carrot bulk"], abbreviation: "CAR" },
  { canonicalName: "Celery", category: "produce", defaultUnit: "case", aliases: ["celery stalks", "celery hearts", "celry"], abbreviation: "CEL" },
  { canonicalName: "Potato", category: "produce", defaultUnit: "lb", aliases: ["russet potato", "potatoes baker", "potato 50lb"], abbreviation: "POT" },
  { canonicalName: "Mushroom", category: "produce", defaultUnit: "lb", aliases: ["button mushroom", "mushrooms sliced", "mushrm"], abbreviation: "MSHRM" },
  { canonicalName: "Cheddar Cheese", category: "dairy", defaultUnit: "lb", aliases: ["cheddar shred", "mild cheddar cheese", "ched chz"], abbreviation: "CHED" },
  { canonicalName: "Mozzarella", category: "dairy", defaultUnit: "lb", aliases: ["mozzarella shred", "fresh mozzarella", "mozz"], abbreviation: "MOZZ" },
  { canonicalName: "Butter", category: "dairy", defaultUnit: "lb", aliases: ["unsalted butter", "butter sticks", "bttr"], abbreviation: "BTR" },
  { canonicalName: "Heavy Cream", category: "dairy", defaultUnit: "l", aliases: ["cream heavy", "heavy whipping cream", "hvy crm"], abbreviation: "HCRM" },
  { canonicalName: "Milk", category: "dairy", defaultUnit: "l", aliases: ["whole milk", "milk 2 percent", "mlk"], abbreviation: "MLK" },
  { canonicalName: "Flour", category: "dry", defaultUnit: "lb", aliases: ["all purpose flour", "ap flour", "flour ap"], abbreviation: "AP FLR" },
  { canonicalName: "Sugar", category: "dry", defaultUnit: "lb", aliases: ["granulated sugar", "white sugar", "sgr"], abbreviation: "SGR" },
  { canonicalName: "Salt", category: "dry", defaultUnit: "lb", aliases: ["kosher salt", "sea salt", "slt"], abbreviation: "SLT" },
  { canonicalName: "Black Pepper", category: "dry", defaultUnit: "lb", aliases: ["ground black pepper", "black pepper coarse", "blk ppr"], abbreviation: "BLK PPR" },
  { canonicalName: "Rice", category: "dry", defaultUnit: "lb", aliases: ["jasmine rice", "long grain rice", "rice long grain"], abbreviation: "RICE" },
  { canonicalName: "Pasta", category: "dry", defaultUnit: "lb", aliases: ["penne pasta", "spaghetti pasta", "pasta dry"], abbreviation: "PSTA" },
  { canonicalName: "Ground Beef", category: "protein", defaultUnit: "lb", aliases: ["beef ground", "ground chuck", "grnd beef"], abbreviation: "GR BF" },
  { canonicalName: "Salmon", category: "protein", defaultUnit: "lb", aliases: ["atlantic salmon", "salmon filet", "slmn"], abbreviation: "SLMN" },
  { canonicalName: "Shrimp", category: "protein", defaultUnit: "lb", aliases: ["shrimp peeled", "shrimp 16 20", "shrmp"], abbreviation: "SHRMP" },
  { canonicalName: "Egg", category: "dairy", defaultUnit: "case", aliases: ["large eggs", "eggs dozen", "egg grade aa"], abbreviation: "EGG" }
];

const headerNoiseLines = [
  "CUSTOMER COPY",
  "REMIT TO MAIN LOCKBOX",
  "TERMS NET 14",
  "THANK YOU FOR YOUR BUSINESS",
  "PAGE 1 OF 1",
  "DELIVER TO: KITCHEN RECEIVING",
  "PO#: AUTO-GENERATED",
  "BILL TO / SHIP TO MATCHED"
];

const footerNoiseLines = [
  "subtotal may not reflect credits",
  "driver sign __________________",
  "received by __________________",
  "tax exempt resale certificate on file",
  "next delivery window 6am-9am",
  "call for shortages within 24 hrs"
];

const unitHints: Record<Unit, string[]> = {
  lb: ["LB", "LBS", "LB CASE"],
  kg: ["KG", "KILO"],
  oz: ["OZ", "OUNCE"],
  g: ["G", "GRAM"],
  l: ["L", "LTR"],
  ml: ["ML"],
  case: ["CASE", "CS", "1 CASE"],
  bag: ["BAG", "BG"],
  box: ["BOX", "BX"],
  ea: ["EA", "EACH", "BUNCH"]
};

const prng = createPrng(SEED);

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const invoices: GeneratedInvoice[] = Array.from({ length: COUNT }, (_, index) =>
    buildInvoice(index + 1)
  );

  const jsonl = invoices.map((invoice) => JSON.stringify(invoice)).join("\n") + "\n";
  await writeFile(OUTPUT_PATH, jsonl, "utf8");

  const summary = summarize(invoices);
  await writeFile(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Generated ${invoices.length} fake OCR invoices at ${OUTPUT_PATH}`);
  console.log(`Summary written to ${SUMMARY_PATH}`);
}

function buildInvoice(index: number): GeneratedInvoice {
  const [supplierName, supplierCode] = pick(suppliers);
  const restaurantId = pick(restaurantIds);
  const invoiceDate = randomDate();
  const lineItemCount = randomInt(6, 15);
  const lineItems = Array.from({ length: lineItemCount }, () => buildLineItem());
  const noiseFlags = buildNoiseFlags();

  const ocrText = buildOcrText({
    index,
    supplierName,
    supplierCode,
    invoiceDate,
    lineItems,
    noiseFlags
  });

  return {
    invoiceId: `ocr-invoice-${String(index).padStart(4, "0")}`,
    supplierName,
    supplierCode,
    invoiceDate,
    restaurantId,
    ocrText,
    expectedLineItems: lineItems,
    metadata: {
      lineItemCount,
      noiseFlags,
      hasHeaderNoise: noiseFlags.includes("header_noise"),
      hasFooterNoise: noiseFlags.includes("footer_noise")
    }
  };
}

function buildLineItem(): GeneratedLineItem {
  const ingredient = pick(ingredients);
  const rawUnit = pickUnitsForIngredient(ingredient.defaultUnit);
  const rawQty = randomQuantity(rawUnit);
  const alias = buildAlias(ingredient, rawQty, rawUnit);

  return {
    rawName: alias,
    rawQty,
    rawUnit,
    canonicalName: ingredient.canonicalName,
    category: ingredient.category
  };
}

function buildAlias(ingredient: IngredientTemplate, qty: number, unit: Unit): string {
  const baseName = chooseBaseName(ingredient);
  const decorated = maybeInjectTypo(baseName);
  const maybeUpper = chance(0.55) ? decorated.toUpperCase() : toInvoiceTitleCase(decorated);
  const quantityHint = chance(0.8) ? ` ${formatQuantityHint(qty, unit)}` : "";
  const packaging = chance(0.35) ? ` ${pick(["CASE", "BAG", "BOX", "FRESH", "ORGANIC"])}` : "";
  const vendorPrefix = chance(0.18) ? `${pick(["PREM", "WHSL", "KITCHN", "RL", "SYS"])} ` : "";

  return `${vendorPrefix}${maybeUpper}${quantityHint}${packaging}`.trim().replace(/\s+/g, " ");
}

function buildOcrText(input: {
  index: number;
  supplierName: string;
  supplierCode: string;
  invoiceDate: string;
  lineItems: GeneratedLineItem[];
  noiseFlags: string[];
}): string {
  const lines: string[] = [];

  if (input.noiseFlags.includes("header_noise")) {
    lines.push(pick(headerNoiseLines));
  }

  lines.push(`INVOICE ${input.supplierCode}-${String(input.index).padStart(6, "0")}`);
  lines.push(`Vendor ${input.supplierName}`);
  lines.push(`Date ${input.invoiceDate}`);

  if (chance(0.7)) {
    lines.push(`Account ${randomInt(10000, 99999)} Route ${randomInt(1, 40)}`);
  }

  if (input.noiseFlags.includes("column_headers")) {
    lines.push(pick(["DESC QTY UOM PRICE EXT", "ITEM DESCRIPTION QTY UNIT", "PRODUCT QTY UOM", "DESCRIPCION CANT U/M"]));
  }

  for (const item of input.lineItems) {
    lines.push(formatOcrLine(item, input.noiseFlags));
    if (chance(0.08)) {
      const extraLine = pick(["", "LOT 204A", "CHK TEMP", "BACK ORDER 0", "N/C"]).trim();
      if (extraLine) {
        lines.push(extraLine);
      }
    }
  }

  if (input.noiseFlags.includes("footer_noise")) {
    lines.push(pick(footerNoiseLines));
  }

  return lines.filter(Boolean).join("\n");
}

function formatOcrLine(item: GeneratedLineItem, noiseFlags: string[]): string {
  const price = (randomInt(120, 4200) / 100).toFixed(2);
  const extended = (Number(price) * item.rawQty).toFixed(2);
  const qtyToken = maybeOcrCorrupt(`${item.rawQty}`, noiseFlags);
  const unitToken = maybeOcrCorrupt(item.rawUnit.toUpperCase(), noiseFlags);
  const nameToken = maybeOcrCorrupt(item.rawName, noiseFlags);

  const formats = [
    `${nameToken} ${qtyToken} ${unitToken} ${price} ${extended}`,
    `${qtyToken} ${unitToken} ${nameToken} @${price} ${extended}`,
    `${nameToken}  ${qtyToken}  ${unitToken}  $${price}`,
    `${nameToken} ${qtyToken}/${unitToken} ${extended}`
  ];

  return pick(formats);
}

function maybeOcrCorrupt(value: string, noiseFlags: string[]): string {
  let next = value;

  if (noiseFlags.includes("merged_tokens") && chance(0.2)) {
    next = next.replace(/\s+/g, "");
  }

  if (noiseFlags.includes("split_tokens") && chance(0.2)) {
    next = next.replace(/([A-Z]{3,})/g, "$1 ");
  }

  if (noiseFlags.includes("ocr_confusion") && chance(0.25)) {
    next = next
      .replace(/O/g, "0")
      .replace(/I/g, "1")
      .replace(/S/g, "5")
      .replace(/\bL\b/g, "1");
  }

  if (noiseFlags.includes("extra_whitespace") && chance(0.35)) {
    next = next.replace(/\s/g, "  ");
  }

  return next;
}

function chooseBaseName(ingredient: IngredientTemplate): string {
  const variants = [ingredient.canonicalName, ...ingredient.aliases];
  if (ingredient.abbreviation) {
    variants.push(ingredient.abbreviation);
  }
  return pick(variants);
}

function pickUnitsForIngredient(defaultUnit: Unit): Unit {
  if (defaultUnit === "lb") {
    return pick(["lb", "lb", "lb", "oz", "case"]);
  }
  if (defaultUnit === "l") {
    return pick(["l", "ml", "l", "l"]);
  }
  if (defaultUnit === "case") {
    return pick(["case", "box", "ea", "case"]);
  }
  if (defaultUnit === "ea") {
    return pick(["ea", "ea", "bag", "box"]);
  }
  return defaultUnit;
}

function randomQuantity(unit: Unit): number {
  switch (unit) {
    case "lb":
      return pick([5, 10, 15, 20, 25, 40, 50]);
    case "kg":
      return pick([2, 5, 10, 20]);
    case "oz":
      return pick([12, 16, 24, 32]);
    case "g":
      return pick([500, 1000, 2500]);
    case "l":
      return pick([1, 2, 3, 5]);
    case "ml":
      return pick([250, 500, 750, 1000]);
    case "case":
      return pick([1, 2, 3, 4]);
    case "bag":
      return pick([1, 2, 3, 5]);
    case "box":
      return pick([1, 2, 4, 6]);
    case "ea":
      return pick([1, 2, 6, 12, 24]);
  }
}

function formatQuantityHint(qty: number, unit: Unit): string {
  return `${qty}${pick(unitHints[unit])}`;
}

function maybeInjectTypo(value: string): string {
  if (!chance(0.22)) {
    return value;
  }

  const operations = [
    (input: string) => input.replace(/tt/g, "t"),
    (input: string) => input.replace(/ph/g, "f"),
    (input: string) => input.replace(/ou/g, "o"),
    (input: string) => input.replace(/ea/g, "ae"),
    (input: string) => input.replace(/e/g, "3"),
    (input: string) => input.replace(/i/g, "1")
  ];

  return pick(operations)(value);
}

function buildNoiseFlags(): string[] {
  const flags = [
    chance(0.6) ? "header_noise" : null,
    chance(0.5) ? "footer_noise" : null,
    chance(0.55) ? "column_headers" : null,
    chance(0.35) ? "ocr_confusion" : null,
    chance(0.3) ? "merged_tokens" : null,
    chance(0.28) ? "split_tokens" : null,
    chance(0.4) ? "extra_whitespace" : null
  ].filter(Boolean) as string[];

  return flags.length ? flags : ["column_headers"];
}

function randomDate(): string {
  const year = 2026;
  const month = randomInt(1, 4);
  const day = randomInt(1, 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function summarize(invoices: GeneratedInvoice[]) {
  const lineItemCount = invoices.reduce((sum, invoice) => sum + invoice.expectedLineItems.length, 0);
  const supplierCounts = countBy(invoices.map((invoice) => invoice.supplierName));
  const canonicalCounts = countBy(
    invoices.flatMap((invoice) => invoice.expectedLineItems.map((item) => item.canonicalName))
  );
  const noiseCounts = countBy(invoices.flatMap((invoice) => invoice.metadata.noiseFlags));

  return {
    seed: SEED,
    invoiceCount: invoices.length,
    totalLineItems: lineItemCount,
    averageLineItemsPerInvoice: Number((lineItemCount / invoices.length).toFixed(2)),
    suppliers: supplierCounts,
    topCanonicals: topEntries(canonicalCounts, 10),
    noiseFlags: noiseCounts,
    sampleInvoiceIds: invoices.slice(0, 5).map((invoice) => invoice.invoiceId)
  };
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
}

function topEntries(map: Record<string, number>, limit: number) {
  return Object.entries(map)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

function toInvoiceTitleCase(value: string): string {
  return value
    .split(" ")
    .map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part)
    .join(" ");
}

function createPrng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(prng() * (max - min + 1)) + min;
}

function chance(probability: number): boolean {
  return prng() < probability;
}

function pick<const T>(values: readonly T[]): T {
  return values[randomInt(0, values.length - 1)];
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
