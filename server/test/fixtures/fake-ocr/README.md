# Fake OCR Invoice Dataset

This folder contains a deterministic synthetic dataset that simulates the text output produced after OCR has run on restaurant invoices.

## Files

- `fake-ocr-invoices-1000.jsonl`: 1000 invoice samples, one JSON document per line
- `fake-ocr-invoices-1000.summary.json`: summary statistics for the generated dataset

## Record format

Each JSONL record contains:

- `invoiceId`
- `supplierName`
- `supplierCode`
- `invoiceDate`
- `restaurantId`
- `ocrText`: raw unstructured OCR text
- `expectedLineItems`: ground-truth structured items
- `metadata`: line count and OCR noise flags

## Regeneration

From the repo root:

```bash
npm run data:generate:ocr
```

The generator is deterministic, so rerunning it produces the same 1000 samples.
