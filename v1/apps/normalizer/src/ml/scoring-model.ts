import type { CandidateMatch, ScoreBreakdown } from "@chefvision/shared";
import { round } from "@chefvision/shared";

import type { CanonicalIngredient } from "../store.js";
import type { CandidateFeatures } from "./feature-extractor.js";

export interface WeightedScoringConfig {
  semanticWeight: number;
  stringWeight: number;
  tokenWeight: number;
}

export class WeightedHybridScoringModel {
  constructor(private readonly config: WeightedScoringConfig) {}

  score(
    candidate: CanonicalIngredient,
    features: CandidateFeatures,
    rank: number,
    candidatePoolSize: number
  ): CandidateMatch {
    const weightedScore = round(
      features.semanticSimilarity * this.config.semanticWeight +
        features.stringSimilarity * this.config.stringWeight +
        features.tokenOverlap * this.config.tokenWeight,
      4
    );

    const scoreBreakdown: ScoreBreakdown = {
      semanticSimilarity: round(features.semanticSimilarity, 4),
      stringSimilarity: round(features.stringSimilarity, 4),
      tokenOverlap: round(features.tokenOverlap, 4),
      aliasExact: 0,
      weightedScore
    };

    return {
      canonicalId: candidate.id,
      canonicalName: candidate.canonicalName,
      confidence: weightedScore,
      method: "hybrid",
      normalizedCandidateText: features.normalizedCandidateText,
      scoreBreakdown,
      retrieval: {
        strategy: "vector",
        rank,
        candidatePoolSize
      },
      reasons: buildReasons(scoreBreakdown)
    };
  }
}

function buildReasons(scoreBreakdown: ScoreBreakdown): string[] {
  const reasons: string[] = [];
  if (scoreBreakdown.semanticSimilarity >= 0.8) {
    reasons.push("strong semantic similarity to the canonical ingredient");
  }
  if (scoreBreakdown.stringSimilarity >= 0.8) {
    reasons.push("high character-level similarity");
  }
  if (scoreBreakdown.tokenOverlap >= 0.5) {
    reasons.push("meaningful token overlap after preprocessing");
  }
  if (!reasons.length) {
    reasons.push("best available candidate from vector retrieval");
  }
  return reasons;
}
