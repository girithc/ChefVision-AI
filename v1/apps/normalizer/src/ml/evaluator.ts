import type {
  NormalizationEvaluationMetrics,
  NormalizationEvaluationPrediction,
  NormalizationEvaluationReport,
  NormalizationEvaluationSample
} from "@chefvision/shared";
import { round } from "@chefvision/shared";

import type { IngredientNormalizerService } from "../service.js";

export class NormalizationEvaluator {
  constructor(private readonly service: IngredientNormalizerService) {}

  async evaluate(
    samples: NormalizationEvaluationSample[],
    modelVersion: string
  ): Promise<NormalizationEvaluationReport> {
    const predictions: NormalizationEvaluationPrediction[] = [];

    for (const sample of samples) {
      const result = await this.service.normalize({
        lineItemId: sample.id,
        vendorId: sample.vendorId,
        rawText: sample.rawText,
        rawQty: sample.rawQty,
        rawUnit: sample.rawUnit
      });

      const predictedCanonicalName = result.topMatch?.canonicalName ?? null;
      predictions.push({
        sampleId: sample.id,
        expectedCanonicalName: sample.expectedCanonicalName,
        predictedCanonicalName,
        routing: result.routing,
        confidence: result.topMatch?.confidence ?? null,
        correct: predictedCanonicalName === sample.expectedCanonicalName
      });
    }

    return {
      modelVersion,
      metrics: computeMetrics(predictions),
      predictions
    };
  }
}

function computeMetrics(predictions: NormalizationEvaluationPrediction[]): NormalizationEvaluationMetrics {
  const sampleCount = predictions.length;
  const correctCount = predictions.filter((item) => item.correct).length;
  const predictedPositive = predictions.filter((item) => item.predictedCanonicalName !== null).length;
  const actualPositive = predictions.filter((item) => item.expectedCanonicalName !== null).length;
  const truePositive = predictions.filter(
    (item) => item.predictedCanonicalName !== null && item.predictedCanonicalName === item.expectedCanonicalName
  ).length;
  const averageConfidence =
    predictions.reduce((sum, item) => sum + (item.confidence ?? 0), 0) / (sampleCount || 1);

  const precision = predictedPositive ? truePositive / predictedPositive : 1;
  const recall = actualPositive ? truePositive / actualPositive : 1;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    sampleCount,
    exactMatchAccuracy: round(correctCount / (sampleCount || 1), 4),
    precision: round(precision, 4),
    recall: round(recall, 4),
    f1: round(f1, 4),
    autoCommitRate: round(
      predictions.filter((item) => item.routing === "auto_commit").length / (sampleCount || 1),
      4
    ),
    needsReviewRate: round(
      predictions.filter((item) => item.routing === "needs_review").length / (sampleCount || 1),
      4
    ),
    newIngredientRate: round(
      predictions.filter((item) => item.routing === "new_ingredient").length / (sampleCount || 1),
      4
    ),
    averageConfidence: round(averageConfidence, 4)
  };
}
