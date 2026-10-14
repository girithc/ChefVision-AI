"use client";

import { CircleCheck, CircleX } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import type { TraceStep, TraceStepType } from "./traceData";

const stepTypeTone: Record<TraceStepType, Tone> = {
  chain: "slate",
  llm: "indigo",
  tool: "sky",
  retriever: "amber",
  model: "emerald",
};

const stepBarColor: Record<TraceStepType, string> = {
  chain: "bg-slate-500",
  llm: "bg-violet-500",
  tool: "bg-sky-500",
  retriever: "bg-amber-500",
  model: "bg-emerald-500",
};

function totalTokens(step: TraceStep): number {
  return (step.tokens ?? 0) + (step.children?.reduce((sum, child) => sum + totalTokens(child), 0) ?? 0);
}

function maxEnd(steps: TraceStep[]): number {
  return Math.max(...steps.map((step) => Math.max(step.endMs, maxEnd(step.children ?? []))));
}

function TraceRow({
  step,
  depth,
  totalMs,
}: {
  step: TraceStep;
  depth: number;
  totalMs: number;
}) {
  const left = (step.startMs / totalMs) * 100;
  const width = Math.max(((step.endMs - step.startMs) / totalMs) * 100, 1.5);
  const duration = step.endMs - step.startMs;

  return (
    <>
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 text-[11px]"
        style={{ paddingLeft: `${16 + depth * 22}px` }}
      >
        <StatusBadge label={step.type} tone={stepTypeTone[step.type]} />
        <span className={`min-w-0 flex-1 truncate font-semibold ${step.status === "error" ? "text-rose-600" : "text-slate-800"}`}>
          {step.name}
        </span>
        {step.tokens ? (
          <span className="shrink-0 text-[10px] text-slate-400">{step.tokens} tok</span>
        ) : null}
        <span className="relative hidden h-2 w-40 shrink-0 overflow-hidden rounded-full bg-slate-100 sm:block">
          <span
            className={`absolute inset-y-0 rounded-full ${step.status === "error" ? "bg-rose-500" : stepBarColor[step.type]}`}
            style={{ left: `${left}%`, width: `${width}%` }}
          />
        </span>
        <span className="w-14 shrink-0 text-right font-semibold text-slate-600">
          {(duration / 1000).toFixed(2)}s
        </span>
        {step.status === "success" ? (
          <CircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
        ) : (
          <CircleX className="h-3.5 w-3.5 shrink-0 text-rose-500" />
        )}
      </div>
      {step.children?.map((child) => (
        <TraceRow key={child.id} step={child} depth={depth + 1} totalMs={totalMs} />
      ))}
    </>
  );
}

export default function TraceView({ steps, name }: { steps: TraceStep[]; name: string }) {
  const totalMs = maxEnd(steps);
  const tokens = steps.reduce((sum, step) => sum + totalTokens(step), 0);
  const hasError = steps.some((step) => step.status === "error" || step.children?.some((child) => child.status === "error"));

  return (
    <div className="rounded-xl border border-slate-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="text-[11px] font-bold text-slate-800">Trace — {name}</div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>{(totalMs / 1000).toFixed(2)}s total</span>
          <span>·</span>
          <span>{tokens.toLocaleString()} tokens</span>
          <span>·</span>
          <span>~${((tokens / 1000) * 0.004).toFixed(4)} est.</span>
          <StatusBadge label={hasError ? "Error" : "Success"} tone={hasError ? "rose" : "emerald"} />
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {steps.map((step) => (
          <TraceRow key={step.id} step={step} depth={0} totalMs={totalMs} />
        ))}
      </div>
      <div className="border-t border-slate-100 px-4 py-2 text-[9px] text-slate-400">
        Waterfall bars show each span's share of the total run time — nested spans are indented under their parent.
      </div>
    </div>
  );
}
