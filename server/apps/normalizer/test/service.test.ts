import test from "node:test";
import assert from "node:assert/strict";

import { preprocessIngredient } from "../src/preprocess.js";
import { IngredientNormalizerService } from "../src/service.js";
import { MemoryNormalizerStore } from "../src/store.memory.js";

test("preprocess removes quantities and vendor noise", () => {
  assert.equal(preprocessIngredient("TOMATOES ROMA 25LB CASE"), "tomato roma");
});

test("normalizer uses alias exact match first", async () => {
  const store = new MemoryNormalizerStore({
    dimensions: 16,
    canonicals: [{ id: "canon-1", canonicalName: "Tomato", defaultUnit: "kg" }],
    aliases: [{ aliasText: "tomato roma", canonicalId: "canon-1" }]
  });

  const service = new IngredientNormalizerService(store, {
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
    MODEL_VERSION: "test-model"
  });

  const result = await service.normalize({
    lineItemId: "line-1",
    vendorId: null,
    rawText: "TOMATOES ROMA 25LB CASE",
    rawQty: 25,
    rawUnit: "lb"
  });

  assert.equal(result.routing, "auto_commit");
  assert.equal(result.topMatch?.canonicalName, "Tomato");
  assert.equal(result.normalizedUnit, "kg");
  assert.equal(result.modelVersion, "test-model");
  assert.equal(result.topMatch?.scoreBreakdown?.aliasExact, 1);
  assert.match(result.explanation.summary, /Preprocessed "tomato roma"/);
});

test("normalizer routes low confidence matches to new ingredient", async () => {
  const store = new MemoryNormalizerStore({
    dimensions: 16,
    canonicals: [{ canonicalName: "Chicken Breast", defaultUnit: "kg" }]
  });

  const service = new IngredientNormalizerService(store, {
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
    LOW_CONF_THRESHOLD: 0.8,
    TOP_K_CANDIDATES: 10,
    RETURN_TOP_N: 3,
    SEMANTIC_WEIGHT: 0.6,
    STRING_WEIGHT: 0.25,
    TOKEN_WEIGHT: 0.15,
    AUTO_BACKFILL_EMBEDDINGS: true,
    MODEL_VERSION: "test-model"
  });

  const result = await service.normalize({
    lineItemId: "line-2",
    vendorId: null,
    rawText: "mystery herb bundle",
    rawQty: 2,
    rawUnit: "unit"
  });

  assert.equal(result.routing, "new_ingredient");
  assert.equal(result.method, "new_ingredient");
  assert.equal(result.topMatch, null);
  assert.ok(result.explanation.decisionReasons.length > 0);
});

test("normalizer evaluation reports model metrics", async () => {
  const store = new MemoryNormalizerStore({
    dimensions: 16,
    canonicals: [
      { id: "canon-1", canonicalName: "Tomato", defaultUnit: "kg" },
      { id: "canon-2", canonicalName: "Olive Oil", defaultUnit: "l" }
    ],
    aliases: [
      { aliasText: "tomato roma", canonicalId: "canon-1" },
      { aliasText: "extra virgin olive oil", canonicalId: "canon-2" }
    ]
  });

  const service = new IngredientNormalizerService(store, {
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
    MODEL_VERSION: "eval-model"
  });

  const report = await service.evaluate([
    {
      id: "eval-1",
      rawText: "TOMATOES ROMA 25LB CASE",
      vendorId: null,
      rawQty: 25,
      rawUnit: "lb",
      expectedCanonicalName: "Tomato"
    },
    {
      id: "eval-2",
      rawText: "extra virgin olive oil",
      vendorId: null,
      rawQty: 1,
      rawUnit: "l",
      expectedCanonicalName: "Olive Oil"
    }
  ]);

  assert.equal(report.modelVersion, "eval-model");
  assert.equal(report.metrics.sampleCount, 2);
  assert.equal(report.metrics.exactMatchAccuracy, 1);
  assert.equal(report.predictions.length, 2);
});
