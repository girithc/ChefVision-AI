import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("postgres://postgres:postgres@localhost:5432/chefvision"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  NORMALIZER_URL: z.string().default("http://localhost:4001"),
  DATABASE_SSL: z.enum(["disable", "require"]).default("disable"),
  STORAGE_MODE: z.enum(["local", "db"]).default("db"),
  LOCAL_UPLOAD_DIR: z.string().default("./uploads"),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024)
});

export type ApiConfig = z.infer<typeof schema>;

export const apiConfig: ApiConfig = schema.parse(process.env);
