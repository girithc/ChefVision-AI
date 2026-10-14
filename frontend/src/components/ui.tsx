import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand-500 text-white shadow-sm shadow-brand-500/20 hover:bg-brand-600",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "text-rose-600 hover:bg-rose-50",
};

export function Button({
  variant = "primary",
  icon: Icon,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; icon?: LucideIcon }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-xs backdrop-blur", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const statTones = {
  emerald: "bg-emerald-50 text-emerald-600",
  indigo: "bg-indigo-50 text-indigo-600",
  sky: "bg-sky-50 text-sky-600",
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "emerald",
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: keyof typeof statTones;
}) {
  return (
    <Card className="p-4">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", statTones[tone])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-xs font-medium text-slate-400">{label}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </Card>
  );
}

const badgeTones = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  sky: "bg-sky-50 text-sky-700",
  slate: "bg-slate-100 text-slate-600",
  violet: "bg-violet-50 text-violet-700",
};

export type BadgeTone = keyof typeof badgeTones;

export function Badge({ tone = "slate", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold", badgeTones[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "amber", children }: { tone?: "amber" | "rose" | "sky" | "green"; children: ReactNode }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  return <div className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone])}>{children}</div>;
}

/** Colored confidence readout; thresholds match the normalizer (0.88 auto-commit, 0.55 review). */
export function Confidence({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <span className="text-slate-300">—</span>;
  const tone = value >= 0.88 ? "text-emerald-600" : value >= 0.55 ? "text-amber-600" : "text-rose-600";
  return <span className={cn("font-semibold tabular-nums", tone)}>{Math.round(value * 100)}%</span>;
}
