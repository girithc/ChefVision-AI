import { mkdir } from "node:fs/promises";
import path from "node:path";

import { env, pipeline } from "@huggingface/transformers";

import { hashedEmbedding } from "../similarity.js";

export type EmbeddingProviderType = "hashed" | "minilm";

export type EmbeddingDtype = "fp32" | "fp16" | "q8" | "q4";

type FeatureExtractor = (
  input: string,
  options?: {
    pooling?: "mean";
    normalize?: boolean;
  }
) => Promise<{
  tolist(): unknown;
}>;

export interface EmbeddingProvider {
  readonly providerType: EmbeddingProviderType;
  readonly modelName: string;
  readonly dimensions: number;
  warmup(): Promise<void>;
  embed(text: string): Promise<number[]>;
}

export interface MiniLMEmbeddingProviderOptions {
  modelName: string;
  dimensions: number;
  cacheDir: string;
  allowRemoteModels: boolean;
  dtype: EmbeddingDtype;
}

export class HashedEmbeddingProvider implements EmbeddingProvider {
  readonly providerType = "hashed";

  readonly modelName: string;

  readonly dimensions: number;

  constructor(dimensions: number, modelName = "hashed-minilm-sim") {
    this.dimensions = dimensions;
    this.modelName = modelName;
  }

  async warmup(): Promise<void> {}

  async embed(text: string): Promise<number[]> {
    return hashedEmbedding(text, this.dimensions);
  }
}

export class MiniLMEmbeddingProvider implements EmbeddingProvider {
  readonly providerType = "minilm";

  readonly modelName: string;

  readonly dimensions: number;

  private extractorPromise: Promise<FeatureExtractor> | null = null;

  constructor(private readonly options: MiniLMEmbeddingProviderOptions) {
    this.modelName = options.modelName;
    this.dimensions = options.dimensions;
  }

  async warmup(): Promise<void> {
    await this.getExtractor();
  }

  async embed(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const tensor = await extractor(text, {
      pooling: "mean",
      normalize: true
    });

    const embedding = normalizeVector(extractVector(tensor.tolist()));
    if (embedding.length !== this.dimensions) {
      throw new Error(
        `Embedding dimension mismatch for ${this.modelName}: expected ${this.dimensions}, received ${embedding.length}`
      );
    }

    return embedding.map((value) => Number(value.toFixed(6)));
  }

  private async getExtractor(): Promise<FeatureExtractor> {
    if (!this.extractorPromise) {
      this.extractorPromise = this.createExtractor().catch((error) => {
        this.extractorPromise = null;
        throw error;
      });
    }

    return this.extractorPromise;
  }

  private async createExtractor(): Promise<FeatureExtractor> {
    const cacheDir = path.resolve(this.options.cacheDir);
    await mkdir(cacheDir, { recursive: true });

    env.cacheDir = cacheDir;
    env.allowRemoteModels = this.options.allowRemoteModels;

    const extractor = await pipeline("feature-extraction", this.modelName, {
      dtype: this.options.dtype
    });

    return extractor as unknown as FeatureExtractor;
  }
}

function extractVector(raw: unknown): number[] {
  if (!Array.isArray(raw)) {
    throw new Error("MiniLM embedding output was not an array");
  }

  if (!raw.length) {
    return [];
  }

  if (typeof raw[0] === "number") {
    return raw as number[];
  }

  if (Array.isArray(raw[0])) {
    return extractVector(raw[0]);
  }

  throw new Error("MiniLM embedding output format was not recognized");
}

function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
}
