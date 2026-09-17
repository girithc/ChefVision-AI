export interface CanonicalIngredient {
  id: string;
  canonicalName: string;
  defaultUnit: string;
  embedding: number[] | null;
}

export interface AliasHit {
  canonicalId: string;
  canonicalName: string;
  defaultUnit: string;
}

export interface CanonicalQueryOptions {
  includeInactive?: boolean;
  onlyMissingEmbeddings?: boolean;
}

export interface NormalizerStore {
  findAlias(preprocessedText: string, vendorId: string | null): Promise<AliasHit | null>;
  searchCandidates(queryVector: number[], limit: number): Promise<CanonicalIngredient[]>;
  createPlaceholder(preprocessedText: string, queryVector: number[]): Promise<CanonicalIngredient>;
  listCanonicals(options?: CanonicalQueryOptions): Promise<CanonicalIngredient[]>;
  updateCanonicalEmbedding(canonicalId: string, embedding: number[]): Promise<void>;
}
