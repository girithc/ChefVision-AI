import { Pool } from "pg";

import { normalizerConfig } from "./config.js";
import { createNormalizerApp } from "./app.js";
import { IngredientNormalizerService } from "./service.js";
import { PostgresNormalizerStore } from "./store.postgres.js";

const pool = new Pool({
  connectionString: normalizerConfig.DATABASE_URL,
  ssl: normalizerConfig.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined
});
const store = new PostgresNormalizerStore(pool);
const service = new IngredientNormalizerService(store, normalizerConfig);

await service.warmup();

const app = createNormalizerApp(service);

app.listen(normalizerConfig.PORT, () => {
  console.log(`Normalizer listening on port ${normalizerConfig.PORT}`);
});
