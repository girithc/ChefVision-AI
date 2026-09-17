const STOPWORDS = new Set(["case", "bag", "box", "fresh", "organic", "pack", "pk", "brand"]);

const ABBREVIATIONS: Record<string, string> = {
  evoo: "extra virgin olive oil",
  chkn: "chicken",
  toms: "tomatoes",
  tom: "tomato",
  romas: "roma"
};

function normalizeToken(token: string): string {
  if (ABBREVIATIONS[token]) {
    return ABBREVIATIONS[token];
  }

  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }

  if (token.endsWith("oes") && token.length > 4) {
    return token.slice(0, -2);
  }

  if (token.endsWith("s") && token.length > 3 && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }

  return token;
}

export function preprocessIngredient(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/\b\d+(?:[./]\d+)?\s*(?:lb|lbs|oz|kg|g|l|ml|gal|ct|count|ea|pk|pack|case|c)\b/g, " ")
    .replace(/\b\d+\s*\/\s*\d+\b/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned
    .split(" ")
    .flatMap((token) => normalizeToken(token).split(" "))
    .filter((token) => token && !STOPWORDS.has(token))
    .join(" ")
    .trim();
}

export function toCanonicalPlaceholderName(preprocessed: string): string {
  return preprocessed
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}
