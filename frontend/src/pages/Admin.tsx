import { useCallback, useEffect, useState } from "react";
import { Activity, Cpu, Database, Loader2, Play, RefreshCw, Settings2 } from "lucide-react";

import { Badge, Button, Card, Notice, PageHeader, StatCard } from "@/components/ui";
import * as api from "@/lib/api";
import { useApp } from "@/lib/app-context";

interface ModelInfo {
  modelVersion?: string;
  embeddingProvider?: string;
  embeddingModel?: string;
  embeddingDimensions?: number;
  retrievalTopK?: number;
  thresholds?: { autoCommit: number; review: number };
  weights?: { semantic: number; string: number; token: number };
}

interface BatchStatus {
  state?: string;
  stage?: string;
  totalInvoices?: number;
  processedInvoices?: number;
  completedInvoices?: number;
  failedInvoices?: number;
  errorMessage?: string | null;
  logs?: string[];
}

interface Results {
  totals?: { invoiceCount?: number; lineItemCount?: number; matchedLineItemCount?: number; inventoryItemCount?: number };
  routingBreakdown?: Array<{ routing: string; count: number }>;
  topCanonicals?: Array<{ canonicalName: string; matchCount: number }>;
}

const pct = (value: number | undefined) => (value === undefined ? "—" : `${Math.round(value * 100)}%`);

/** Admin Console (UC9): normalization model configuration and demo batch evaluation. */
export function Admin() {
  const { session, offline } = useApp();
  const token = session?.token ?? null;
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [batch, setBatch] = useState<BatchStatus | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    const [pipeline, resultData] = await Promise.allSettled([api.getAdminPipeline(token), api.getAdminResults(token)]);
    const failures: string[] = [];
    if (pipeline.status === "fulfilled") {
      setModelInfo((pipeline.value.modelInfo as ModelInfo | null) ?? null);
      setBatch((pipeline.value.batchStatus as BatchStatus | null) ?? null);
    } else {
      failures.push(pipeline.reason instanceof Error ? pipeline.reason.message : "Failed to load pipeline data");
    }
    if (resultData.status === "fulfilled") {
      setResults(resultData.value as Results);
    } else {
      failures.push(resultData.reason instanceof Error ? resultData.reason.message : "Failed to load results data");
    }
    setError(failures.length > 0 ? failures.join(" · ") : null);
  }, [token]);

  useEffect(() => {
    // Fetch-on-mount: state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const running = batch?.state === "running";
  useEffect(() => {
    if (!running || !token) return;
    const timer = setInterval(async () => {
      const status = (await api.getAdminBatchStatus(token).catch(() => null)) as BatchStatus | null;
      if (status) setBatch(status);
      if (status?.state !== "running") void load();
    }, 1500);
    return () => clearInterval(timer);
  }, [running, token, load]);

  if (offline) {
    return (
      <>
        <PageHeader title="Admin Console" />
        <Notice>The admin console needs a connection to the ChefVision API. Sign in with the API running.</Notice>
      </>
    );
  }

  const totals = results?.totals;
  const routingTotal = results?.routingBreakdown?.reduce((sum, row) => sum + row.count, 0) ?? 0;

  return (
    <>
      <PageHeader
        title="Admin Console"
        subtitle="Normalization model configuration, catalog matches, and batch evaluation."
        actions={<Button variant="secondary" icon={RefreshCw} onClick={() => void load()}>Refresh</Button>}
      />
      {error && <div className="mb-4"><Notice tone="rose">{error}</Notice></div>}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Invoices" value={totals?.invoiceCount ?? "—"} icon={Database} tone="indigo" />
        <StatCard label="Line items" value={totals?.lineItemCount ?? "—"} icon={Activity} tone="sky" />
        <StatCard
          label="Matched to catalog"
          value={totals?.lineItemCount ? pct((totals.matchedLineItemCount ?? 0) / totals.lineItemCount) : "—"}
          icon={Cpu}
        />
        <StatCard label="Inventory items" value={totals?.inventoryItemCount ?? "—"} icon={Settings2} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-900">Normalization model</h2>
          {modelInfo ? (
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-slate-500">Version</dt>
              <dd className="font-mono text-xs">{modelInfo.modelVersion}</dd>
              <dt className="text-slate-500">Embedding</dt>
              <dd className="text-xs break-all">{modelInfo.embeddingModel} ({modelInfo.embeddingDimensions}-d)</dd>
              <dt className="text-slate-500">Retrieval top-K</dt>
              <dd>{modelInfo.retrievalTopK}</dd>
              <dt className="text-slate-500">Auto-commit threshold</dt>
              <dd><Badge tone="green">≥ {modelInfo.thresholds?.autoCommit}</Badge></dd>
              <dt className="text-slate-500">Review threshold</dt>
              <dd><Badge tone="amber">≥ {modelInfo.thresholds?.review}</Badge></dd>
              <dt className="text-slate-500">Score weights</dt>
              <dd className="text-xs">
                semantic {modelInfo.weights?.semantic} · string {modelInfo.weights?.string} · token {modelInfo.weights?.token}
              </dd>
            </dl>
          ) : (
            <p className="text-sm text-slate-400">Normalizer service unavailable.</p>
          )}
          <p className="mt-4 text-xs text-slate-400">
            Thresholds are set via HIGH_CONF_THRESHOLD / LOW_CONF_THRESHOLD on the normalizer service.
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-900">Routing breakdown</h2>
          {results?.routingBreakdown?.length ? (
            <div className="space-y-2">
              {results.routingBreakdown.map((row) => (
                <div key={row.routing}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-600">{row.routing.replace("_", " ")}</span>
                    <span className="font-semibold">{row.count} · {pct(row.count / routingTotal)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(row.count / routingTotal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No normalized line items yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold text-slate-900">Synthetic OCR batch</h2>
          <p className="mb-4 text-sm text-slate-500">
            Runs fake OCR invoices from the 1000-invoice dataset through the worker and normalizer.
          </p>
          <div className="flex items-end gap-2">
            <div>
              <label className="label">Invoices</label>
              <input type="number" min={1} max={1000} className="input w-28" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
            </div>
            <Button
              icon={running ? Loader2 : Play}
              disabled={running}
              onClick={async () => {
                if (!token) return;
                try {
                  setBatch((await api.startAdminBatch(token, limit)) as BatchStatus);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed to start batch");
                }
              }}
            >
              {running ? "Running…" : "Run batch"}
            </Button>
          </div>
          {batch && batch.state !== "idle" && (
            <div className="mt-4 text-sm">
              <div className="mb-1 flex justify-between">
                <span className="text-slate-500 capitalize">{batch.stage}</span>
                <span>{batch.processedInvoices ?? 0}/{batch.totalInvoices ?? 0}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-brand-500 transition-all"
                  style={{ width: `${batch.totalInvoices ? ((batch.processedInvoices ?? 0) / batch.totalInvoices) * 100 : 0}%` }}
                />
              </div>
              {batch.errorMessage && <p className="mt-2 text-rose-600">{batch.errorMessage}</p>}
              {batch.logs && batch.logs.length > 0 && (
                <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] text-slate-100">
                  {batch.logs.slice(-12).join("\n")}
                </pre>
              )}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-900">Top canonical matches</h2>
          {results?.topCanonicals?.length ? (
            <table className="table-base">
              <tbody>
                {results.topCanonicals.slice(0, 10).map((row) => (
                  <tr key={row.canonicalName}>
                    <td>{row.canonicalName}</td>
                    <td className="text-right font-semibold">{row.matchCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-400">No matches yet.</p>
          )}
        </Card>
      </div>
    </>
  );
}
