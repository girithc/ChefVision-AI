export type UserRole = "admin" | "owner";

export type InvoiceStatus = "pending" | "processing" | "done" | "error";

export type NormalizationRouting = "auto_commit" | "needs_review" | "new_ingredient";

export type NormalizationMethod = "alias" | "hybrid" | "new_ingredient";

export interface AuthTokenPayload {
  sub: string;
  restaurantId: string;
  role: UserRole;
}

export interface InvoiceLineItemInput {
  rawName: string;
  rawQty: number;
  rawUnit: string;
}

export interface ExtractedInvoice {
  supplierName: string;
  invoiceDate: string;
  lineItems: InvoiceLineItemInput[];
}

export interface ScoreBreakdown {
  semanticSimilarity: number;
  stringSimilarity: number;
  tokenOverlap: number;
  aliasExact: number;
  weightedScore: number;
}

export interface RetrievalMetadata {
  strategy: "alias" | "vector";
  rank: number;
  candidatePoolSize: number;
}

export interface CandidateMatch {
  canonicalId: string;
  canonicalName: string;
  confidence: number;
  method?: NormalizationMethod;
  normalizedCandidateText?: string;
  scoreBreakdown?: ScoreBreakdown;
  retrieval?: RetrievalMetadata;
  reasons?: string[];
}

export interface NormalizeRequest {
  lineItemId: string;
  vendorId: string | null;
  rawText: string;
  rawQty: number;
  rawUnit: string;
}

export interface NormalizeResponse {
  lineItemId: string;
  routing: NormalizationRouting;
  topMatch: CandidateMatch | null;
  candidates: CandidateMatch[];
  normalizedQty: number;
  normalizedUnit: string;
  method: NormalizationMethod;
  preprocessedText: string;
  modelVersion: string;
  thresholds: {
    autoCommit: number;
    review: number;
  };
  retrieval: {
    strategy: "alias" | "vector";
    candidatePoolSize: number;
    returnedCandidates: number;
    embeddingModel: string;
  };
  explanation: {
    summary: string;
    decisionReasons: string[];
  };
}

export interface InventoryRecord {
  canonicalId: string;
  canonicalName: string;
  onHandQty: number;
  unit: string;
}

export interface InvoiceEventPayload {
  invoiceId: string;
  status: InvoiceStatus;
  message: string;
  at: string;
}

export interface NormalizationEvaluationSample {
  id: string;
  rawText: string;
  vendorId: string | null;
  rawQty: number;
  rawUnit: string;
  expectedCanonicalName: string | null;
  description?: string;
}

export interface NormalizationEvaluationPrediction {
  sampleId: string;
  expectedCanonicalName: string | null;
  predictedCanonicalName: string | null;
  routing: NormalizationRouting;
  confidence: number | null;
  correct: boolean;
}

export interface NormalizationEvaluationMetrics {
  sampleCount: number;
  exactMatchAccuracy: number;
  precision: number;
  recall: number;
  f1: number;
  autoCommitRate: number;
  needsReviewRate: number;
  newIngredientRate: number;
  averageConfidence: number;
}

export interface NormalizationEvaluationReport {
  modelVersion: string;
  metrics: NormalizationEvaluationMetrics;
  predictions: NormalizationEvaluationPrediction[];
}

export const queueNames = {
  invoiceProcessing: "invoice-processing"
} as const;

export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

export function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
