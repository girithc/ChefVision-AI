import test from "node:test";
import assert from "node:assert/strict";

import type { NormalizeRequest, NormalizeResponse } from "@chefvision/shared";

import { InvoiceEvents } from "../../src/events.js";
import { InlineInvoiceJobQueue } from "../../src/queue.js";
import { MemoryInvoiceStore } from "../../src/store.memory.js";
import { LocalInvoiceStorage } from "../../src/storage.js";
import { processInvoiceJob } from "../../src/worker.js";
import { IngredientNormalizerService } from "../../../../apps/normalizer/src/service.js";
import { MemoryNormalizerStore } from "../../../../apps/normalizer/src/store.memory.js";

test("async invoice pipeline stores, normalizes, and updates inventory", async () => {
  const normalizerStore = new MemoryNormalizerStore({
    dimensions: 16,
    canonicals: [{ id: "canon-1", canonicalName: "Tomato", defaultUnit: "kg" }],
    aliases: [{ aliasText: "tomato roma", canonicalId: "canon-1" }]
  });

  const normalizer = new LocalNormalizerClient(
    new IngredientNormalizerService(normalizerStore, {
      PORT: 0,
      DATABASE_URL: "",
      DATABASE_SSL: "disable",
      EMBEDDING_PROVIDER: "hashed",
      EMBEDDING_MODEL_ID: "hashed-minilm-sim",
      EMBEDDING_CACHE_DIR: ".cache/test-models",
      EMBEDDING_ALLOW_REMOTE_MODELS: false,
      EMBEDDING_DTYPE: "q8",
      EMBEDDING_DIMENSIONS: 16,
      HIGH_CONF_THRESHOLD: 0.88,
      LOW_CONF_THRESHOLD: 0.55,
      TOP_K_CANDIDATES: 10,
      RETURN_TOP_N: 3,
      SEMANTIC_WEIGHT: 0.6,
      STRING_WEIGHT: 0.25,
      TOKEN_WEIGHT: 0.15,
      AUTO_BACKFILL_EMBEDDINGS: true,
      MODEL_VERSION: "e2e-model"
    })
  );

  const store = new MemoryInvoiceStore([
    {
      id: "user-1",
      email: "owner@chefvision.test",
      password: "secret",
      restaurantId: "rest-1",
      role: "owner"
    }
  ]);

  const storage = new LocalInvoiceStorage("./tmp-data/e2e-uploads");
  const events = new InvoiceEvents();
  const queue = new InlineInvoiceJobQueue();

  const eventStatuses: string[] = [];
  const eventSink = {
    write(chunk: string) {
      const match = chunk.match(/"status":"([^"]+)"/);
      if (match) {
        eventStatuses.push(match[1]);
      }
    }
  };
  events.subscribe(eventSink as never);

  await queue.start((payload) =>
    processInvoiceJob(payload.invoiceId, {
      store,
      storage,
      normalizer,
      events
    })
  );

  const invoiceId = "44444444-4444-4444-4444-444444444444";
  const storageKey = "rest-1/invoices/test-invoice.json";

  await storage.putObject(
    storageKey,
    Buffer.from(
      JSON.stringify({
        supplierName: "Roma Farms",
        invoiceDate: "2026-04-22",
        lineItems: [{ rawName: "TOMATOES ROMA 25LB CASE", rawQty: 25, rawUnit: "lb" }]
      }),
      "utf8"
    ),
    "application/json"
  );

  await store.createInvoice({
    id: invoiceId,
    restaurantId: "rest-1",
    storageKey,
    originalFilename: "invoice.json",
    mimeType: "application/json"
  });

  await queue.enqueue({ invoiceId });

  await waitFor(async () => {
    const invoice = await store.getInvoiceById(invoiceId);
    assert.equal(invoice?.status, "done");
  });

  const lineItems = await store.listLineItems(invoiceId);
  assert.equal(lineItems.length, 1);
  assert.equal(lineItems[0].canonicalName, "Tomato");
  assert.equal(lineItems[0].routing, "auto_commit");

  const inventory = await store.listInventory("rest-1");
  assert.equal(inventory.length, 1);
  assert.equal(inventory[0].canonicalName, "Tomato");
  assert.equal(inventory[0].unit, "kg");

  assert.deepEqual(eventStatuses.filter(Boolean), ["processing", "done"]);
});

async function waitFor(check: () => Promise<void>, retries = 20): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      await check();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  throw lastError;
}

class LocalNormalizerClient {
  constructor(private readonly service: IngredientNormalizerService) {}

  async normalize(payload: NormalizeRequest): Promise<NormalizeResponse> {
    return this.service.normalize(payload);
  }
}
