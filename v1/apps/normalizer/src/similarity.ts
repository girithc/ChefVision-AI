export function hashedEmbedding(text: string, dimensions: number): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const tokens = text.split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    for (let index = 0; index < token.length; index += 1) {
      const code = token.charCodeAt(index);
      const bucket = (code + index * 31 + token.length * 17) % dimensions;
      vector[bucket] += 1;
    }
  }

  const magnitude = Math.sqrt(vector.reduce((sum, item) => sum + item * item, 0)) || 1;
  return vector.map((item) => Number((item / magnitude).toFixed(6)));
}

export function cosineSimilarity(left: number[], right: number[]): number {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  const max = Math.max(left.length, right.length);
  for (let index = 0; index < max; index += 1) {
    const lhs = left[index] ?? 0;
    const rhs = right[index] ?? 0;
    dot += lhs * rhs;
    leftMagnitude += lhs * lhs;
    rightMagnitude += rhs * rhs;
  }

  return dot / ((Math.sqrt(leftMagnitude) || 1) * (Math.sqrt(rightMagnitude) || 1));
}

export function jaccardSimilarity(left: string, right: string): number {
  const lhs = new Set(left.split(/\s+/).filter(Boolean));
  const rhs = new Set(right.split(/\s+/).filter(Boolean));

  if (!lhs.size && !rhs.size) {
    return 1;
  }

  let intersection = 0;
  for (const token of lhs) {
    if (rhs.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...lhs, ...rhs]).size || 1;
  return intersection / union;
}

export function jaroWinkler(left: string, right: string): number {
  if (left === right) {
    return 1;
  }

  const matchDistance = Math.floor(Math.max(left.length, right.length) / 2) - 1;
  const leftMatches = new Array<boolean>(left.length).fill(false);
  const rightMatches = new Array<boolean>(right.length).fill(false);

  let matches = 0;
  for (let index = 0; index < left.length; index += 1) {
    const start = Math.max(0, index - matchDistance);
    const end = Math.min(index + matchDistance + 1, right.length);

    for (let candidate = start; candidate < end; candidate += 1) {
      if (rightMatches[candidate] || left[index] !== right[candidate]) {
        continue;
      }
      leftMatches[index] = true;
      rightMatches[candidate] = true;
      matches += 1;
      break;
    }
  }

  if (!matches) {
    return 0;
  }

  let transpositions = 0;
  let rightIndex = 0;
  for (let index = 0; index < left.length; index += 1) {
    if (!leftMatches[index]) {
      continue;
    }

    while (!rightMatches[rightIndex]) {
      rightIndex += 1;
    }

    if (left[index] !== right[rightIndex]) {
      transpositions += 1;
    }
    rightIndex += 1;
  }

  const jaro =
    (matches / left.length + matches / right.length + (matches - transpositions / 2) / matches) / 3;

  let prefix = 0;
  while (prefix < 4 && prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) {
    prefix += 1;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

export function vectorToSql(vector: number[]): string {
  return `[${vector.map((value) => value.toFixed(6)).join(",")}]`;
}

export function parseVector(raw: string): number[] {
  return raw
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .filter(Boolean)
    .map((part) => Number(part.trim()));
}
