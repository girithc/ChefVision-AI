import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Download, PackageX, ShoppingCart, TriangleAlert } from "lucide-react";

import { Badge, Button, Card, EmptyState, PageHeader, StatCard, type BadgeTone } from "@/components/ui";
import { downloadCsv } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { cn, formatDate, todayIso } from "@/lib/cn";
import { buildReorderLines, checkInventory, computeRequirements, type CheckStatus } from "@/lib/planning";
import { navigate } from "@/lib/router";
import { fmtQty } from "@/lib/units";

const statusBadge: Record<CheckStatus, { tone: BadgeTone; label: string }> = {
  ok: { tone: "green", label: "Sufficient" },
  short: { tone: "amber", label: "Short" },
  missing: { tone: "rose", label: "Not in stock" },
  unit_mismatch: { tone: "violet", label: "Unit mismatch" },
};

type Scope = "upcoming" | "7" | "30" | "custom";

/** Screens 8–9: compare event requirements with inventory, select shortages, and build a reorder list. */
export function Reorder() {
  const { events, recipes, inventory } = useApp();
  const [scope, setScope] = useState<Scope>("upcoming");
  const [customIds, setCustomIds] = useState<string[]>([]);
  const [bufferPct, setBufferPct] = useState(10);
  const [deselected, setDeselected] = useState<Set<string>>(new Set());
  const [showOk, setShowOk] = useState(false);

  const today = todayIso();
  const upcoming = useMemo(
    () => events.filter((event) => event.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [events, today],
  );

  const selectedEvents = useMemo(() => {
    if (scope === "custom") return upcoming.filter((event) => customIds.includes(event.id));
    if (scope === "upcoming") return upcoming;
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + Number(scope));
    const limit = todayIso(horizon);
    return upcoming.filter((event) => event.date <= limit);
  }, [scope, upcoming, customIds]);

  const rows = useMemo(
    () => checkInventory(computeRequirements(selectedEvents, recipes), inventory),
    [selectedEvents, recipes, inventory],
  );
  const reorderLines = useMemo(() => buildReorderLines(rows, bufferPct), [rows, bufferPct]);
  const chosen = reorderLines.filter((line) => !deselected.has(line.key));
  const shortCount = rows.filter((row) => row.status !== "ok").length;
  const visibleRows = showOk ? rows : rows.filter((row) => row.status !== "ok");

  const toggle = (key: string) => {
    const next = new Set(deselected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setDeselected(next);
  };

  return (
    <>
      <PageHeader
        title="Inventory Check & Reorder"
        subtitle="Requirements from planned events compared with current inventory."
      />

      <Card className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div>
            <label className="label">Plan horizon</label>
            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
              {(
                [
                  ["7", "Next 7 days"],
                  ["30", "Next 30 days"],
                  ["upcoming", "All upcoming"],
                  ["custom", "Pick events"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScope(value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium",
                    scope === value ? "bg-white text-brand-700 shadow-xs" : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="buffer">Safety buffer</label>
            <div className="flex items-center gap-2">
              <input
                id="buffer"
                type="number"
                min={0}
                max={100}
                className="input w-20"
                value={bufferPct}
                onChange={(e) => setBufferPct(Math.max(0, Number(e.target.value)))}
              />
              <span className="text-sm text-slate-500">%</span>
            </div>
          </div>
        </div>
        {scope === "custom" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {upcoming.map((event) => {
              const on = customIds.includes(event.id);
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setCustomIds(on ? customIds.filter((id) => id !== event.id) : [...customIds, event.id])}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm",
                    on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600",
                  )}
                >
                  {event.name} · {formatDate(event.date)}
                </button>
              );
            })}
            {upcoming.length === 0 && <span className="text-sm text-slate-400">No upcoming events.</span>}
          </div>
        )}
      </Card>

      {selectedEvents.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No events in this horizon"
            description="Plan an event with recipes to compute ingredient requirements."
            action={<Button onClick={() => navigate("/events")}>Go to events</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Events in plan" value={selectedEvents.length} icon={ClipboardList} tone="indigo" />
            <StatCard label="Ingredients needed" value={rows.length} icon={ShoppingCart} tone="sky" />
            <StatCard label="Sufficient" value={rows.length - shortCount} icon={CheckCircle2} />
            <StatCard label="Shortages" value={shortCount} icon={PackageX} tone="rose" />
          </div>

          <Card className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Inventory check</h2>
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <input type="checkbox" checked={showOk} onChange={(e) => setShowOk(e.target.checked)} />
                Show sufficient items
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="table-base min-w-[560px]">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th className="text-right">Needed</th>
                    <th className="text-right">On hand</th>
                    <th className="text-right">Shortage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.key}>
                      <td className="font-medium text-slate-900">{row.name}</td>
                      <td className="text-right tabular-nums">{fmtQty(row.qty)} {row.unit}</td>
                      <td className="text-right tabular-nums">
                        {row.status === "missing" ? "—" : `${fmtQty(row.onHand)} ${row.status === "unit_mismatch" ? row.inventoryUnit : row.unit}`}
                      </td>
                      <td className={cn("text-right font-semibold tabular-nums", row.shortage > 0 ? "text-rose-600" : "text-slate-300")}>
                        {row.shortage > 0 ? `${fmtQty(row.shortage)} ${row.unit}` : "—"}
                      </td>
                      <td><Badge tone={statusBadge[row.status].tone}>{statusBadge[row.status].label}</Badge></td>
                    </tr>
                  ))}
                  {visibleRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-emerald-600">
                        Inventory covers every ingredient for these events.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {reorderLines.length > 0 && (
            <Card>
              <div className="mb-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <h2 className="font-semibold text-slate-900">Reorder list</h2>
                <Button
                  icon={Download}
                  disabled={chosen.length === 0}
                  onClick={() =>
                    downloadCsv(
                      [["Ingredient", "Order Qty", "Unit", "Reason"], ...chosen.map((line) => [line.name, line.qty, line.unit, line.reason])],
                      `reorder-${today}.csv`,
                    )
                  }
                >
                  Export {chosen.length} item{chosen.length === 1 ? "" : "s"}
                </Button>
              </div>
              <p className="mb-4 text-sm text-slate-500">Select the items to include. Each quantity explains which events drive it.</p>
              <ul className="space-y-2">
                {reorderLines.map((line) => {
                  const on = !deselected.has(line.key);
                  return (
                    <li
                      key={line.key}
                      className={cn("flex gap-3 rounded-xl border p-3", on ? "border-brand-200 bg-brand-50/40" : "border-slate-100 opacity-60")}
                    >
                      <input type="checkbox" className="mt-1" checked={on} onChange={() => toggle(line.key)} aria-label={`Include ${line.name}`} />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-semibold text-slate-900">{line.name}</span>
                          <span className="font-bold text-brand-700 tabular-nums">{fmtQty(line.qty)} {line.unit}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{line.reason}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {rows.some((row) => row.status === "unit_mismatch") && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-violet-700">
                  <TriangleAlert className="h-3.5 w-3.5" /> Some ingredients use units that cannot be converted to the inventory
                  unit (e.g. “each” vs kg). Their full requirement is listed.
                </p>
              )}
            </Card>
          )}
        </>
      )}
    </>
  );
}
