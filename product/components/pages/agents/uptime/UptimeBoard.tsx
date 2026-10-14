"use client";

import { Fragment, useState } from "react";
import { Activity, CircleCheck, ChevronDown, Info } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { pipelineUptime as seedPipelines, type PipelineUptime } from "../traces/traceData";
import ArchitectureModal from "./ArchitectureModal";

const stateTone: Record<PipelineUptime["state"], Tone> = {
  Operational: "emerald",
  Degraded: "amber",
  Down: "rose",
};

export default function UptimeBoard() {
  const [pipelines, setPipelines] = useState<PipelineUptime[]>(seedPipelines);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [archPipeline, setArchPipeline] = useState<PipelineUptime | null>(null);

  function runTest(id: string) {
    if (testingId) return;
    setTestingId(id);
    window.setTimeout(() => {
      setPipelines((current) =>
        current.map((pipeline) =>
          pipeline.id === id
            ? {
                ...pipeline,
                runs: [
                  {
                    id: `test-${Date.now()}`,
                    startedAt: "Just now",
                    durationMs: 320,
                    status: "success",
                    detail: "Synthetic test run — all spans passed",
                  },
                  ...pipeline.runs,
                ],
                lastIncident: "Never",
                state: "Operational",
              }
            : pipeline
        )
      );
      setPassedIds((current) => [...current, id]);
      setTestingId(null);
    }, 900);
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="px-1 pb-3 text-xs font-bold text-slate-800">
        Pipeline uptime
      </div>
      <div className="overflow-hidden rounded-xl bg-white">
        {pipelines.map((pipeline) => {
          const expanded = expandedId === pipeline.id;
          const isTesting = testingId === pipeline.id;
          const passed = passedIds.includes(pipeline.id);
          return (
            <Fragment key={pipeline.id}>
              <div
                onClick={() => setExpandedId((current) => (current === pipeline.id ? null : pipeline.id))}
                className={`flex cursor-pointer flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/60 ${expanded ? "bg-white" : "border-b border-slate-100"}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-slate-900">{pipeline.name}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setArchPipeline(pipeline);
                      }}
                      aria-label={`Architecture — ${pipeline.name}`}
                      title="How this pipeline works"
                      className="shrink-0 rounded-md p-0.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-slate-500">
                    <span className={`inline-flex items-center gap-1 font-medium ${pipeline.state === "Operational" ? "text-emerald-600" : pipeline.state === "Degraded" ? "text-amber-600" : "text-rose-600"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${pipeline.state === "Operational" ? "bg-emerald-500" : pipeline.state === "Degraded" ? "bg-amber-500" : "bg-rose-500"}`} />
                      {pipeline.state}
                    </span>
                    · {pipeline.successRate}% success · {pipeline.runsToday.toLocaleString()} runs today ·{" "}
                    {pipeline.avgLatencyMs >= 1000 ? `${(pipeline.avgLatencyMs / 1000).toFixed(1)}s` : `${pipeline.avgLatencyMs}ms`} avg
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    runTest(pipeline.id);
                  }}
                  disabled={Boolean(testingId)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    passed && !isTesting
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : isTesting
                        ? "border-slate-200 bg-slate-50 text-slate-500"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {isTesting ? (
                    <>
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-500" />
                      Testing…
                    </>
                  ) : passed ? (
                    <>
                      <CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Passed
                    </>
                  ) : (
                    <>
                      <Activity className="h-3.5 w-3.5" />
                      Test
                    </>
                  )}
                </button>
                <ChevronDown className={`h-4 w-4 shrink-0 text-slate-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </div>

              {expanded && (
                <div className="bg-slate-50/70 px-5 py-3">
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 bg-white">
                    {pipeline.runs.map((run) => (
                      <div key={run.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-[11px]">
                        <span className="font-semibold text-slate-900">{run.startedAt}</span>
                        <span className="min-w-0 flex-1 truncate px-3 text-slate-500">{run.detail}</span>
                        <span className="shrink-0 font-semibold text-slate-600">{(run.durationMs / 1000).toFixed(2)}s</span>
                        <StatusBadge label={run.status === "success" ? "Success" : "Error"} tone={run.status === "success" ? "emerald" : "rose"} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      <ArchitectureModal
        pipelineId={archPipeline?.id ?? null}
        pipelineName={archPipeline?.name ?? null}
        onClose={() => setArchPipeline(null)}
      />
    </div>
  );
}
