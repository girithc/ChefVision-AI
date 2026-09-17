import { preprocessIngredient } from "../preprocess.js";
import type { NormalizerStore } from "../store.js";
import type { EmbeddingProvider } from "./embedding-provider.js";

export class CatalogEmbeddingIndexer {
  private ensurePromise: Promise<number> | null = null;

  constructor(
    private readonly store: NormalizerStore,
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly enabled: boolean
  ) {}

  async ensureEmbeddings(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    await this.backfillMissingEmbeddings();
  }

  async backfillMissingEmbeddings(): Promise<number> {
    if (!this.enabled) {
      return 0;
    }

    if (!this.ensurePromise) {
      this.ensurePromise = this.executeBackfill().finally(() => {
        this.ensurePromise = null;
      });
    }

    return this.ensurePromise;
  }

  private async executeBackfill(): Promise<number> {
    const missingCanonicals = await this.store.listCanonicals({
      includeInactive: true,
      onlyMissingEmbeddings: true
    });

    if (!missingCanonicals.length) {
      return 0;
    }

    await this.embeddingProvider.warmup();

    for (const canonical of missingCanonicals) {
      const embedding = await this.embeddingProvider.embed(preprocessIngredient(canonical.canonicalName));
      await this.store.updateCanonicalEmbedding(canonical.id, embedding);
    }

    return missingCanonicals.length;
  }
}
