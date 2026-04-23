import type { ExtractedInvoice } from "@chefvision/shared";

function parseTextInvoice(raw: string): ExtractedInvoice {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const supplierName =
    lines.find((line) => line.toLowerCase().startsWith("supplier:"))?.split(":")[1]?.trim() ?? "Unknown Supplier";
  const invoiceDate =
    lines.find((line) => line.toLowerCase().startsWith("date:"))?.split(":")[1]?.trim() ??
    new Date().toISOString().slice(0, 10);
  const lineItems = lines
    .filter((line) => !line.toLowerCase().startsWith("supplier:") && !line.toLowerCase().startsWith("date:"))
    .map((line) => {
      const [rawName, rawQty, rawUnit] = line.split(",").map((part) => part.trim());
      return {
        rawName,
        rawQty: Number(rawQty),
        rawUnit
      };
    })
    .filter((item) => item.rawName && Number.isFinite(item.rawQty) && item.rawUnit);

  return {
    supplierName,
    invoiceDate,
    lineItems
  };
}

function parseOcrInvoice(raw: string): ExtractedInvoice {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const supplierName =
    lines.find((line) => /^vendor\s+/i.test(line))?.replace(/^vendor\s+/i, "").trim() ??
    lines.find((line) => /^supplier[:\s]/i.test(line))?.replace(/^supplier[:\s]+/i, "").trim() ??
    "Unknown Supplier";

  const invoiceDate =
    lines.find((line) => /^date\s+/i.test(line))?.replace(/^date\s+/i, "").trim() ??
    new Date().toISOString().slice(0, 10);

  const lineItems = lines.map(parseOcrLine).filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    supplierName,
    invoiceDate,
    lineItems
  };
}

function parseOcrLine(line: string) {
  if (shouldIgnoreOcrLine(line)) {
    return null;
  }

  const patterns = [
    /^(?<qty>\d+(?:\.\d+)?)\s+(?<unit>[A-Z0-9]+)\s+(?<name>.+?)\s+@?\$?(?<price>\d+\.\d{2})(?:\s+\$?(?<ext>\d+\.\d{2}))?$/i,
    /^(?<name>.+?)\s+(?<qty>\d+(?:\.\d+)?)\s+(?<unit>[A-Z0-9]+)\s+@?\$?(?<price>\d+\.\d{2})(?:\s+\$?(?<ext>\d+\.\d{2}))?$/i,
    /^(?<name>.+?)\s+(?<qty>\d+(?:\.\d+)?)\/(?<unit>[A-Z0-9]+)\s+@?\$?(?<ext>\d+\.\d{2})$/i
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    const groups = match?.groups;
    if (!groups) {
      continue;
    }

    const rawQty = Number(groups.qty);
    if (!Number.isFinite(rawQty)) {
      continue;
    }

    const rawName = normalizeOcrName(groups.name);
    const rawUnit = normalizeOcrUnit(groups.unit, rawName);
    if (!rawName || !rawUnit) {
      continue;
    }

    return {
      rawName,
      rawQty,
      rawUnit
    };
  }

  return null;
}

function shouldIgnoreOcrLine(line: string): boolean {
  return [
    /^invoice\b/i,
    /^vendor\b/i,
    /^date\b/i,
    /^account\b/i,
    /^page\b/i,
    /^terms\b/i,
    /^customer copy\b/i,
    /^thank you\b/i,
    /^deliver to\b/i,
    /^po#?/i,
    /^bill to\b/i,
    /^desc\b/i,
    /^item description\b/i,
    /^product qty\b/i,
    /^descripc/i,
    /^subtotal\b/i,
    /^driver sign\b/i,
    /^received by\b/i,
    /^tax exempt\b/i,
    /^next delivery\b/i,
    /^call for shortages\b/i,
    /^lot\s/i,
    /^chk temp\b/i,
    /^back order\b/i,
    /^n\/c$/i,
    /^remit to\b/i
  ].some((pattern) => pattern.test(line));
}

function normalizeOcrName(name: string): string {
  return name
    .replace(/CA5E/gi, "CASE")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeOcrUnit(unitToken: string, rawName: string): string {
  const repaired = unitToken.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/5/g, "S").replace(/0/g, "O");
  const directMap: Record<string, string> = {
    LB: "lb",
    LBS: "lb",
    KG: "kg",
    KILO: "kg",
    OZ: "oz",
    OUNCE: "oz",
    OUNCES: "oz",
    G: "g",
    GRAM: "g",
    L: "l",
    LT: "l",
    LTR: "l",
    LTRS: "l",
    ML: "ml",
    CASE: "case",
    CS: "case",
    BAG: "bag",
    BG: "bag",
    BOX: "box",
    BX: "box",
    EA: "ea",
    EACH: "ea"
  };

  if (directMap[repaired]) {
    return directMap[repaired];
  }

  const upperName = rawName.toUpperCase().replace(/5/g, "S").replace(/0/g, "O");
  if (/\b\d+\s*(LB|LBS)\b/.test(upperName)) return "lb";
  if (/\b\d+\s*(KG|KILO)\b/.test(upperName)) return "kg";
  if (/\b\d+\s*(OZ|OUNCE|OUNCES)\b/.test(upperName)) return "oz";
  if (/\b\d+\s*(L|LTR|LTRS)\b/.test(upperName)) return "l";
  if (/\b\d+\s*ML\b/.test(upperName)) return "ml";
  if (/\b(CASE|CS)\b/.test(upperName)) return "case";
  if (/\bBAG\b/.test(upperName)) return "bag";
  if (/\bBOX\b/.test(upperName)) return "box";
  if (/\b(EA|EACH|BUNCH)\b/.test(upperName)) return "ea";

  return repaired.toLowerCase();
}

export function extractInvoice(buffer: Buffer, mimeType: string): ExtractedInvoice {
  if (mimeType === "application/json") {
    return JSON.parse(buffer.toString("utf8")) as ExtractedInvoice;
  }

  if (mimeType === "text/plain" || mimeType === "text/csv") {
    const text = buffer.toString("utf8");
    return /^(vendor|invoice|terms|page)\b/im.test(text) ? parseOcrInvoice(text) : parseTextInvoice(text);
  }

  throw new Error(`Unsupported upload type for demo extractor: ${mimeType}`);
}
