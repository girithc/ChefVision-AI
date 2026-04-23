import { Pool } from "pg";

import { createApiApp } from "./app.js";
import { apiConfig } from "./config.js";
import { InvoiceEvents } from "./events.js";
import { HttpNormalizerClient } from "./normalizer-client.js";
import { BullMqInvoiceJobQueue } from "./queue.js";
import { PostgresInvoiceStore } from "./store.postgres.js";
import { LocalInvoiceStorage, S3InvoiceStorage } from "./storage.js";

const pool = new Pool({
  connectionString: apiConfig.DATABASE_URL,
  ssl: apiConfig.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined
});

const app = createApiApp({
  config: apiConfig,
  pool,
  store: new PostgresInvoiceStore(pool),
  storage:
    apiConfig.STORAGE_MODE === "s3"
      ? new S3InvoiceStorage(apiConfig)
      : new LocalInvoiceStorage(apiConfig.LOCAL_UPLOAD_DIR),
  queue: new BullMqInvoiceJobQueue(apiConfig.REDIS_URL),
  normalizer: new HttpNormalizerClient(apiConfig.NORMALIZER_URL),
  events: new InvoiceEvents()
});

app.listen(apiConfig.PORT, () => {
  console.log(`API listening on port ${apiConfig.PORT}`);
});
