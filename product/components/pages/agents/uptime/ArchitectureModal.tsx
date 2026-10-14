"use client";

import { Brain, Cpu, Database, Info, User, Wrench, X } from "lucide-react";
import { pipelineArchitectures, type ArchitectureStage } from "../traces/traceData";

const kindIcon = {
  llm: Brain,
  ml: Cpu,
  tool: Wrench,
  human: User,
  data: Database,
} as const;

const kindTint: Record<ArchitectureStage["kind"], string> = {
  llm: "bg-violet-50 text-violet-600",
  ml: "bg-sky-50 text-sky-600",
  tool: "bg-slate-100 text-slate-600",
  human: "bg-emerald-50 text-emerald-600",
  data: "bg-amber-50 text-amber-600",
};

const kindLabel: Record<ArchitectureStage["kind"], string> = {
  llm: "LLM",
  ml: "ML model",
  tool: "System",
  human: "Human",
  data: "Data",
};

type ArchitectureModalProps = {
  pipelineId: string | null;
  pipelineName: string | null;
  onClose: () => void;
};

export default function ArchitectureModal({ pipelineId, pipelineName, onClose }: ArchitectureModalProps) {
  if (!pipelineId || !pipelineName) return null;
  const stages = pipelineArchitectures[pipelineId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      <div className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{pipelineName}</h3>
              <p className="mt-0.5 text-[10px] text-slate-400">How this pipeline works</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close architecture"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="app-scrollbar max-h-[65vh] overflow-y-auto px-5 py-4">
          <div className="space-y-0">
            {stages?.map((stage, index) => {
              const Icon = kindIcon[stage.kind];
              return (
                <div key={stage.title}>
                  <div className="flex items-start gap-3 py-2.5">
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${kindTint[stage.kind]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900">
                        {index + 1}. {stage.title}
                        <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                          {kindLabel[stage.kind]}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{stage.detail}</p>
                    </div>
                  </div>
                  {index < (stages?.length ?? 0) - 1 && <div className="ml-3.5 h-3 w-px bg-slate-200" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
