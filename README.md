# ChefVision AI

A practical, AI-first back-of-house platform that turns messy restaurant paperwork into clean, usable intelligence.

**Project Abstract**
Restaurants succeed or fail based on daily inventory decisions: what to buy, how much to prep, and what to keep in stock. Today those decisions rely on scattered, inconsistent information such as paper receipts, delivery invoices, and ad-hoc notes. When demand shifts due to weather, holidays, or local events, even experienced managers can struggle to order correctly. The result is over-ordering and waste on one side, and stockouts and lost sales on the other.

ChefVision AI addresses this by using computer vision and ML to read invoices and receipts, standardize ingredient names, and forecast short-term demand. The system extracts items, quantities, and prices, normalizes naming differences across suppliers, and generates a smart reorder list based on historical usage and external signals.

**What We Do**
- Intelligent inventory management and reorder recommendations
- Demand forecasting with short-term prediction windows
- Ingredient-to-menu-item mapping for accurate usage and costing
- Back-of-house analytics that reduce waste and stockouts

**Data Ingestion (3 Ways)**
- **Photos:** Capture invoices, menus, and customer bills with a phone and upload
- **Files:** Upload CSV/Excel exports and digital menus (PDF or spreadsheet)
- **Integrations (planned):** Connect POS, ordering, and supplier systems via API or file drops

**ML/AI Pipeline (Planned)**
- **Document AI:** OCR + layout understanding to extract line items, totals, and metadata
- **Entity normalization:** Map supplier naming variants to a unified ingredient catalog
- **Forecasting:** Predict demand and recommend purchase quantities
- **Mapping:** Link ingredients to menu items for recipe costing and depletion tracking

**Datasets We Can Use (Public / Research)**
- **Food images & recipes:** Food-101, Recipe1M+ for food recognition and image/recipe alignment
- **Receipts & invoices:** SROIE (ICDAR 2019), CORD (Consolidated Receipt Dataset) for receipt understanding
- **Nutrition & ingredients:** USDA FoodData Central, Open Food Facts for product and ingredient metadata
- **Restaurant context:** Yelp Open Dataset (business metadata, photos, reviews)
- **Optional/paid sources:** Licensed menu datasets (e.g., OpenMenu) for large-scale menu coverage

**Models We Plan to Use**
- **OCR & layout:** TrOCR / Donut / LayoutLMv3-style models for document understanding
- **Extraction & labeling:** Sequence labeling and key-value extraction with transformer encoders
- **Ingredient matching:** Embedding similarity + rules + LLM-assisted normalization
- **Forecasting:** Gradient boosting (XGBoost/LightGBM), Prophet, and deep time-series models (e.g., TFT)

**Why We Win (USP)**
ChefVision AI is simple to onboard but powerful in execution. A restaurant can start with photos and CSVs in minutes, yet the system is strong enough to replace much of the back-office workflow over time.

**Status**
Early-stage productization with focus on ingestion, normalization, and forecasting accuracy.
