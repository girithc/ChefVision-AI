# ChefVision AI — Frontend

React + Vite + Tailwind v4 single-page app that implements screens 1–9 from the project report
plus a landing page, login, and admin console.

## Screens

| Report screen | Route | Source |
| --- | --- | --- |
| Dashboard (receipts list) | `#/dashboard` | `src/pages/Dashboard.tsx` |
| Scan Receipt (Model 1 + review) | `#/scan` | `src/pages/ScanReceipt.tsx` |
| Manual Entry | `#/manual` | `src/pages/ManualEntry.tsx` |
| Receipt Details (+ normalization) | `#/receipts/:id` | `src/pages/ReceiptDetails.tsx` |
| Event Section | `#/events` | `src/pages/Events.tsx` |
| Recipe List | `#/recipes` | `src/pages/Recipes.tsx` |
| Monthly View | `#/monthly` | `src/pages/MonthlyView.tsx` |
| Inventory ledger (UC5) | `#/inventory` | `src/pages/Inventory.tsx` |
| Inventory Check & Reorder | `#/reorder` | `src/pages/Reorder.tsx` |
| Admin Console (UC9) | `#/admin` | `src/pages/Admin.tsx` |
| Landing / Login | `#/`, `#/login` | `src/pages/Landing.tsx`, `src/pages/Login.tsx` |

The design language, emerald/mint colour palette, and dashboard aesthetic are taken from the
Figma-style landing page in `design/original-landing-mockup.html`.

## Backend wiring

The client talks to two services:

- `/api` — Node/Express API in `../server/apps/api` (JWT auth, invoice upload, inventory, admin dashboards).
- `/ocr` — FastAPI Model 1 service in `../Ocr-Model-1` (`POST /api/extract`).

Both prefixes are proxied by Vite in development (`vite.config.ts`) and by nginx inside the Docker
image (`nginx.conf`). The service names (`api`, `ocr`) match `server/infra/docker-compose.yml`.

| Flow | API call |
| --- | --- |
| Login | `POST /auth/login` |
| Scan Receipt | `POST /ocr/api/extract` → review → `POST /api/invoices/upload` (JSON body) |
| Receipt status | `GET /api/invoices/:id` (polled until `done`/`error`) |
| Inventory | `GET /api/inventory` |
| Excel export | `GET /api/inventory/export` |
| Admin dashboards | `/api/admin/demo/pipeline`, `/results`, `/batch/*` |

### Human-in-the-loop review

`src/lib/receipt-factory.ts` consumes the `OcrResult` shape returned by `ocr_invoice.py`
(`vendor`, `date`, `invoice_number`, `line_items`, `subtotal`, `tax`, `total`, and `flagged_fields`).
Any field named in `flagged_fields` or any line item below 0.70 confidence is highlighted in the
Scan Receipt editor; editing the field clears the flag.

### Offline demo mode

If the API returns 5xx (e.g. it hasn't booted), the login screen offers "Continue in offline demo
mode". Receipts, recipes, and events are persisted in `localStorage`, the inventory ledger is
computed from receipts in `src/lib/planning.ts`, and the admin console is hidden.

## Scripts

```bash
npm install
npm run dev        # Vite dev server with /api -> :4000 and /ocr -> :8000 proxies
npm run build      # tsc -b && vite build
npm run lint
```

Override the proxy targets with `API_TARGET` / `OCR_TARGET`.

## Docker

```bash
docker build -t chefvision-frontend .
```

The resulting nginx image proxies `/api/*` and `/ocr/*` to the sibling services defined in
`../server/infra/docker-compose.yml`.
