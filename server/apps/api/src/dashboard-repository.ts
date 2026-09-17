import { readFile } from "node:fs/promises";

import { Pool } from "pg";

import type { ApiConfig } from "./config.js";
import { LIVE_OCR_DATASET_PATH, LIVE_OCR_REPORT_PATH, type LiveBatchReport } from "./live-ocr-batch.js";

export class DashboardRepository {
  constructor(
    private readonly pool: Pool,
    private readonly config: Pick<ApiConfig, "NORMALIZER_URL">
  ) {}

  async getPipelineData(input: {
    batchStatus: unknown;
    latestReport: LiveBatchReport | null;
  }) {
    const [datasetStats, modelInfo] = await Promise.all([this.getDatasetStats(), this.getModelInfo()]);

    return {
      dataset: {
        path: LIVE_OCR_DATASET_PATH,
        reportPath: LIVE_OCR_REPORT_PATH,
        ...datasetStats
      },
      batchStatus: input.batchStatus,
      latestReport: input.latestReport,
      modelInfo,
      pipelineSteps: [
        {
          id: "seed",
          title: "Seed Catalog",
          description: "Populate canonical ingredients and aliases from the 1000-invoice OCR dataset."
        },
        {
          id: "store",
          title: "Store OCR Files",
          description: "Persist each fake OCR invoice text file into the configured invoice storage."
        },
        {
          id: "worker",
          title: "Async Worker",
          description: "Create invoice rows and enqueue async jobs that run extraction and normalization."
        },
        {
          id: "retrieve",
          title: "MiniLM + pgvector",
          description: "Embed supplier text with MiniLM, retrieve nearest canonicals from pgvector, and rerank them."
        },
        {
          id: "inventory",
          title: "Inventory Update",
          description: "Store line-item matches and update the live inventory ledger for auto-committed results."
        },
        {
          id: "report",
          title: "Report",
          description: "Write the run summary to JSON and expose the latest metrics to the UI."
        }
      ]
    };
  }

  async getResultsData(input: { latestReport: LiveBatchReport | null }) {
    const [
      invoiceStatuses,
      routingBreakdown,
      topInventory,
      topCanonicals,
      recentInvoices,
      recentLineItems,
      totals,
      report
    ] = await Promise.all([
      this.pool.query<{ status: string; count: number }>(
        `
          select status, count(*)::int as count
          from invoice
          group by status
          order by status asc
        `
      ),
      this.pool.query<{ routing: string; count: number }>(
        `
          select coalesce(routing, 'unrouted') as routing, count(*)::int as count
          from invoice_line_item
          group by coalesce(routing, 'unrouted')
          order by count desc, routing asc
        `
      ),
      this.pool.query<{ canonicalName: string; onHandQty: number; unit: string }>(
        `
          select
            canonical_name as "canonicalName",
            on_hand_qty::float8 as "onHandQty",
            unit
          from inventory_ledger
          order by on_hand_qty desc, canonical_name asc
          limit 12
        `
      ),
      this.pool.query<{ canonicalName: string; matchCount: number }>(
        `
          select
            canonical_name as "canonicalName",
            count(*)::int as "matchCount"
          from invoice_line_item
          where canonical_name is not null
          group by canonical_name
          order by count(*) desc, canonical_name asc
          limit 12
        `
      ),
      this.pool.query<{
        id: string;
        supplierName: string | null;
        status: string;
        errorMessage: string | null;
        createdAt: string;
        updatedAt: string;
      }>(
        `
          select
            id,
            supplier_name as "supplierName",
            status,
            error_message as "errorMessage",
            created_at as "createdAt",
            updated_at as "updatedAt"
          from invoice
          order by created_at desc
          limit 12
        `
      ),
      this.pool.query<{
        invoiceId: string;
        rawName: string;
        canonicalName: string | null;
        routing: string | null;
        confidence: number | null;
      }>(
        `
          select
            li.invoice_id as "invoiceId",
            li.raw_name as "rawName",
            li.canonical_name as "canonicalName",
            li.routing,
            li.confidence::float8 as confidence
          from invoice_line_item li
          join invoice i on i.id = li.invoice_id
          order by i.updated_at desc, li.raw_name asc
          limit 20
        `
      ),
      this.pool.query<{
        invoiceCount: number;
        lineItemCount: number;
        matchedLineItemCount: number;
        inventoryItemCount: number;
      }>(
        `
          select
            (select count(*)::int from invoice) as "invoiceCount",
            (select count(*)::int from invoice_line_item) as "lineItemCount",
            (select count(*)::int from invoice_line_item where canonical_name is not null) as "matchedLineItemCount",
            (select count(*)::int from inventory_ledger) as "inventoryItemCount"
        `
      ),
      input.latestReport ? Promise.resolve(input.latestReport) : this.readReportFile()
    ]);

    return {
      reportPath: LIVE_OCR_REPORT_PATH,
      datasetPath: LIVE_OCR_DATASET_PATH,
      report,
      totals: totals.rows[0],
      invoiceStatuses: invoiceStatuses.rows,
      routingBreakdown: routingBreakdown.rows,
      topInventory: topInventory.rows,
      topCanonicals: topCanonicals.rows,
      recentInvoices: recentInvoices.rows,
      recentLineItems: recentLineItems.rows
    };
  }

  async readReportFile(): Promise<LiveBatchReport | null> {
    try {
      const raw = await readFile(LIVE_OCR_REPORT_PATH, "utf8");
      return JSON.parse(raw) as LiveBatchReport;
    } catch {
      return null;
    }
  }

  private async getDatasetStats() {
    const raw = await readFile(LIVE_OCR_DATASET_PATH, "utf8");
    const lines = raw.trim().split("\n");
    let totalExpectedLineItems = 0;

    for (const line of lines) {
      const invoice = JSON.parse(line) as { expectedLineItems: unknown[] };
      totalExpectedLineItems += invoice.expectedLineItems.length;
    }

    return {
      invoiceCount: lines.length,
      totalExpectedLineItems
    };
  }

  private async getModelInfo() {
    try {
      const response = await fetch(`${this.config.NORMALIZER_URL}/model/info`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch {
      return null;
    }
  }
}
