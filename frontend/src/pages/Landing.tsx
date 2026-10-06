import { ArrowRight, Boxes, CalendarDays, FileSpreadsheet, ScanLine, ShoppingCart, Sparkles, type LucideIcon } from "lucide-react";

import { Logo } from "@/components/Layout";
import { Badge } from "@/components/ui";

const workflow: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: ScanLine,
    title: "Photograph invoices",
    body: "Snap delivery invoices and receipts with your phone. Model 1 extracts vendor, date, totals, and line items with per-field confidence.",
  },
  {
    icon: Sparkles,
    title: "Normalize ingredients",
    body: "Hybrid string + embedding matching maps “tomato”, “tomotoh”, and “roma tomato” to one canonical ingredient. Low-confidence matches come to you for review.",
  },
  {
    icon: FileSpreadsheet,
    title: "Keep a clean ledger",
    body: "Normalized items update your inventory ledger automatically, with one-click Excel export.",
  },
  {
    icon: CalendarDays,
    title: "Plan events",
    body: "Enter catering orders and events, pick recipes and serving counts, and see exact ingredient requirements by event, week, or month.",
  },
  {
    icon: ShoppingCart,
    title: "Reorder smartly",
    body: "Requirements are checked against inventory to produce an explainable reorder list tied to the events that drive each shortage.",
  },
  {
    icon: Boxes,
    title: "Forecast (coming soon)",
    body: "Model 3 will refine reorder quantities with short-term demand forecasts beyond scheduled events.",
  },
];

const previewRows = [
  { raw: "TOMATOES ROMA 25LB CASE", canonical: "Tomato", qty: "11.34 kg", conf: "97%", tone: "green" as const, route: "Auto-commit" },
  { raw: "CHKN BRST 10LB", canonical: "Chicken Breast", qty: "4.54 kg", conf: "91%", tone: "green" as const, route: "Auto-commit" },
  { raw: "EVOO 3L TIN", canonical: "Olive Oil", qty: "3 l", conf: "72%", tone: "amber" as const, route: "Needs review" },
  { raw: "MOZZ FRSH LOG", canonical: "Mozzarella", qty: "2 kg", conf: "64%", tone: "amber" as const, route: "Needs review" },
];

export function Landing() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
      <header className="flex h-20 items-center justify-between">
        <Logo />
        <a
          href="#/login"
          className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Login
        </a>
      </header>

      <section className="pt-10 pb-8 text-center">
        <h1 className="font-display text-[2.4rem] leading-[1.12] font-bold tracking-tight text-slate-900 sm:text-[3.4rem] lg:text-[4.1rem]">
          Photo-first inventory for
          <br />
          <span className="text-emerald-500">Smarter Restaurant Operations</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-slate-500">
          ChefVision AI turns messy invoices, inconsistent supplier names, and scattered event notes into a clean
          inventory ledger and an explainable reorder list.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <a
            href="#/login"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-500/20 hover:bg-brand-600"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#workflow"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            How it works
          </a>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/95 bg-white/70 p-2.5 shadow-xl shadow-emerald-500/10 backdrop-blur-2xl">
        <div className="flex items-center gap-1.5 rounded-t-[22px] border-b border-slate-200/70 bg-slate-100/90 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
          <span className="mx-auto rounded-lg border border-slate-200/80 bg-white/90 px-3 py-1 font-mono text-[11px] text-slate-600">
            app.chefvision.ai/receipts/review
          </span>
        </div>
        <div className="overflow-x-auto rounded-b-[22px] bg-white/95 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Roma Farms — invoice normalized
            </div>
            <Badge tone="green">4 line items</Badge>
          </div>
          <table className="table-base">
            <thead>
              <tr>
                <th>Supplier text</th>
                <th>Canonical ingredient</th>
                <th>Normalized qty</th>
                <th>Routing</th>
                <th className="text-right">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row) => (
                <tr key={row.raw}>
                  <td className="font-mono text-xs text-slate-500">{row.raw}</td>
                  <td className="font-semibold text-slate-900">{row.canonical}</td>
                  <td>{row.qty}</td>
                  <td>
                    <Badge tone={row.tone}>{row.route}</Badge>
                  </td>
                  <td className="text-right font-bold text-slate-900">{row.conf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="workflow" className="py-16">
        <div className="mx-auto mb-8 max-w-lg text-center">
          <span className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase">How it works</span>
          <h2 className="font-display mt-1 text-2xl font-bold text-slate-900">From invoice photo to reorder list</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {workflow.map((step) => (
            <div key={step.title} className="rounded-2xl bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs leading-relaxed text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-slate-400">
        ChefVision AI · CMPE 295 · San Jose State University
      </footer>
    </div>
  );
}
