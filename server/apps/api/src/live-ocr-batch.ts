import { randomUUID } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { Pool } from "pg";

import type { InvoiceJobQueue } from "./queue.js";
import type { InvoiceStore } from "./store.js";
import type { InvoiceStorage } from "./storage.js";

export type DatasetInvoice = {
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

type ApiInvoice = {
  id: string;
  status: string;
  errorMessage: string | null;
  lineItems: Array<{
    rawName: string;
    canonicalName: string | null;
    routing: string | null;
  }>;
};

export type LiveBatchReport = {
  stack: {
    datasetPath: string;
    reportPath: string;
    mode: "internal-api-worker";
  };
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
  sampleFailures: Array<{
    invoiceId: string;
    status: string;
    errorMessage: string | null;
    expectedCount: number;
    extractedCount: number;
    expectedFirst?: string;
    extractedFirst?: string;
  }>;
};

export type LiveBatchState = "idle" | "running" | "completed" | "failed";

export type LiveBatchStatus = {
  state: LiveBatchState;
  stage: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  totalInvoices: number;
  processedInvoices: number;
  completedInvoices: number;
  failedInvoices: number;
  currentInvoiceId: string | null;
  currentDatasetInvoiceId: string | null;
  datasetPath: string;
  reportPath: string;
  limit: number;
  logs: string[];
};

export const LIVE_OCR_DATASET_PATH = path.resolve("test/fixtures/fake-ocr/fake-ocr-invoices-1000.jsonl");
export const LIVE_OCR_REPORT_PATH = path.resolve("test/fixtures/fake-ocr/fake-ocr-live-api-report.json");

export class LiveOcrBatchManager {
  private status: LiveBatchStatus = {
    state: "idle",
    stage: "idle",
    startedAt: null,
    finishedAt: null,
    errorMessage: null,
    totalInvoices: 0,
    processedInvoices: 0,
    completedInvoices: 0,
    failedInvoices: 0,
    currentInvoiceId: null,
    currentDatasetInvoiceId: null,
    datasetPath: LIVE_OCR_DATASET_PATH,
    reportPath: LIVE_OCR_REPORT_PATH,
    limit: 1000,
    logs: []
  };

  private latestReport: LiveBatchReport | null = null;

  constructor(
    private readonly dependencies: {
      pool: Pool;
      store: InvoiceStore;
      storage: InvoiceStorage;
      queue: InvoiceJobQueue;
    }
  ) {}

  getStatus(): LiveBatchStatus {
    return {
      ...this.status,
      logs: [...this.status.logs]
    };
  }

  async getLatestReport(): Promise<LiveBatchReport | null> {
    if (this.latestReport) {
      return this.latestReport;
    }

    try {
      const raw = await readFile(LIVE_OCR_REPORT_PATH, "utf8");
      this.latestReport = JSON.parse(raw) as LiveBatchReport;
      return this.latestReport;
    } catch {
      return null;
    }
  }

  async start(input: { restaurantId: string; limit?: number }): Promise<LiveBatchStatus> {
    if (this.status.state === "running") {
      throw new Error("A live OCR batch run is already in progress.");
    }

    const limit = clampLimit(input.limit ?? 1000);
    this.status = {
      ...this.status,
      state: "running",
      stage: "initializing",
      startedAt: new Date().toISOString(),
      finishedAt: null,
      errorMessage: null,
      totalInvoices: 0,
      processedInvoices: 0,
      completedInvoices: 0,
      failedInvoices: 0,
      currentInvoiceId: null,
      currentDatasetInvoiceId: null,
      limit,
      logs: []
    };

    this.pushLog(`Starting live OCR batch for up to ${limit} invoices.`);
    void this.run(input.restaurantId, limit);

    return this.getStatus();
  }

  private async run(restaurantId: string, limit: number) {
    try {
      this.latestReport = null;
      await rm(LIVE_OCR_REPORT_PATH, { force: true });

      this.updateStage("loading_dataset", "Loading OCR dataset from disk.");
      const dataset = (await loadDataset()).slice(0, limit);
      this.status.totalInvoices = dataset.length;

      this.updateStage("resetting_demo_data", "Clearing previous demo invoices and inventory for this restaurant.");
      await cleanupDemoData(this.dependencies.pool, restaurantId);

      this.updateStage("seeding_catalog", "Seeding canonical ingredients and aliases into PostgreSQL.");
      await seedCatalogFromDataset(this.dependencies.pool, dataset);

      this.updateStage("processing_invoices", "Uploading OCR invoices into storage and waiting for async processing.");

      let completedInvoices = 0;
      let failedInvoices = 0;
      let totalExpectedLineItems = 0;
      let totalExtractedLineItems = 0;
      let exactInvoiceLineCountMatches = 0;
      let comparedLineItems = 0;
      let rawNameMatches = 0;
      let canonicalMatches = 0;
      const routingBreakdown: Record<string, number> = {};
      const sampleFailures: LiveBatchReport["sampleFailures"] = [];

      for (const [index, datasetInvoice] of dataset.entries()) {
        totalExpectedLineItems += datasetInvoice.expectedLineItems.length;
        this.status.currentDatasetInvoiceId = datasetInvoice.invoiceId;
        this.pushLog(`Processing ${datasetInvoice.invoiceId} (${index + 1}/${dataset.length}).`);

        const liveInvoiceId = await this.enqueueDatasetInvoice(restaurantId, datasetInvoice);
        this.status.currentInvoiceId = liveInvoiceId;
        const invoice = await waitForInvoice(this.dependencies.store, liveInvoiceId);
        const actualItems = [...invoice.lineItems].sort((left, right) => left.rawName.localeCompare(right.rawName));
        const expectedItems = [...datasetInvoice.expectedLineItems].sort((left, right) =>
          left.rawName.localeCompare(right.rawName)
        );

        totalExtractedLineItems += actualItems.length;
        this.status.processedInvoices += 1;

        if (invoice.status === "done") {
          completedInvoices += 1;
        } else {
          failedInvoices += 1;
        }

        this.status.completedInvoices = completedInvoices;
        this.status.failedInvoices = failedInvoices;

        if (actualItems.length === expectedItems.length) {
          exactInvoiceLineCountMatches += 1;
        }

        const max = Math.min(actualItems.length, expectedItems.length);
        for (let itemIndex = 0; itemIndex < max; itemIndex += 1) {
          comparedLineItems += 1;
          const actual = actualItems[itemIndex];
          const expected = expectedItems[itemIndex];

          if (preprocessForComparison(actual.rawName) === preprocessForComparison(expected.rawName)) {
            rawNameMatches += 1;
          }
          if (actual.canonicalName === expected.canonicalName) {
            canonicalMatches += 1;
          }

          const routing = actual.routing ?? "unrouted";
          routingBreakdown[routing] = (routingBreakdown[routing] ?? 0) + 1;
        }

        if (invoice.status !== "done" || actualItems.length !== expectedItems.length) {
          if (sampleFailures.length < 15) {
            sampleFailures.push({
              invoiceId: datasetInvoice.invoiceId,
              status: invoice.status,
              errorMessage: invoice.errorMessage,
              expectedCount: expectedItems.length,
              extractedCount: actualItems.length,
              expectedFirst: expectedItems[0]?.rawName,
              extractedFirst: actualItems[0]?.rawName
            });
          }
        }
      }

      const report: LiveBatchReport = {
        stack: {
          datasetPath: LIVE_OCR_DATASET_PATH,
          reportPath: LIVE_OCR_REPORT_PATH,
          mode: "internal-api-worker"
        },
        pipeline: [
          "1. Seed the live PostgreSQL canonical ingredient catalog and alias table from the fake OCR dataset.",
          "2. Store each OCR text invoice in the configured invoice storage.",
          "3. Create invoice rows and enqueue async processing jobs in the API worker pipeline.",
          "4. The worker extracts line items and calls the MiniLM normalizer service over HTTP.",
          "5. The normalizer backfills missing catalog embeddings, retrieves pgvector candidates, reranks them, and routes the decision.",
          "6. The API stores normalized matches and updates the live inventory ledger for auto-committed items."
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
        sampleFailures
      };

      await writeFile(LIVE_OCR_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
      this.latestReport = report;
      this.status.state = "completed";
      this.status.stage = "completed";
      this.status.finishedAt = new Date().toISOString();
      this.status.errorMessage = null;
      this.status.currentInvoiceId = null;
      this.status.currentDatasetInvoiceId = null;
      this.pushLog(`Completed live OCR batch: ${completedInvoices}/${dataset.length} invoices done.`);
    } catch (error) {
      this.status.state = "failed";
      this.status.stage = "failed";
      this.status.finishedAt = new Date().toISOString();
      this.status.errorMessage = error instanceof Error ? error.message : "Unknown batch error";
      this.pushLog(`Batch failed: ${this.status.errorMessage}`);
    }
  }

  private async enqueueDatasetInvoice(restaurantId: string, invoice: DatasetInvoice): Promise<string> {
    const liveInvoiceId = randomUUID();
    const storageKey = `${restaurantId}/datasets/live-ocr/${liveInvoiceId}-${invoice.invoiceId}.txt`;
    await this.dependencies.storage.putObject(storageKey, Buffer.from(invoice.ocrText, "utf8"), "text/plain");
    await this.dependencies.store.createInvoice({
      id: liveInvoiceId,
      restaurantId,
      storageKey,
      originalFilename: `${invoice.invoiceId}.txt`,
      mimeType: "text/plain"
    });
    await this.dependencies.queue.enqueue({ invoiceId: liveInvoiceId });
    return liveInvoiceId;
  }

  private updateStage(stage: string, message: string) {
    this.status.stage = stage;
    this.pushLog(message);
  }

  private pushLog(message: string) {
    const line = `[${new Date().toISOString()}] ${message}`;
    this.status.logs = [...this.status.logs.slice(-59), line];
  }
}

async function loadDataset(): Promise<DatasetInvoice[]> {
  const raw = await readFile(LIVE_OCR_DATASET_PATH, "utf8");
  return raw
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as DatasetInvoice);
}

async function cleanupDemoData(pool: Pool, restaurantId: string) {
  await pool.query("begin");

  try {
    await pool.query("delete from inventory_ledger where restaurant_id = $1", [restaurantId]);
    await pool.query("delete from invoice where restaurant_id = $1", [restaurantId]);
    await pool.query(
      `
        delete from ingredient_alias
        where canonical_id in (
          select id
          from ingredient_canonical
          where is_active = false
        )
      `
    );
    await pool.query("delete from ingredient_canonical where is_active = false");
    await pool.query("commit");
  } catch (error) {
    await pool.query("rollback");
    throw error;
  }
}

async function seedCatalogFromDataset(pool: Pool, dataset: DatasetInvoice[]) {
  const canonicals = new Map<string, { canonicalName: string; defaultUnit: string }>();
  const aliases = new Map<string, string>();

  for (const invoice of dataset) {
    for (const item of invoice.expectedLineItems) {
      if (!canonicals.has(item.canonicalName)) {
        canonicals.set(item.canonicalName, {
          canonicalName: item.canonicalName,
          defaultUnit: pickPreferredUnit(item.canonicalName, item.rawUnit)
        });
      }

      aliases.set(preprocessForComparison(item.rawName), item.canonicalName);
      aliases.set(preprocessForComparison(item.canonicalName), item.canonicalName);
    }
  }

  await pool.query("begin");

  try {
    for (const canonical of canonicals.values()) {
      await pool.query(
        `
          insert into ingredient_canonical (canonical_name, default_unit, embedding, is_active)
          values ($1, $2, null, true)
          on conflict (canonical_name) do update
            set default_unit = excluded.default_unit,
                is_active = true
        `,
        [canonical.canonicalName, canonical.defaultUnit]
      );
    }

    for (const [aliasText, canonicalName] of aliases.entries()) {
      await pool.query(
        `
          insert into ingredient_alias (canonical_id, alias_text, vendor_id)
          select id, $1, null
          from ingredient_canonical
          where canonical_name = $2
          on conflict (alias_text, vendor_id) do nothing
        `,
        [aliasText, canonicalName]
      );
    }

    await pool.query("commit");
  } catch (error) {
    await pool.query("rollback");
    throw error;
  }
}

async function waitForInvoice(store: InvoiceStore, invoiceId: string): Promise<ApiInvoice> {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    const invoice = await store.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} was not found while waiting for completion.`);
    }

    const lineItems = await store.listLineItems(invoiceId);
    if (invoice.status === "done" || invoice.status === "error") {
      return {
        id: invoice.id,
        status: invoice.status,
        errorMessage: invoice.errorMessage,
        lineItems: lineItems.map((item) => ({
          rawName: item.rawName,
          canonicalName: item.canonicalName,
          routing: item.routing
        }))
      };
    }

    await sleep(250);
  }

  throw new Error(`Timed out waiting for invoice ${invoiceId}`);
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

function clampLimit(limit: number) {
  return Math.max(1, Math.min(1000, Math.trunc(limit)));
}

function round(value: number) {
  return Math.round(value * 10000) / 10000;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function preprocessForComparison(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(\d+)(lb|lbs|oz|kg|g|l|ml|gal|case|cs|ea|each|bunch|bag|box)\b/g, " ")
    .replace(/\b(case|fresh|organic)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
