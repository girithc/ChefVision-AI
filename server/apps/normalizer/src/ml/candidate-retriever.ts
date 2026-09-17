import type { CanonicalIngredient, NormalizerStore } from "../store.js";

export interface CandidateRetriever {
  retrieve(queryVector: number[], limit: number): Promise<CanonicalIngredient[]>;
}

export class StoreCandidateRetriever implements CandidateRetriever {
  constructor(private readonly store: NormalizerStore) {}

  async retrieve(queryVector: number[], limit: number): Promise<CanonicalIngredient[]> {
    return this.store.searchCandidates(queryVector, limit);
  }
}
