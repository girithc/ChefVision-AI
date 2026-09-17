import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Pool } from "pg";

import { preprocessIngredient } from "../apps/normalizer/src/preprocess.js";

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

type LiveBatchReport = {
  stack: {
    apiBaseUrl: string;
    datasetPath: string;
    reportPath: string;
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

const DATASET_PATH = path.resolve("test/fixtures/fake-ocr/fake-ocr-invoices-1000.jsonl");
const REPORT_PATH = path.resolve("test/fixtures/fake-ocr/fake-ocr-live-api-report.json");
const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:4000";
const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/chefvision";

async function main() {
  const dataset = await loadDataset();
  await seedCatalogFromDataset(dataset);

  const token = await login();

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

  for (const invoice of dataset) {
    totalExpectedLineItems += invoice.expectedLineItems.length;

    const uploaded = await uploadInvoice(token, invoice);
    const liveInvoice = await waitForInvoice(token, uploaded.invoiceId);
    totalExtractedLineItems += liveInvoice.lineItems.length;

    if (liveInvoice.status === "done") {
      completedInvoices += 1;
    } else {
      failedInvoices += 1;
    }

    if (liveInvoice.lineItems.length === invoice.expectedLineItems.length) {
      exactInvoiceLineCountMatches += 1;
    }

    const actualItems = [...liveInvoice.lineItems].sort((left, right) => left.rawName.localeCompare(right.rawName));
    const expectedItems = [...invoice.expectedLineItems].sort((left, right) => left.rawName.localeCompare(right.rawName));
    const max = Math.min(actualItems.length, expectedItems.length);
    for (let index = 0; index < max; index += 1) {
      comparedLineItems += 1;
      const expected = expectedItems[index];
      const actual = actualItems[index];

      if (preprocessIngredient(expected.rawName) === preprocessIngredient(actual.rawName)) {
        rawNameMatches += 1;
      }
      if (expected.canonicalName === actual.canonicalName) {
        canonicalMatches += 1;
      }

      const routing = actual.routing ?? "unrouted";
      routingBreakdown[routing] = (routingBreakdown[routing] ?? 0) + 1;
    }

    if (
      liveInvoice.status !== "done" ||
      liveInvoice.lineItems.length !== invoice.expectedLineItems.length
    ) {
      if (sampleFailures.length < 15) {
        sampleFailures.push({
          invoiceId: invoice.invoiceId,
          status: liveInvoice.status,
          errorMessage: liveInvoice.errorMessage,
          expectedCount: invoice.expectedLineItems.length,
          extractedCount: liveInvoice.lineItems.length,
          expectedFirst: expectedItems[0]?.rawName,
          extractedFirst: actualItems[0]?.rawName
        });
      }
    }
  }

  const report: LiveBatchReport = {
    stack: {
      apiBaseUrl: API_BASE_URL,
      datasetPath: DATASET_PATH,
      reportPath: REPORT_PATH
    },
    pipeline: [
      "1. Seed the live PostgreSQL canonical ingredient catalog and alias table from the fake OCR dataset.",
      "2. Log in through the real API and upload each invoice OCR text file as text/plain.",
      "3. The API stores the file, creates an invoice row, and enqueues async processing.",
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

async function seedCatalogFromDataset(dataset: DatasetInvoice[]) {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
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

        aliases.set(preprocessIngredient(item.rawName), item.canonicalName);
        aliases.set(preprocessIngredient(item.canonicalName), item.canonicalName);
      }
    }

    await pool.query("begin");

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
  } finally {
    await pool.end();
  }
}

async function login(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "owner@chefvision.test",
      password: "secret"
    })
  });

  const payload = (await response.json()) as { token?: string };
  if (!response.ok || !payload.token) {
    throw new Error(`Login failed with status ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload.token;
}

async function uploadInvoice(token: string, invoice: DatasetInvoice): Promise<{ invoiceId: string }> {
  const form = new FormData();
  form.append("file", new Blob([invoice.ocrText], { type: "text/plain" }), `${invoice.invoiceId}.txt`);

  const response = await fetch(`${API_BASE_URL}/invoices/upload`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`
    },
    body: form
  });

  const payload = (await response.json()) as { invoiceId?: string };
  if (!response.ok || !payload.invoiceId) {
    throw new Error(`Invoice upload failed with status ${response.status}: ${JSON.stringify(payload)}`);
  }

  return { invoiceId: payload.invoiceId };
}

async function waitForInvoice(token: string, invoiceId: string): Promise<ApiInvoice> {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    const payload = (await response.json()) as ApiInvoice;
    if (!response.ok) {
      throw new Error(`Invoice lookup failed with status ${response.status}: ${JSON.stringify(payload)}`);
    }

    if (payload.status === "done" || payload.status === "error") {
      return payload;
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

function round(value: number) {
  return Math.round(value * 10000) / 10000;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
