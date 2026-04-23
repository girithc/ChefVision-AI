import type {
  CandidateMatch,
  NormalizeRequest,
  NormalizeResponse,
  NormalizationEvaluationReport,
  NormalizationEvaluationSample
} from "@chefvision/shared";

import type { NormalizerConfig } from "./config.js";
import { defaultEvaluationDataset } from "./ml/evaluation-dataset.js";
import { NormalizationEvaluator } from "./ml/evaluator.js";
import { createNormalizerMlRuntime } from "./ml/runtime.js";
import { preprocessIngredient } from "./preprocess.js";
import type { CanonicalIngredient, NormalizerStore } from "./store.js";
import { normalizeQuantity } from "./unit-conversion.js";

export class IngredientNormalizerService {
  private readonly runtime;

  private readonly evaluator: NormalizationEvaluator;

  private warmupPromise: Promise<void> | null = null;

  constructor(private readonly store: NormalizerStore, private readonly config: NormalizerConfig) {
    this.runtime = createNormalizerMlRuntime(store, config);
    this.evaluator = new NormalizationEvaluator(this);
  }

  async warmup(): Promise<void> {
    if (!this.warmupPromise) {
      this.warmupPromise = this.runWarmup().catch((error) => {
        this.warmupPromise = null;
        throw error;
      });
    }

    await this.warmupPromise;
  }

  async normalize(request: NormalizeRequest): Promise<NormalizeResponse> {
    const preprocessedText = preprocessIngredient(request.rawText);
    const aliasHit = await this.store.findAlias(preprocessedText, request.vendorId);
    if (aliasHit) {
      const normalized = normalizeQuantity(request.rawQty, request.rawUnit, aliasHit.defaultUnit);
      const topMatch: CandidateMatch = {
        canonicalId: aliasHit.canonicalId,
        canonicalName: aliasHit.canonicalName,
        confidence: 1,
        method: "alias",
        normalizedCandidateText: preprocessedText,
        scoreBreakdown: {
          semanticSimilarity: 1,
          stringSimilarity: 1,
          tokenOverlap: 1,
          aliasExact: 1,
          weightedScore: 1
        },
        retrieval: {
          strategy: "alias",
          rank: 1,
          candidatePoolSize: 1
        },
        reasons: ["exact alias match found in the learned ingredient alias table"]
      };

      return {
        lineItemId: request.lineItemId,
        routing: "auto_commit",
        topMatch,
        candidates: [topMatch],
        normalizedQty: normalized.qty,
        normalizedUnit: normalized.unit,
        method: "alias",
        preprocessedText,
        modelVersion: this.config.MODEL_VERSION,
        thresholds: {
          autoCommit: this.config.HIGH_CONF_THRESHOLD,
          review: this.config.LOW_CONF_THRESHOLD
        },
        retrieval: {
          strategy: "alias",
          candidatePoolSize: 1,
          returnedCandidates: 1,
          embeddingModel: this.runtime.embeddingProvider.modelName
        },
        explanation: this.runtime.explanationBuilder.buildSummary({
          routing: "auto_commit",
          preprocessedText,
          topMatch,
          decisionReasons: [
            "an exact alias was found before running hybrid scoring",
            "exact matches are auto-committed to keep the pipeline fast and deterministic"
          ]
        })
      };
    }

    await this.runtime.catalogIndexer.ensureEmbeddings();

    const queryVector = await this.runtime.embeddingProvider.embed(preprocessedText);
    const retrieved = await this.runtime.candidateRetriever.retrieve(queryVector, this.config.TOP_K_CANDIDATES);
    const ranked = retrieved
      .map((candidate, index) =>
        this.runtime.scoringModel.score(
          candidate,
          this.runtime.featureExtractor.extract(preprocessedText, queryVector, candidate),
          index + 1,
          retrieved.length
        )
      )
      .sort((left, right) => right.confidence - left.confidence)
      .slice(0, this.config.RETURN_TOP_N);

    const topMatch = ranked[0] ?? null;
    const { routing, reasons } = this.runtime.confidenceRouter.route(topMatch?.confidence ?? null);

    if (routing === "new_ingredient") {
      const placeholder = await this.store.createPlaceholder(preprocessedText, queryVector);
      const normalized = normalizeQuantity(request.rawQty, request.rawUnit, placeholder.defaultUnit);
      return {
        lineItemId: request.lineItemId,
        routing,
        topMatch: null,
        candidates: ranked,
        normalizedQty: normalized.qty,
        normalizedUnit: normalized.unit,
        method: "new_ingredient",
        preprocessedText,
        modelVersion: this.config.MODEL_VERSION,
        thresholds: {
          autoCommit: this.config.HIGH_CONF_THRESHOLD,
          review: this.config.LOW_CONF_THRESHOLD
        },
        retrieval: {
          strategy: "vector",
          candidatePoolSize: retrieved.length,
          returnedCandidates: ranked.length,
          embeddingModel: this.runtime.embeddingProvider.modelName
        },
        explanation: this.runtime.explanationBuilder.buildSummary({
          routing,
          preprocessedText,
          topMatch,
          decisionReasons: [
            ...reasons,
            `placeholder created as "${placeholder.canonicalName}" for later admin review`
          ]
        })
      };
    }

    const matchedCanonical = findCanonicalById(retrieved, topMatch?.canonicalId ?? null);
    const normalized = normalizeQuantity(
      request.rawQty,
      request.rawUnit,
      matchedCanonical?.defaultUnit ?? request.rawUnit
    );

    return {
      lineItemId: request.lineItemId,
      routing,
      topMatch,
      candidates: ranked,
      normalizedQty: normalized.qty,
      normalizedUnit: normalized.unit,
      method: "hybrid",
      preprocessedText,
      modelVersion: this.config.MODEL_VERSION,
      thresholds: {
        autoCommit: this.config.HIGH_CONF_THRESHOLD,
        review: this.config.LOW_CONF_THRESHOLD
      },
      retrieval: {
        strategy: "vector",
        candidatePoolSize: retrieved.length,
        returnedCandidates: ranked.length,
        embeddingModel: this.runtime.embeddingProvider.modelName
      },
      explanation: this.runtime.explanationBuilder.buildSummary({
        routing,
        preprocessedText,
        topMatch,
        decisionReasons: reasons.concat(topMatch?.reasons ?? [])
      })
    };
  }

  async evaluate(samples: NormalizationEvaluationSample[] = defaultEvaluationDataset): Promise<NormalizationEvaluationReport> {
    return this.evaluator.evaluate(samples, this.config.MODEL_VERSION);
  }

  getModelMetadata() {
    return {
      modelVersion: this.config.MODEL_VERSION,
      embeddingProvider: this.runtime.embeddingProvider.providerType,
      embeddingModel: this.runtime.embeddingProvider.modelName,
      embeddingDimensions: this.runtime.embeddingProvider.dimensions,
      retrievalTopK: this.config.TOP_K_CANDIDATES,
      returnedCandidates: this.config.RETURN_TOP_N,
      pgvectorBackfillEnabled: this.config.AUTO_BACKFILL_EMBEDDINGS,
      thresholds: {
        autoCommit: this.config.HIGH_CONF_THRESHOLD,
        review: this.config.LOW_CONF_THRESHOLD
      },
      weights: {
        semantic: this.config.SEMANTIC_WEIGHT,
        string: this.config.STRING_WEIGHT,
        token: this.config.TOKEN_WEIGHT
      }
    };
  }

  private async runWarmup(): Promise<void> {
    await this.runtime.embeddingProvider.warmup();
    await this.runtime.catalogIndexer.ensureEmbeddings();
  }
}

function findCanonicalById(candidates: CanonicalIngredient[], canonicalId: string | null): CanonicalIngredient | null {
  if (!canonicalId) {
    return null;
  }
  return candidates.find((candidate) => candidate.id === canonicalId) ?? null;
}
