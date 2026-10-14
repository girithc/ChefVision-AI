export type TraceStepType = "chain" | "llm" | "tool" | "retriever" | "model";

export type TraceStep = {
  id: string;
  name: string;
  type: TraceStepType;
  startMs: number;
  endMs: number;
  tokens?: number;
  status: "success" | "error";
  /** Short input → output summary shown under the span name. */
  detail?: string;
  children?: TraceStep[];
};

/** LangSmith-style run traces for the app's real workflows, keyed by workflow id. */
export const workflowTraces: Record<string, TraceStep[]> = {
  "invoice-intake": [
    {
      id: "s1",
      name: "validate_upload",
      type: "tool",
      startMs: 0,
      endMs: 95,
      status: "success",
      detail: "input: invoice_2041.jpg (2.1 MB) · output: mime ok, 1 page",
    },
    { id: "s2", name: "persist_file_bytes", type: "tool", startMs: 95, endMs: 310, status: "success", detail: "pg bytea insert → storage_key" },
    { id: "s3", name: "enqueue_bullmq_job", type: "chain", startMs: 310, endMs: 420, status: "success", detail: "queue: invoiceQueue · job #4812" },
    {
      id: "s4",
      name: "process_invoice (worker)",
      type: "chain",
      startMs: 420,
      endMs: 4890,
      status: "success",
      detail: "invoice INV-8841 · Coastal Seafood",
      children: [
        { id: "s4a", name: "tesseract_ocr", type: "llm", startMs: 420, endMs: 2410, tokens: 1210, status: "success", detail: "output: 214 text lines, mean conf 87%" },
        { id: "s4b", name: "parse_line_items", type: "chain", startMs: 2410, endMs: 2760, status: "success", detail: "output: 17 line items (3 boilerplate lines ignored)" },
        {
          id: "s4c",
          name: "match_ingredients",
          type: "retriever",
          startMs: 2760,
          endMs: 3680,
          status: "success",
          detail: "17 raw names → canonical catalog",
          children: [
            { id: "s4c1", name: "embed_minilm", type: "model", startMs: 2760, endMs: 3150, tokens: 38, status: "success", detail: "384-d vectors, batch=17" },
            { id: "s4c2", name: "pgvector_knn", type: "tool", startMs: 3150, endMs: 3370, status: "success", detail: "top-10 candidates per item" },
            { id: "s4c3", name: "rerank_hybrid", type: "chain", startMs: 3370, endMs: 3680, status: "success", detail: "semantic 0.55 + string 0.30 + token 0.15" },
          ],
        },
        { id: "s4d", name: "confidence_route", type: "chain", startMs: 3680, endMs: 3890, status: "success", detail: "14 auto_commit · 2 needs_review · 1 new_ingredient" },
        { id: "s4e", name: "commit_inventory", type: "tool", startMs: 3890, endMs: 4460, status: "success", detail: "pg transaction: +14 ledger rows" },
      ],
    },
    { id: "s5", name: "sse_notify", type: "chain", startMs: 4890, endMs: 5100, status: "success", detail: "event: invoice.done → client" },
  ],
  "recipe-recost": [
    { id: "r1", name: "trigger_invoice_published", type: "tool", startMs: 0, endMs: 60, status: "success", detail: "INV-8841 · Coastal Seafood" },
    { id: "r2", name: "update_ingredient_costs", type: "tool", startMs: 60, endMs: 380, status: "success", detail: "upsert: 17 canonical ingredient costs" },
    { id: "r3", name: "find_affected_recipes", type: "retriever", startMs: 380, endMs: 720, status: "success", detail: "BOM join → 5 recipes affected" },
    {
      id: "r4",
      name: "recompute_recipe_costs",
      type: "chain",
      startMs: 720,
      endMs: 1520,
      status: "success",
      detail: "recursive: sub-recipes first, dishes after",
      children: [
        { id: "r4a", name: "cost_chipotle_mayo", type: "chain", startMs: 720, endMs: 940, status: "success", detail: "sub-recipe batch: $6.11 (40 × 1 oz)" },
        { id: "r4b", name: "cost_pico_de_gallo", type: "chain", startMs: 940, endMs: 1160, status: "success", detail: "sub-recipe batch: $9.24 (16 × 2 oz)" },
        { id: "r4c", name: "cost_finished_dishes", type: "chain", startMs: 1160, endMs: 1520, status: "success", detail: "3 dishes re-costed with fresh sub-recipes" },
      ],
    },
    { id: "r5", name: "recalc_food_cost_pct", type: "model", startMs: 1520, endMs: 1740, status: "success", detail: "chicken sandwich: 31.4% (was 28.9%)" },
    { id: "r6", name: "flag_threshold_breach", type: "chain", startMs: 1740, endMs: 1890, status: "success", detail: "1 dish crossed 32% ceiling → profitability alert" },
  ],
  "sensor-watchtower": [
    { id: "w1", name: "ingest_reading", type: "tool", startMs: 0, endMs: 70, status: "success", detail: "ice machine water temp: 44.0°F" },
    { id: "w2", name: "threshold_eval", type: "chain", startMs: 70, endMs: 240, status: "success", detail: "44°F > 40°F ceiling → warning" },
    { id: "w3", name: "trend_anomaly_check", type: "model", startMs: 240, endMs: 680, status: "success", detail: "isolation forest: anomaly score 0.93 · rising 4/4 readings" },
    {
      id: "w4",
      name: "create_work_order",
      type: "chain",
      startMs: 680,
      endMs: 1180,
      status: "success",
      detail: "auto: sensor reading attached as evidence",
      children: [
        { id: "w4a", name: "pick_assignee", type: "tool", startMs: 680, endMs: 820, status: "success", detail: "ColdFix Ltd (active contract)" },
        { id: "w4b", name: "set_priority_deadline", type: "chain", startMs: 820, endMs: 1180, status: "success", detail: "priority High · deadline 24h" },
      ],
    },
    { id: "w5", name: "push_dashboard_alert", type: "chain", startMs: 1180, endMs: 1390, status: "success", detail: "sensor tile → rose alert state" },
  ],
  "daily-report": [
    { id: "d1", name: "pull_pos_sales", type: "tool", startMs: 0, endMs: 240, status: "success", detail: "244 covers · $12,960 · avg check $53.11" },
    { id: "d2", name: "actual_food_cost", type: "chain", startMs: 240, endMs: 860, status: "success", detail: "invoices published + count variance: $4,230" },
    { id: "d3", name: "theoretical_food_cost", type: "retriever", startMs: 860, endMs: 1290, status: "success", detail: "POS items × recipe BOM: $3,940" },
    { id: "d4", name: "usage_variance", type: "chain", startMs: 1290, endMs: 1620, status: "success", detail: "+$290 (2.2%) — chicken & lettuce flagged" },
    { id: "d5", name: "labor_cost_summary", type: "tool", startMs: 1620, endMs: 1870, status: "success", detail: "$3,760 · 29.0% of sales" },
    {
      id: "d6",
      name: "render_exec_summary",
      type: "llm",
      startMs: 1870,
      endMs: 2480,
      tokens: 610,
      status: "success",
      detail: "deepseek: daily controllable P&L narrative",
    },
    { id: "d7", name: "publish_report", type: "tool", startMs: 2480, endMs: 2610, status: "success", detail: "financial reports tab + email digest" },
  ],
  "assistant-rag": [
    { id: "a1", name: "guard_prompt", type: "chain", startMs: 0, endMs: 80, status: "success", detail: "scope: restaurant data only" },
    { id: "a2", name: "embed_query", type: "model", startMs: 80, endMs: 420, tokens: 24, status: "success" },
    { id: "a3", name: "retrieve_context", type: "retriever", startMs: 420, endMs: 890, status: "success", detail: "pgvector: inventory + invoices + finance chunks (top-8)" },
    { id: "a4", name: "deepseek_answer", type: "llm", startMs: 890, endMs: 1480, tokens: 386, status: "success", detail: "streamed · grounded in retrieved context" },
    { id: "a5", name: "stream_response", type: "chain", startMs: 1480, endMs: 1600, status: "success", detail: "SSE → assistant pane" },
  ],
};

export type ArchitectureStage = {
  title: string;
  detail: string;
  kind: "llm" | "ml" | "tool" | "human" | "data";
};

export const pipelineArchitectures: Record<string, ArchitectureStage[]> = {
  extraction: [
    { kind: "tool", title: "Capture & queue", detail: "Photo, PDF, or email lands; file bytes persist in Postgres; a BullMQ job is enqueued." },
    { kind: "llm", title: "LLM OCR → JSON", detail: "A vision-capable LLM reads the document and emits structured JSON: vendor, date, line items with quantity, unit, and price." },
    { kind: "tool", title: "Math checks", detail: "Deterministic validation: line totals = qty × price, subtotal + tax = total, price sanity bands. Any mismatch flags the invoice for review." },
    { kind: "llm", title: "Map to system (temp 0)", detail: "A temperature-0 LLM maps the JSON onto our schema — canonical fields and units. Zero temperature keeps output deterministic; math checks re-verify." },
    { kind: "tool", title: "Publish", detail: "Lines become invoice records and land in the matching queue." },
  ],
  matching: [
    { kind: "ml", title: "Embed + top-k retrieval", detail: "Embedding model (MiniLM) vectorizes the supplier item; pgvector returns the k closest canonical ingredients." },
    { kind: "ml", title: "Decision model", detail: "Gradient-boosted decision model scores each candidate → probability, using embedding similarity, string similarity, token overlap, vendor history, and price coherence." },
    { kind: "tool", title: "Confidence routing", detail: "High probability auto-commits; mid range goes to human review; none match → new ingredient." },
    { kind: "human", title: "User feedback", detail: "Accept / Reject in the matching queue — humans vet what the model is unsure about." },
    { kind: "ml", title: "Store & improve", detail: "Accepted matches persist as alias pairs for instant future matching; the growing vetted set retrains and improves the pipeline." },
  ],
  forecasting: [
    { kind: "data", title: "Growing corpus", detail: "POS sales, invoices, waste logs, reservations, weather, and events accumulate continuously." },
    { kind: "data", title: "Feature build", detail: "Day-of-week, seasonality, holidays, local events, weather, and promotion flags per ingredient." },
    { kind: "ml", title: "LightGBM — gradient-boosted trees", detail: "The model of choice for tabular demand: fast to retrain as the corpus grows, handles categories natively, quantile heads give P90 demand for safety stock." },
    { kind: "tool", title: "Serve predictions", detail: "7-day ingredient demand × recipe BOM → reorder suggestions in Inventory and Financial Reports." },
    { kind: "human", title: "Forecast vs actual", detail: "Every day's actuals re-enter the training set — accuracy improves as a side effect of operating." },
  ],
  maintenance: [
    { kind: "data", title: "Sensor ingest", detail: "Temperature (and later vibration/current) readings stream in per equipment." },
    { kind: "tool", title: "Threshold rules", detail: "Hard limits fire instantly — e.g. chiller above 40°F → alert, no ML needed." },
    { kind: "ml", title: "Anomaly detection", detail: "Isolation Forest + rolling z-scores catch slow drift before a breach — degradation shows up as pattern, not spike." },
    { kind: "ml", title: "Failure prediction", detail: "LightGBM classifier on degradation features (time since service, drift rate, fault history, sensor variance) → probability of failure within 7/30 days." },
    { kind: "tool", title: "Auto work order", detail: "High-risk assets get a work order with priority and deadline automatically; later: survival analysis for remaining useful life." },
  ],
  assistant: [
    { kind: "llm", title: "The harness", detail: "DeepSeek runs inside a tool harness — it can call platform tools, not just chat." },
    { kind: "tool", title: "Internal platform access", detail: "Tools expose inventory, invoices, recipes, checklists, equipment, and reports as callable functions." },
    { kind: "tool", title: "RBAC-scoped data", detail: "Every database query is filtered by the asking user's permissions — the assistant can never see past what that user is allowed to." },
    { kind: "tool", title: "Web search", detail: "Optional live search for market prices and external context." },
    { kind: "data", title: "Data context", detail: "pgvector retrieval over the restaurant's own records grounds every answer." },
    { kind: "human", title: "Actions with approval", detail: "The assistant can take actions — draft POs, save notes, flag issues — with human approval on sensitive ones." },
  ],
};

export type PipelineState = "Operational" | "Degraded" | "Down";

export type PipelineRun = {
  id: string;
  startedAt: string;
  durationMs: number;
  status: "success" | "error";
  detail: string;
};

export type PipelineUptime = {
  id: string;
  name: string;
  description: string;
  state: PipelineState;
  /** Success rate over the last 24h. */
  successRate: number;
  runsToday: number;
  avgLatencyMs: number;
  lastIncident: string;
  /** Success % per hour bucket, last 12 hours. */
  history: number[];
  /** Recent individual runs, newest first. */
  runs: PipelineRun[];
};

export const pipelineUptime: PipelineUptime[] = [
  {
    id: "extraction",
    name: "Invoice data extraction",
    description: "Upload → Tesseract OCR → line-item parsing",
    state: "Operational",
    successRate: 99.4,
    runsToday: 148,
    avgLatencyMs: 5100,
    lastIncident: "12 days ago",
    history: [100, 100, 99, 100, 98, 100, 100, 97, 100, 99, 100, 100],
    runs: [
      { id: "run-4812", startedAt: "9:02 AM", durationMs: 5100, status: "success", detail: "INV-8841 · 17 line items extracted" },
      { id: "run-4811", startedAt: "8:40 AM", durationMs: 4980, status: "success", detail: "INV-8840 · 9 line items extracted" },
      { id: "run-4810", startedAt: "8:15 AM", durationMs: 5320, status: "success", detail: "INV-8839 · 24 line items extracted" },
      { id: "run-4809", startedAt: "7:58 AM", durationMs: 6210, status: "error", detail: "blurry photo — retry succeeded on attempt 2" },
    ],
  },
  {
    id: "matching",
    name: "Ingredient matching",
    description: "MiniLM embeddings → pgvector → hybrid rerank",
    state: "Operational",
    successRate: 98.8,
    runsToday: 2510,
    avgLatencyMs: 910,
    lastIncident: "6 days ago",
    history: [99, 98, 99, 97, 99, 98, 99, 99, 100, 98, 99, 99],
    runs: [
      { id: "run-9112", startedAt: "9:02 AM", durationMs: 890, status: "success", detail: "17 items · 14 auto-commit · 2 needs review" },
      { id: "run-9111", startedAt: "8:40 AM", durationMs: 940, status: "success", detail: "9 items · all auto-commit" },
      { id: "run-9110", startedAt: "8:15 AM", durationMs: 910, status: "success", detail: "24 items · 1 new ingredient created" },
      { id: "run-9109", startedAt: "7:45 AM", durationMs: 1180, status: "success", detail: "31 items · low-confidence batch" },
    ],
  },
  {
    id: "forecasting",
    name: "Demand forecasting",
    description: "Nightly LightGBM retrain → 7-day ingredient demand",
    state: "Operational",
    successRate: 100,
    runsToday: 1,
    avgLatencyMs: 42000,
    lastIncident: "—",
    history: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    runs: [
      { id: "run-0042", startedAt: "2:00 AM", durationMs: 41800, status: "success", detail: "16 ingredients · 7-day horizon · MAPE 8.4%" },
      { id: "run-0041", startedAt: "Yesterday 2:00 AM", durationMs: 40900, status: "success", detail: "16 ingredients · 7-day horizon" },
      { id: "run-0040", startedAt: "2 days ago 2:00 AM", durationMs: 43100, status: "error", detail: "missing POS day — fell back to moving average" },
    ],
  },
  {
    id: "maintenance",
    name: "Predictive maintenance",
    description: "Sensor thresholds + anomaly detection → work orders",
    state: "Degraded",
    successRate: 96.2,
    runsToday: 96,
    avgLatencyMs: 1400,
    lastIncident: "Today — ice machine sensor flap",
    history: [100, 99, 98, 96, 94, 95, 93, 96, 95, 97, 96, 96],
    runs: [
      { id: "run-0966", startedAt: "7:55 AM", durationMs: 1420, status: "success", detail: "ice machine anomaly 0.93 → work order created" },
      { id: "run-0965", startedAt: "7:25 AM", durationMs: 1390, status: "success", detail: "ice machine anomaly 0.87 → warning" },
      { id: "run-0964", startedAt: "6:55 AM", durationMs: 1310, status: "success", detail: "all sensors nominal" },
      { id: "run-0963", startedAt: "6:25 AM", durationMs: 1450, status: "error", detail: "sensor timeout — HVAC, retry ok" },
    ],
  },
  {
    id: "assistant",
    name: "AI assistant (RAG)",
    description: "Guard → embed → pgvector retrieve → DeepSeek",
    state: "Operational",
    successRate: 99.7,
    runsToday: 312,
    avgLatencyMs: 1600,
    lastIncident: "3 days ago",
    history: [100, 99, 100, 100, 98, 100, 99, 100, 100, 99, 100, 100],
    runs: [
      { id: "run-3312", startedAt: "9:14 AM", durationMs: 1610, status: "success", detail: "'order chicken' → reorder advice · 386 tok" },
      { id: "run-3311", startedAt: "9:02 AM", durationMs: 1520, status: "success", detail: "'food cost' → 31.4% summary · 298 tok" },
      { id: "run-3310", startedAt: "8:51 AM", durationMs: 1740, status: "success", detail: "'overdue checklists' · 214 tok" },
    ],
  },
];
