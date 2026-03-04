**ChefVision AI**
*A practical, AI-first back-of-house platform that turns messy restaurant paperwork into clean, usable inventory intelligence.*

## Project Abstract

Restaurants succeed or fail on daily inventory decisions: what to buy, how much to prep, and what to keep in stock. Today, those decisions are driven by scattered, inconsistent inputs—paper invoices, receipts, delivery slips, and ad-hoc notes. When demand shifts due to weather, holidays, or local events, even experienced managers can struggle to order correctly. The result is waste from over-ordering on one side, and stockouts and lost sales on the other.

ChefVision AI fixes this by using computer vision and machine learning to read invoices/receipts, standardize ingredient names, and generate smart reorder recommendations. The system extracts items, quantities, and prices; normalizes naming differences across suppliers (e.g., “tomato” vs “tomotoh”); and updates a structured inventory sheet that powers forecasting and event-based planning.

---

## What We Do

* Intelligent inventory management and reorder recommendations
* Ingredient name normalization across suppliers and formats
* Ingredient-to-recipe and ingredient-to-menu mapping for accurate usage and costing
* Demand forecasting with short-term prediction windows
* Back-of-house analytics to reduce waste and prevent stockouts

---

## Primary Workflow (How the Owner Uses It)

1. **Capture invoices (Photos)**
   The restaurant owner takes photos of delivery invoices/receipts using a phone.
2. **Document understanding (Model 1: Transformer-based)**
   The app extracts line items (ingredient name, quantity, unit, price, vendor, date).
3. **Clean + normalize ingredients**
   The app checks for duplicates and naming variations (e.g., “tomato”, “tomotoh”, “Roma tomatoes”) and maps them to a single canonical ingredient.
4. **Export to an inventory sheet (Excel)**
   After normalization, the cleaned data is written into an Excel sheet (or a spreadsheet-backed database with Excel export).
5. **Plan for events + smart reordering**
   The owner enters upcoming events (e.g., *10 events*), selects the recipes/menu items needed, and specifies serving counts (e.g., *100 people*). The app calculates total ingredient requirements per event (or week-by-week), checks current inventory, and produces a **smart reorder list** for shortages.

---

## User Roles (Two “Faces” of the App)

1. **Owner/Admin (Platform Admin)**

   * Manages ingredient catalog and canonical naming rules
   * Oversees supplier/vendor mappings and system settings
   * Configures datasets, model versions, and planned integrations
2. **Restaurant Owner/User (End User)**

   * Uploads photos/files, reviews extracted items
   * Confirms ingredient matches when needed
   * Plans events and receives reorder recommendations

---

## Data Ingestion (3 Ways)

* **Photos (MVP):** Capture invoices, receipts, menus, and customer bills with a phone
* **Files:** Upload CSV/Excel exports and digital menus (PDF/spreadsheets)
* **Integrations (Planned):** Connect POS, ordering, and supplier systems via API or scheduled file drops

---

## ML/AI Pipeline (Planned, 3-Model Approach)

### Model 1 — Document AI (Transformer)

**Goal:** Convert invoice/receipt images into structured line items.

* OCR + layout understanding for tables, totals, vendor/date metadata
* Candidate models: Donut / LayoutLMv3-style / TrOCR-based pipelines

### Model 2 — Recipe–Ingredient Intelligence (ML)

**Goal:** Learn relationships between recipes and ingredients for accurate usage/costing.

* Trained on recipe–ingredient datasets (public + curated internal recipes)
* Enables ingredient depletion tracking and recipe costing

### Model 3 — Forecasting + Planning (ML + Transformer support)

**Goal:** Predict near-term demand and generate purchase quantities.

* Forecasting model (e.g., XGBoost/LightGBM/Prophet/TFT depending on data maturity)
* Event planner computes ingredient needs per event and aggregates weekly requirements
* Transformer/LLM support can assist with interpreting free-text event notes and recipe naming consistency (optional)

---

## Ingredient Normalization (Key Capability)

The app detects when the *same ingredient appears under different names* and merges them into a unified catalog entry using:

* Embedding similarity + rules (units, vendor patterns, common misspellings)
* Optional LLM-assisted matching for edge cases
* Human-in-the-loop confirmation when confidence is low

---

## Outputs

* Clean, standardized **inventory ledger** (Excel export supported)
* **Event-by-event** ingredient requirements
* **Week-by-week** ingredient planning summaries (optional mode)
* **Smart reorder list** with quantities and vendor context

---

## Datasets We Can Use (Public / Research)

* Receipts & invoices: SROIE (ICDAR 2019), CORD for receipt understanding
* Food images & recipes: Food-101, Recipe1M+ (where available)
* Nutrition & ingredients: USDA FoodData Central, Open Food Facts
* Restaurant context: Yelp Open Dataset
* Optional/paid: Licensed menu datasets (e.g., OpenMenu)

---

## Why We Win (USP)

ChefVision AI is easy to onboard but powerful over time. A restaurant can start in minutes using photos and CSVs, then gradually adopt deeper automation—normalization, forecasting, and event planning—until much of the back-office workflow is replaced.

---

## Status

Early-stage productization focused on:

* Reliable ingestion (photo → structured data)
* High-accuracy ingredient normalization
* Event-based inventory checking and reorder generation
* Improving forecasting performance as historical usage data grows
