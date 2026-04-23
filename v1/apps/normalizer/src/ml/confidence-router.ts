import type { NormalizationRouting } from "@chefvision/shared";

export class ConfidenceRouter {
  constructor(
    private readonly thresholds: {
      high: number;
      low: number;
    }
  ) {}

  route(confidence: number | null): { routing: NormalizationRouting; reasons: string[] } {
    if (confidence === null || confidence < this.thresholds.low) {
      return {
        routing: "new_ingredient",
        reasons: [
          `top confidence is below the review threshold of ${this.thresholds.low.toFixed(2)}`,
          "creating a placeholder avoids silently merging a likely-incorrect ingredient"
        ]
      };
    }

    if (confidence >= this.thresholds.high) {
      return {
        routing: "auto_commit",
        reasons: [
          `top confidence clears the auto-commit threshold of ${this.thresholds.high.toFixed(2)}`,
          "the match is strong enough to update inventory automatically"
        ]
      };
    }

    return {
      routing: "needs_review",
      reasons: [
        `top confidence falls between ${this.thresholds.low.toFixed(2)} and ${this.thresholds.high.toFixed(2)}`,
        "the result should be shown to a user with top candidates for confirmation"
      ]
    };
  }
}
