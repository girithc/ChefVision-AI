import { CheckCheck, PenLine, ScanLine, Wrench } from "lucide-react";
import { PageHeader } from "../../shared/ui";

const quickActions = [
  {
    id: "capture",
    label: "Capture",
    detail: "Scan an invoice or delivery slip",
    icon: ScanLine,
  },
  {
    id: "note",
    label: "Quick Note",
    detail: "Log waste, prep, or counts by voice",
    icon: PenLine,
  },
  {
    id: "fix",
    label: "Fix it",
    detail: "Resolve items that need review",
    icon: Wrench,
  },
];

const tasks = [
  { title: "Approve PO-2842", detail: "Premium Meats Co. · $412.00" },
  { title: "Resolve 2 invoice items", detail: "Coastal Seafood · invoice_2041.jpg" },
  { title: "Confirm Harvest Dinner menu", detail: "100 guests · Oct 8" },
];

export default function OverviewPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Good morning, Marianne"
        action={
          <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  aria-label={action.label}
                  title={action.detail}
                  className={`inline-flex h-8 w-9 items-center justify-center bg-white text-slate-700 transition-colors hover:bg-slate-50 ${
                    index > 0 ? "border-l border-slate-200" : ""
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        }
      />

      <aside className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-5 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Today's focus</span>
          <h3 className="mt-2 font-display text-lg font-bold text-slate-900">3 decisions before service</h3>
          <div className="mt-4 space-y-2">
            {tasks.map((task) => (
              <div key={task.title} className="rounded-xl border border-white bg-white/85 px-3 py-2">
                <div className="text-xs font-semibold text-slate-900">{task.title}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{task.detail}</div>
              </div>
            ))}
          </div>
        </div>
        <button type="button" className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600">
          <CheckCheck className="h-4 w-4" />
          Resolve all
        </button>
      </aside>
    </div>
  );
}
