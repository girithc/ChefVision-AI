import { randomUUID } from "node:crypto";

import { preprocessIngredient, toCanonicalPlaceholderName } from "./preprocess.js";
import { hashedEmbedding } from "./similarity.js";
import type { AliasHit, CanonicalIngredient, CanonicalQueryOptions, NormalizerStore } from "./store.js";

interface SeedAlias {
  aliasText: string;
  canonicalId: string;
  vendorId?: string | null;
}

interface MemoryStoreOptions {
  dimensions: number;
  canonicals?: Array<{ id?: string; canonicalName: string; defaultUnit: string; embedding?: number[] | null }>;
  aliases?: SeedAlias[];
}

export class MemoryNormalizerStore implements NormalizerStore {
  private readonly canonicals: CanonicalIngredient[];

  private readonly aliases: SeedAlias[];

  private readonly dimensions: number;

  constructor(options: MemoryStoreOptions) {
    this.dimensions = options.dimensions;
    this.canonicals = (options.canonicals ?? []).map((canonical) => ({
      id: canonical.id ?? randomUUID(),
      canonicalName: canonical.canonicalName,
      defaultUnit: canonical.defaultUnit,
      embedding:
        canonical.embedding === undefined
          ? hashedEmbedding(preprocessIngredient(canonical.canonicalName), this.dimensions)
          : canonical.embedding
    }));
    this.aliases = options.aliases ?? [];
  }

  async findAlias(preprocessedText: string, vendorId: string | null): Promise<AliasHit | null> {
    const alias =
      this.aliases.find((entry) => entry.aliasText === preprocessedText && entry.vendorId === vendorId) ??
      this.aliases.find((entry) => entry.aliasText === preprocessedText && !entry.vendorId);

    if (!alias) {
      return null;
    }

    const canonical = this.canonicals.find((entry) => entry.id === alias.canonicalId);
    if (!canonical) {
      return null;
    }

    return {
      canonicalId: canonical.id,
      canonicalName: canonical.canonicalName,
      defaultUnit: canonical.defaultUnit
    };
  }

  async searchCandidates(queryVector: number[], limit: number): Promise<CanonicalIngredient[]> {
    return [...this.canonicals]
      .filter((entry) => entry.embedding)
      .sort((left, right) => {
        const leftScore = similarity(left.embedding ?? [], queryVector);
        const rightScore = similarity(right.embedding ?? [], queryVector);
        return rightScore - leftScore;
      })
      .slice(0, limit);
  }

  async createPlaceholder(preprocessedText: string, queryVector: number[]): Promise<CanonicalIngredient> {
    const existing = this.canonicals.find(
      (entry) => preprocessIngredient(entry.canonicalName) === preprocessedText
    );
    if (existing) {
      return existing;
    }

    const created: CanonicalIngredient = {
      id: randomUUID(),
      canonicalName: toCanonicalPlaceholderName(preprocessedText),
      defaultUnit: "unit",
      embedding: queryVector
    };
    this.canonicals.push(created);
    return created;
  }

  async listCanonicals(options: CanonicalQueryOptions = {}): Promise<CanonicalIngredient[]> {
    return this.canonicals
      .filter((entry) => (options.onlyMissingEmbeddings ? !entry.embedding : true))
      .map((entry) => ({
        ...entry,
        embedding: entry.embedding ? [...entry.embedding] : null
      }));
  }

  async updateCanonicalEmbedding(canonicalId: string, embedding: number[]): Promise<void> {
    const canonical = this.canonicals.find((entry) => entry.id === canonicalId);
    if (!canonical) {
      throw new Error(`Canonical ingredient not found: ${canonicalId}`);
    }

    canonical.embedding = [...embedding];
  }
}

function similarity(left: number[], right: number[]): number {
  let sum = 0;
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    sum += (left[index] ?? 0) * (right[index] ?? 0);
  }
  return sum;
}
