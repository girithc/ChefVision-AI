import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, DollarSign, PenLine, Receipt as ReceiptIcon, ScanLine, Search, Sparkles, Trash2, TrendingUp, TriangleAlert, WifiOff } from "lucide-react";

import { Badge, Button, Card, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { useApp } from "@/lib/app-context";
import { currency, formatDate } from "@/lib/cn";
import { receiptTotal } from "@/lib/planning";
import { navigate } from "@/lib/router";
import { needsReviewCount, statusBadge } from "@/lib/receipt-status";

/** Screen 1: receipts list with summary statistics, search, and quick delete. */
export function Dashboard() {
  const { receipts, inventory, events, offline, deleteReceipt, loadSampleData } = useApp();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter(
      (receipt) =>
        receipt.supplier.toLowerCase().includes(q) ||
        receipt.invoiceNumber.toLowerCase().includes(q) ||
        receipt.items.some((item) => item.name.toLowerCase().includes(q)),
    );
  }, [receipts, query]);

  const totalSpent = receipts.reduce((sum, receipt) => sum + receiptTotal(receipt), 0);
  const reviewCount = receipts.reduce((sum, receipt) => sum + needsReviewCount(receipt), 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="All scanned and entered receipts."
        actions={
          <>
            <Button variant="secondary" icon={PenLine} onClick={() => navigate("/manual")}>
              Manual entry
            </Button>
            <Button icon={ScanLine} onClick={() => navigate("/scan")}>
              Scan receipt
            </Button>
          </>
        }
      />

      <section className="relative mb-6 overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50/80 to-cyan-50/60 p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-bold tracking-wider text-white uppercase">
              {offline ? <WifiOff className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              {offline ? "Offline workspace" : "Operations workspace live"}
            </span>
            <h2 className="font-display text-lg font-bold text-slate-900 sm:text-xl">From invoice intake to event-ready ordering</h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600">
              Review captured receipts, keep inventory current, and turn upcoming event demand into a focused reorder list.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-2">
            {[
              [inventory.length, "Inventory items"],
              [events.length, "Planned events"],
              [reviewCount, "Need review"],
            ].map(([value, label]) => (
              <div key={label} className="min-w-24 rounded-2xl border border-white/80 bg-white/75 px-3 py-2.5 text-center shadow-sm backdrop-blur">
                <div className="text-lg font-bold text-slate-900">{value}</div>
                <div className="text-[9px] font-semibold tracking-wide text-slate-400 uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap items-center gap-2 border-t border-emerald-100/80 pt-4 text-[11px] font-semibold text-slate-600">
          <button type="button" onClick={() => navigate('/scan')} className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 hover:bg-white">
            <ScanLine className="h-3.5 w-3.5 text-emerald-600" /> Capture receipt <ArrowRight className="h-3 w-3 text-slate-400" />
          </button>
          <button type="button" onClick={() => navigate('/events')} className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 hover:bg-white">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-600" /> Plan an event <ArrowRight className="h-3 w-3 text-slate-400" />
          </button>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total receipts" value={receipts.length} icon={ReceiptIcon} tone="indigo" />
        <StatCard label="Total spent" value={currency.format(totalSpent)} icon={DollarSign} />
        <StatCard
          label="Average cost"
          value={currency.format(receipts.length ? totalSpent / receipts.length : 0)}
          icon={TrendingUp}
          tone="sky"
        />
        <StatCard label="Items needing review" value={reviewCount} icon={TriangleAlert} tone="amber" />
      </div>

      <Card>
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search supplier, invoice #, or item…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {receipts.length === 0 ? (
          <EmptyState
            icon={ReceiptIcon}
            title="No receipts yet"
            description="Scan an invoice photo or enter one manually to start building your inventory."
            action={
              <div className="flex gap-2">
                <Button icon={ScanLine} onClick={() => navigate("/scan")}>
                  Scan receipt
                </Button>
                <Button variant="secondary" onClick={loadSampleData}>
                  Load sample data
                </Button>
              </div>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base min-w-[640px]">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((receipt) => {
                  const badge = statusBadge[receipt.status];
                  const review = needsReviewCount(receipt);
                  return (
                    <tr
                      key={receipt.id}
                      className="cursor-pointer hover:bg-slate-50/80"
                      onClick={() => navigate(`/receipts/${receipt.id}`)}
                    >
                      <td className="font-semibold text-slate-900">
                        {receipt.supplier || "Unknown supplier"}
                        <div className="text-xs font-normal text-slate-400 capitalize">{receipt.source}</div>
                      </td>
                      <td>{formatDate(receipt.date)}</td>
                      <td className="font-mono text-xs">{receipt.invoiceNumber || "—"}</td>
                      <td>{receipt.items.length}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          <Badge tone={badge.tone}>{badge.label}</Badge>
                          {review > 0 && <Badge tone="amber">{review} to review</Badge>}
                        </div>
                      </td>
                      <td className="text-right font-semibold">{currency.format(receiptTotal(receipt))}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          aria-label="Delete receipt"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (confirm(`Delete receipt from ${receipt.supplier || "unknown supplier"}?`)) {
                              deleteReceipt(receipt.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No receipts match “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
