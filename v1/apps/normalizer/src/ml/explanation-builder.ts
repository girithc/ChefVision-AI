import type { CandidateMatch, NormalizeResponse, NormalizationRouting } from "@chefvision/shared";

export class ExplanationBuilder {
  buildSummary(input: {
    routing: NormalizationRouting;
    preprocessedText: string;
    topMatch: CandidateMatch | null;
    decisionReasons: string[];
  }): NormalizeResponse["explanation"] {
    const topMatchText = input.topMatch
      ? `Top match "${input.topMatch.canonicalName}" scored ${input.topMatch.confidence.toFixed(2)}.`
      : "No reliable canonical match was found.";

    return {
      summary: `Preprocessed "${input.preprocessedText}". ${topMatchText}`,
      decisionReasons: input.decisionReasons
    };
  }
}
