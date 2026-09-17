import { Pool } from "pg";

import { normalizerConfig } from "../apps/normalizer/src/config.js";
import { createNormalizerMlRuntime } from "../apps/normalizer/src/ml/runtime.js";
import { PostgresNormalizerStore } from "../apps/normalizer/src/store.postgres.js";

async function main() {
  const pool = new Pool({
    connectionString: normalizerConfig.DATABASE_URL,
    ssl: normalizerConfig.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined
  });

  try {
    const store = new PostgresNormalizerStore(pool);
    const runtime = createNormalizerMlRuntime(store, normalizerConfig);
    const updated = await runtime.catalogIndexer.backfillMissingEmbeddings();

    console.log(
      `Backfilled ${updated} canonical embeddings using ${runtime.embeddingProvider.modelName} (${runtime.embeddingProvider.providerType}).`
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
