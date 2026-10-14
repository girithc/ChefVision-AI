export type TraceStepType = "chain" | "llm" | "tool" | "retriever" | "model";

export type TraceStep = {
  id: string;
  name: string;
  type: TraceStepType;
  startMs: number;
  endMs: number;
  tokens?: number;
  status: "success" | "error";
  children?: TraceStep[];
};

/** LangSmith-style run traces keyed by workflow id. */
export const workflowTraces: Record<string, TraceStep[]> = {
  "invoice-intake": [
    { id: "s1", name: "validate_upload", type: "tool", startMs: 0, endMs: 120, status: "success" },
    { id: "s2", name: "extract_document", type: "llm", startMs: 120, endMs: 2990, tokens: 1204, status: "success" },
    {
      id: "s3",
      name: "match_ingredients",
      type: "retriever",
      startMs: 2990,
      endMs: 3930,
      status: "success",
      children: [
        { id: "s3a", name: "embed_minilm", type: "model", startMs: 2990, endMs: 3400, tokens: 38, status: "success" },
        { id: "s3b", name: "pgvector_knn", type: "tool", startMs: 3400, endMs: 3620, status: "success" },
        { id: "s3c", name: "rerank_hybrid", type: "chain", startMs: 3620, endMs: 3930, status: "success" },
      ],
    },
    { id: "s4", name: "build_ledger_row", type: "chain", startMs: 3930, endMs: 4240, status: "success" },
    { id: "s5", name: "publish_inventory", type: "tool", startMs: 4240, endMs: 4820, status: "success" },
  ],
  "inventory-sync": [
    { id: "t1", name: "fetch_pos_sales", type: "tool", startMs: 0, endMs: 210, status: "success" },
    { id: "t2", name: "expand_recipes_bom", type: "chain", startMs: 210, endMs: 640, status: "success" },
    { id: "t3", name: "diff_theoretical_vs_actual", type: "chain", startMs: 640, endMs: 910, status: "success" },
    {
      id: "t4",
      name: "write_ledger_updates",
      type: "tool",
      startMs: 910,
      endMs: 1480,
      status: "success",
      children: [
        { id: "t4a", name: "pg_transaction", type: "tool", startMs: 910, endMs: 1380, status: "success" },
        { id: "t4b", name: "emit_sse_updates", type: "chain", startMs: 1380, endMs: 1480, status: "success" },
      ],
    },
  ],
  "purchase-order": [
    { id: "u1", name: "read_inventory_gaps", type: "retriever", startMs: 0, endMs: 380, status: "success" },
    {
      id: "u2",
      name: "forecast_usage",
      type: "model",
      startMs: 380,
      endMs: 1120,
      tokens: 96,
      status: "success",
    },
    {
      id: "u3",
      name: "draft_purchase_order",
      type: "llm",
      startMs: 1120,
      endMs: 2860,
      tokens: 842,
      status: "success",
      children: [
        { id: "u3a", name: "select_suppliers", type: "tool", startMs: 1120, endMs: 1310, status: "success" },
        { id: "u3b", name: "compute_order_quantities", type: "chain", startMs: 1310, endMs: 1980, status: "success" },
        { id: "u3c", name: "render_po_pdf", type: "tool", startMs: 1980, endMs: 2860, status: "success" },
      ],
    },
    { id: "u4", name: "queue_for_approval", type: "chain", startMs: 2860, endMs: 3010, status: "success" },
  ],
};
