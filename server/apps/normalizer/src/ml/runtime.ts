import type { NormalizerConfig } from "../config.js";
import type { NormalizerStore } from "../store.js";
import { CatalogEmbeddingIndexer } from "./catalog-indexer.js";
import { StoreCandidateRetriever } from "./candidate-retriever.js";
import { ConfidenceRouter } from "./confidence-router.js";
import { HashedEmbeddingProvider, MiniLMEmbeddingProvider } from "./embedding-provider.js";
import { ExplanationBuilder } from "./explanation-builder.js";
import { CandidateFeatureExtractor } from "./feature-extractor.js";
import { WeightedHybridScoringModel } from "./scoring-model.js";

export function createNormalizerMlRuntime(store: NormalizerStore, config: NormalizerConfig) {
  const embeddingProvider =
    config.EMBEDDING_PROVIDER === "minilm"
      ? new MiniLMEmbeddingProvider({
          modelName: config.EMBEDDING_MODEL_ID,
          dimensions: config.EMBEDDING_DIMENSIONS,
          cacheDir: config.EMBEDDING_CACHE_DIR,
          allowRemoteModels: config.EMBEDDING_ALLOW_REMOTE_MODELS,
          dtype: config.EMBEDDING_DTYPE
        })
      : new HashedEmbeddingProvider(config.EMBEDDING_DIMENSIONS, config.EMBEDDING_MODEL_ID);

  return {
    embeddingProvider,
    candidateRetriever: new StoreCandidateRetriever(store),
    featureExtractor: new CandidateFeatureExtractor(),
    scoringModel: new WeightedHybridScoringModel({
      semanticWeight: config.SEMANTIC_WEIGHT,
      stringWeight: config.STRING_WEIGHT,
      tokenWeight: config.TOKEN_WEIGHT
    }),
    confidenceRouter: new ConfidenceRouter({
      high: config.HIGH_CONF_THRESHOLD,
      low: config.LOW_CONF_THRESHOLD
    }),
    explanationBuilder: new ExplanationBuilder(),
    catalogIndexer: new CatalogEmbeddingIndexer(store, embeddingProvider, config.AUTO_BACKFILL_EMBEDDINGS)
  };
}
