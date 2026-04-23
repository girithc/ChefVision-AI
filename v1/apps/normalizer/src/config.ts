import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const booleanFromEnv = (defaultValue: boolean) =>
  z.string().optional().transform((value, context) => {
    if (value === undefined) {
      return defaultValue;
    }

    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Expected a boolean-like value but received "${value}"`
    });
    return z.NEVER;
  });

const schema = z.object({
  PORT: z.coerce.number().default(4001),
  DATABASE_URL: z.string().default("postgres://postgres:postgres@localhost:5432/chefvision"),
  DATABASE_SSL: z.enum(["disable", "require"]).default("disable"),
  HIGH_CONF_THRESHOLD: z.coerce.number().default(0.88),
  LOW_CONF_THRESHOLD: z.coerce.number().default(0.55),
  EMBEDDING_PROVIDER: z.enum(["hashed", "minilm"]).default("minilm"),
  EMBEDDING_MODEL_ID: z.string().default("onnx-community/all-MiniLM-L6-v2-ONNX"),
  EMBEDDING_CACHE_DIR: z.string().default(".cache/chefvision/models"),
  EMBEDDING_ALLOW_REMOTE_MODELS: booleanFromEnv(true),
  EMBEDDING_DTYPE: z.enum(["fp32", "fp16", "q8", "q4"]).default("fp32"),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(384),
  TOP_K_CANDIDATES: z.coerce.number().default(10),
  RETURN_TOP_N: z.coerce.number().default(3),
  SEMANTIC_WEIGHT: z.coerce.number().default(0.6),
  STRING_WEIGHT: z.coerce.number().default(0.25),
  TOKEN_WEIGHT: z.coerce.number().default(0.15),
  AUTO_BACKFILL_EMBEDDINGS: booleanFromEnv(true),
  MODEL_VERSION: z.string().default("chefvision-normalizer-v3-minilm")
});

export type NormalizerConfig = z.infer<typeof schema>;

export const normalizerConfig: NormalizerConfig = schema.parse(process.env);
