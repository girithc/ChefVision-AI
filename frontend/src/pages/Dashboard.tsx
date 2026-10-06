import { useMemo, useState } from "react";
import { DollarSign, PenLine, Receipt as ReceiptIcon, ScanLine, Search, Trash2, TrendingUp, TriangleAlert } from "lucide-react";

import { Badge, Button, Card, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { useApp } from "@/lib/app-context";
import { currency, formatDate } from "@/lib/cn";
import { receiptTotal } from "@/lib/planning";
import { navigate } from "@/lib/router";
import { needsReviewCount, statusBadge } from "@/lib/receipt-status";

/** Screen 1: receipts list with summary statistics, search, and quick delete. */
export function Dashboard() {
  const { receipts, deleteReceipt, loadSampleData } = useApp();
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
