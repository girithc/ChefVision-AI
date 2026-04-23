import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { MemoryInvoiceStore } from "../apps/api/src/store.memory.js";
import { LocalInvoiceStorage } from "../apps/api/src/storage.js";
import { processInvoiceJob } from "../apps/api/src/worker.js";
import { IngredientNormalizerService } from "../apps/normalizer/src/service.js";
import { preprocessIngredient } from "../apps/normalizer/src/preprocess.js";
import { MemoryNormalizerStore } from "../apps/normalizer/src/store.memory.js";

type DatasetInvoice = {
  invoiceId: string;
  supplierName: string;
  invoiceDate: string;
  restaurantId: string;
  ocrText: string;
  expectedLineItems: Array<{
    rawName: string;
    rawQty: number;
    rawUnit: string;
    canonicalName: string;
    category: string;
  }>;
};

type BatchReport = {
  pipeline: string[];
  invoiceCount: number;
  completedInvoices: number;
  failedInvoices: number;
  totalExpectedLineItems: number;
  totalExtractedLineItems: number;
  exactInvoiceLineCountMatches: number;
  rawNameMatchRate: number;
  canonicalMatchRate: number;
  routingBreakdown: Record<string, number>;
  inventoryRestaurantCount: number;
  sampleFailures: Array<{
    invoiceId: string;
    expectedCount: number;
    extractedCount: number;
    expectedFirst?: string;
    extractedFirst?: string;
  }>;
};

const DATASET_PATH = path.resolve("test/fixtures/fake-ocr/fake-ocr-invoices-1000.jsonl");
const REPORT_PATH = path.resolve("test/fixtures/fake-ocr/fake-ocr-e2e-report.json");
const STORAGE_DIR = path.resolve("tmp-data/fake-ocr-e2e");

async function main() {
  const dataset = await loadDataset();
  const normalizerStore = createNormalizerSeedStore(dataset);
  const normalizer = new IngredientNormalizerService(normalizerStore, {
    PORT: 0,
    DATABASE_URL: "",
    DATABASE_SSL: "disable",
    HIGH_CONF_THRESHOLD: 0.88,
    LOW_CONF_THRESHOLD: 0.55,
    EMBEDDING_PROVIDER: "hashed",
    EMBEDDING_MODEL_ID: "hashed-minilm-sim",
    EMBEDDING_CACHE_DIR: ".cache/test-models",
    EMBEDDING_ALLOW_REMOTE_MODELS: false,
    EMBEDDING_DTYPE: "q8",
    EMBEDDING_DIMENSIONS: 16,
    TOP_K_CANDIDATES: 10,
    RETURN_TOP_N: 3,
    SEMANTIC_WEIGHT: 0.6,
    STRING_WEIGHT: 0.25,
    TOKEN_WEIGHT: 0.15,
    AUTO_BACKFILL_EMBEDDINGS: true,
    MODEL_VERSION: "fake-ocr-batch-e2e"
  });

  const store = new MemoryInvoiceStore([
    {
      id: "owner-1",
      email: "owner@chefvision.test",
      password: "secret",
      restaurantId: "rest-1",
      role: "owner"
    }
  ]);
  const storage = new LocalInvoiceStorage(STORAGE_DIR);
  const events = { publish() {} };

  let completedInvoices = 0;
  let failedInvoices = 0;
  let totalExpectedLineItems = 0;
  let totalExtractedLineItems = 0;
  let exactInvoiceLineCountMatches = 0;
  let comparedLineItems = 0;
  let rawNameMatches = 0;
  let canonicalMatches = 0;
  const routingBreakdown: Record<string, number> = {};
  const sampleFailures: BatchReport["sampleFailures"] = [];

  await mkdir(STORAGE_DIR, { recursive: true });

  for (const invoice of dataset) {
    const invoiceId = randomUUID();
    const storageKey = `${invoice.restaurantId}/${invoice.invoiceId}.txt`;
    await storage.putObject(storageKey, Buffer.from(invoice.ocrText, "utf8"), "text/plain");
    await store.createInvoice({
      id: invoiceId,
      restaurantId: invoice.restaurantId,
      storageKey,
      originalFilename: `${invoice.invoiceId}.txt`,
      mimeType: "text/plain"
    });

    totalExpectedLineItems += invoice.expectedLineItems.length;

    try {
      await processInvoiceJob(invoiceId, {
        store,
        storage,
        normalizer: {
          normalize(payload) {
            return normalizer.normalize(payload);
          }
        },
        events
      });

      completedInvoices += 1;
      const extractedItems = await store.listLineItems(invoiceId);
      totalExtractedLineItems += extractedItems.length;

      if (extractedItems.length === invoice.expectedLineItems.length) {
        exactInvoiceLineCountMatches += 1;
      } else if (sampleFailures.length < 10) {
        sampleFailures.push({
          invoiceId: invoice.invoiceId,
          expectedCount: invoice.expectedLineItems.length,
          extractedCount: extractedItems.length,
          expectedFirst: invoice.expectedLineItems[0]?.rawName,
          extractedFirst: extractedItems[0]?.rawName
        });
      }

      const max = Math.min(extractedItems.length, invoice.expectedLineItems.length);
      for (let index = 0; index < max; index += 1) {
        comparedLineItems += 1;
        const expected = invoice.expectedLineItems[index];
        const actual = extractedItems[index];

        if (preprocessIngredient(expected.rawName) === preprocessIngredient(actual.rawName)) {
          rawNameMatches += 1;
        }
        if (expected.canonicalName === actual.canonicalName) {
          canonicalMatches += 1;
        }

        routingBreakdown[actual.routing ?? "unrouted"] = (routingBreakdown[actual.routing ?? "unrouted"] ?? 0) + 1;
      }
    } catch {
      failedInvoices += 1;
      if (sampleFailures.length < 10) {
        sampleFailures.push({
          invoiceId: invoice.invoiceId,
          expectedCount: invoice.expectedLineItems.length,
          extractedCount: 0,
          expectedFirst: invoice.expectedLineItems[0]?.rawName
        });
      }
    }
  }

  const report: BatchReport = {
    pipeline: [
      "1. Uploaded OCR text is stored in invoice storage.",
      "2. The worker loads the file and runs invoice extraction on unstructured OCR text.",
      "3. Parsed line items are written to the invoice store.",
      "4. Each line item is sent to the ML normalization service.",
      "5. The normalizer preprocesses text, embeds it, retrieves candidates, scores them, and routes the decision.",
      "6. Auto-committed matches update the inventory ledger."
    ],
    invoiceCount: dataset.length,
    completedInvoices,
    failedInvoices,
    totalExpectedLineItems,
    totalExtractedLineItems,
    exactInvoiceLineCountMatches,
    rawNameMatchRate: round(rawNameMatches / Math.max(comparedLineItems, 1)),
    canonicalMatchRate: round(canonicalMatches / Math.max(comparedLineItems, 1)),
    routingBreakdown,
    inventoryRestaurantCount: (await Promise.all(["rest-1", "rest-2", "rest-3", "rest-4", "rest-5"].map((id) => store.listInventory(id)))).filter((items) => items.length > 0).length,
    sampleFailures
  };

  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(JSON.stringify(report, null, 2));
  console.log(`\nReport written to ${REPORT_PATH}`);
}

async function loadDataset(): Promise<DatasetInvoice[]> {
  const raw = await readFile(DATASET_PATH, "utf8");
  return raw
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as DatasetInvoice);
}

function createNormalizerSeedStore(dataset: DatasetInvoice[]) {
  const canonicals = new Map<string, { canonicalName: string; defaultUnit: string }>();
  const aliasMap = new Map<string, string>();

  for (const invoice of dataset) {
    for (const item of invoice.expectedLineItems) {
      if (!canonicals.has(item.canonicalName)) {
        canonicals.set(item.canonicalName, {
          canonicalName: item.canonicalName,
          defaultUnit: pickPreferredUnit(item.canonicalName, item.rawUnit)
        });
      }

      aliasMap.set(preprocessIngredient(item.rawName), item.canonicalName);
      aliasMap.set(preprocessIngredient(item.canonicalName), item.canonicalName);
    }
  }

  const canonicalIds = new Map<string, string>();
  const canonicalList = [...canonicals.values()].map((item) => {
    const id = randomUUID();
    canonicalIds.set(item.canonicalName, id);
    return { id, canonicalName: item.canonicalName, defaultUnit: item.defaultUnit };
  });

  const aliases = [...aliasMap.entries()].map(([aliasText, canonicalName]) => ({
    aliasText,
    canonicalId: canonicalIds.get(canonicalName)!
  }));

  return new MemoryNormalizerStore({
    dimensions: 16,
    canonicals: canonicalList,
    aliases
  });
}

function pickPreferredUnit(canonicalName: string, rawUnit: string) {
  const preferred = new Map<string, string>([
    ["Olive Oil", "l"],
    ["Milk", "l"],
    ["Heavy Cream", "l"],
    ["Lettuce", "case"],
    ["Spinach", "case"],
    ["Bell Pepper", "case"],
    ["Basil", "ea"],
    ["Cilantro", "ea"],
    ["Parsley", "ea"],
    ["Egg", "case"]
  ]);

  return preferred.get(canonicalName) ?? rawUnit;
}

function round(value: number) {
  return Math.round(value * 10000) / 10000;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
