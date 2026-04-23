import test from "node:test";
import assert from "node:assert/strict";

import { CatalogEmbeddingIndexer } from "../src/ml/catalog-indexer.js";
import { HashedEmbeddingProvider } from "../src/ml/embedding-provider.js";
import { MemoryNormalizerStore } from "../src/store.memory.js";

test("catalog indexer backfills missing canonical embeddings", async () => {
  const store = new MemoryNormalizerStore({
    dimensions: 16,
    canonicals: [
      {
        id: "canon-1",
        canonicalName: "Tomato",
        defaultUnit: "kg",
        embedding: null
      }
    ]
  });

  const indexer = new CatalogEmbeddingIndexer(store, new HashedEmbeddingProvider(16), true);
  const updated = await indexer.backfillMissingEmbeddings();
  const canonicals = await store.listCanonicals({ includeInactive: true });

  assert.equal(updated, 1);
  assert.equal(canonicals.length, 1);
  assert.equal(canonicals[0].embedding?.length, 16);
});
