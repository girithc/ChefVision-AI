import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("postgres://postgres:postgres@localhost:5432/chefvision"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().default("chefvision-dev-secret"),
  NORMALIZER_URL: z.string().default("http://localhost:4001"),
  DATABASE_SSL: z.enum(["disable", "require"]).default("disable"),
  STORAGE_MODE: z.enum(["local", "s3"]).default("local"),
  LOCAL_UPLOAD_DIR: z.string().default("./uploads"),
  S3_BUCKET: z.string().default("chefvision-invoices"),
  AWS_REGION: z.string().default("us-east-1"),
  S3_ENDPOINT: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional()
});

export type ApiConfig = z.infer<typeof schema>;

export const apiConfig: ApiConfig = schema.parse(process.env);
