import type { ReactNode } from "react";

export type Tone = "emerald" | "indigo" | "sky" | "amber" | "rose" | "slate";

export const toneText: Record<Tone, string> = {
  emerald: "text-emerald-700 bg-emerald-50",
  indigo: "text-indigo-700 bg-indigo-50",
  sky: "text-sky-700 bg-sky-50",
  amber: "text-amber-700 bg-amber-50",
  rose: "text-rose-700 bg-rose-50",
  slate: "text-slate-600 bg-slate-100",
};

export const toneBar: Record<Tone, string> = {
  emerald: "bg-emerald-500",
  indigo: "bg-indigo-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-500",
};

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold ${toneText[tone]}`}>
      {label}
    </span>
  );
}

export function ProgressBar({ value, tone }: { value: number; tone: Tone }) {
  return (
    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${toneBar[tone]}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function PrimaryButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800">
      {children}
    </button>
  );
}

export function GhostButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
      {children}
    </button>
  );
}
