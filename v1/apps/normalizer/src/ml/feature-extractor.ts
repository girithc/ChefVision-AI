import { cosineSimilarity, jaccardSimilarity, jaroWinkler } from "../similarity.js";
import { preprocessIngredient } from "../preprocess.js";
import type { CanonicalIngredient } from "../store.js";

export interface CandidateFeatures {
  normalizedCandidateText: string;
  semanticSimilarity: number;
  stringSimilarity: number;
  tokenOverlap: number;
}

export class CandidateFeatureExtractor {
  extract(queryText: string, queryVector: number[], candidate: CanonicalIngredient): CandidateFeatures {
    const normalizedCandidateText = preprocessIngredient(candidate.canonicalName);
    return {
      normalizedCandidateText,
      semanticSimilarity: cosineSimilarity(queryVector, candidate.embedding ?? []),
      stringSimilarity: jaroWinkler(queryText, normalizedCandidateText),
      tokenOverlap: jaccardSimilarity(queryText, normalizedCandidateText)
    };
  }
}
