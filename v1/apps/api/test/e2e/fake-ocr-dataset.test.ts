import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

test("fake OCR dataset contains 1000 invoice records", async () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const datasetPath = path.resolve(
    currentDir,
    "../../../../test/fixtures/fake-ocr/fake-ocr-invoices-1000.jsonl"
  );
  const raw = await readFile(datasetPath, "utf8");
  const lines = raw.trim().split("\n");

  assert.equal(lines.length, 1000);

  const first = JSON.parse(lines[0]) as {
    invoiceId: string;
    ocrText: string;
    expectedLineItems: Array<{ rawName: string; canonicalName: string }>;
  };

  assert.match(first.invoiceId, /^ocr-invoice-\d{4}$/);
  assert.ok(first.ocrText.length > 0);
  assert.ok(first.expectedLineItems.length >= 6);
  assert.ok(first.expectedLineItems.every((item) => item.rawName && item.canonicalName));
});
