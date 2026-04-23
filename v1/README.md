# ChefVision Backend

All-TypeScript backend implementation for the ChefVision AI project.

## What is included

- `apps/api`: Node + Express API for auth, invoice uploads, async job orchestration, inventory queries, Excel export, and SSE job status updates.
- `apps/normalizer`: separate TypeScript microservice for ingredient normalization.
- `packages/shared`: shared DTOs and utility types.
- `sql/001_init.sql`: PostgreSQL + pgvector schema and demo seed data.
- `infra/docker-compose.yml`: local stack with PostgreSQL, Redis, MinIO, API, and normalization service.
- `infra/ecs/*.json`: ECS Fargate task definition examples.

## AI/ML architecture

The normalization service is now organized as an explicit ML pipeline:

1. `preprocess.ts`
   Cleans noisy supplier text, strips quantities, and standardizes tokens.
2. `ml/embedding-provider.ts`
   Produces a vector representation for the cleaned string.
3. `ml/candidate-retriever.ts`
   Retrieves nearest canonical ingredient candidates from PostgreSQL + pgvector.
4. `ml/feature-extractor.ts`
   Computes semantic similarity, string similarity, and token overlap features.
5. `ml/scoring-model.ts`
   Applies a weighted hybrid model to turn features into a confidence score.
6. `ml/confidence-router.ts`
   Routes results into `auto_commit`, `needs_review`, or `new_ingredient`.
7. `ml/explanation-builder.ts`
   Produces human-readable reasons and score breakdowns for each decision.
8. `ml/evaluator.ts`
   Runs a labeled evaluation set and reports accuracy, precision, recall, F1, and routing rates.

This makes AI/ML a core architectural subsystem instead of a single utility function.

## Architecture

1. A restaurant owner authenticates through the API.
2. The API accepts an invoice upload and stores the file in local disk or S3-compatible storage.
3. The API creates an invoice row and enqueues an async BullMQ job in Redis.
4. The worker loads the uploaded file, extracts structured line items, and calls the normalization service.
5. The normalization service preprocesses the raw text, checks alias matches, and uses weighted hybrid scoring on canonical ingredients stored in PostgreSQL + pgvector.
6. High-confidence matches update the inventory ledger immediately.
7. The API exposes invoice status polling plus an SSE stream for push updates.

The production embedding path now uses:

- `onnx-community/all-MiniLM-L6-v2-ONNX`
- pgvector `vector(384)` storage
- weighted hybrid reranking on top of dense retrieval
- automatic catalog embedding backfill for canonicals that do not yet have vectors

## Normalizer endpoints

- `GET /health`
- `GET /model/info`
- `POST /normalize`
- `POST /evaluate`

`POST /normalize` now returns:

- top match and ranked candidates
- per-candidate score breakdowns
- retrieval metadata
- model version and thresholds
- explanation text and decision reasons

## Local development

```bash
npm install
npm run dev:normalizer
npm run dev:api
```

Environment defaults are baked into both services, but these values are useful to set explicitly:

```bash
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/chefvision
DATABASE_SSL=disable
REDIS_URL=redis://localhost:6379
JWT_SECRET=chefvision-dev-secret
NORMALIZER_URL=http://localhost:4001
EMBEDDING_PROVIDER=minilm
EMBEDDING_MODEL_ID=onnx-community/all-MiniLM-L6-v2-ONNX
EMBEDDING_DTYPE=fp32
STORAGE_MODE=local
LOCAL_UPLOAD_DIR=./uploads
```

If you already created the database with the earlier 16-d vector schema, run:

```bash
psql "$DATABASE_URL" -f sql/002_minilm_pgvector_upgrade.sql
npm run ml:backfill:embeddings
```

## Docker stack

```bash
docker compose -f infra/docker-compose.yml up --build
```

Services:

- API: `http://localhost:4000`
- Normalizer: `http://localhost:4001`
- MinIO console: `http://localhost:9001`

## Azure CLI deployment

There is also an Azure CLI deployment path in [infra/azure/README.md](/Users/girithchoudhary/Desktop/295/infra/azure/README.md) with a runnable script at [infra/azure/deploy-container-apps.sh](/Users/girithchoudhary/Desktop/295/infra/azure/deploy-container-apps.sh).

## Demo login

- Owner: `owner@chefvision.test` / `secret`
- Admin: `admin@chefvision.test` / `secret`

## Demo upload format

The extractor intentionally keeps the demo lean. It accepts:

- `application/json` with:

```json
{
  "supplierName": "Roma Farms",
  "invoiceDate": "2026-04-22",
  "lineItems": [
    { "rawName": "TOMATOES ROMA 25LB CASE", "rawQty": 25, "rawUnit": "lb" }
  ]
}
```

- `text/plain` or `text/csv` with:

```text
supplier: Roma Farms
date: 2026-04-22
TOMATOES ROMA 25LB CASE,25,lb
CHKN BRST 10LB,10,lb
```

## Tests

```bash
npm test
npm run test:e2e
```

The e2e test spins up the API and normalization services in-process using the inline queue and memory stores so the full upload-to-inventory flow can be verified quickly.

## Synthetic OCR dataset

A deterministic synthetic OCR-output dataset is available in [test/fixtures/fake-ocr](</Users/girithchoudhary/Desktop/295/test/fixtures/fake-ocr>) with 1000 fake invoice text samples plus ground truth line items.

Generate or regenerate it with:

```bash
npm run data:generate:ocr
```
