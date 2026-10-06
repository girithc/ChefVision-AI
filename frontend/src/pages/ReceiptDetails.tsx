import { useState } from "react";
import { ArrowLeft, Pencil, RefreshCw, Save, Trash2 } from "lucide-react";

import { ReceiptEditor } from "@/components/ReceiptEditor";
import { Badge, Button, Card, Confidence, EmptyState, Notice, PageHeader, type BadgeTone } from "@/components/ui";
import { useApp } from "@/lib/app-context";
import { currency, formatDate } from "@/lib/cn";
import { receiptSubtotal, receiptTotal } from "@/lib/planning";
import { statusBadge } from "@/lib/receipt-status";
import { navigate } from "@/lib/router";
import type { NormalizationRouting, Receipt } from "@/lib/types";
import { fmtQty } from "@/lib/units";

const routingBadge: Record<NormalizationRouting, { tone: BadgeTone; label: string }> = {
  auto_commit: { tone: "green", label: "Auto-committed" },
  needs_review: { tone: "amber", label: "Needs review" },
  new_ingredient: { tone: "violet", label: "New ingredient" },
};

/** Screen 4: full details of one receipt, including normalization results from the API. */
export function ReceiptDetails({ id }: { id: string }) {
  const { receipts, saveReceipt, deleteReceipt, submitReceipt, offline } = useApp();
  const receipt = receipts.find((entry) => entry.id === id);
  const [draft, setDraft] = useState<Receipt | null>(null);
  const [busy, setBusy] = useState(false);

  if (!receipt) {
    return (
      <EmptyState
        icon={ArrowLeft}
        title="Receipt not found"
        description="It may have been deleted."
        action={<Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>}
      />
    );
  }

  const badge = statusBadge[receipt.status];
  const canResubmit = !offline && (receipt.status === "error" || receipt.status === "local");

  async function resubmit(target: Receipt) {
    setBusy(true);
    await submitReceipt(target);
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mb-3 flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </button>
      <PageHeader
        title={receipt.supplier || "Unknown supplier"}
        subtitle={`${formatDate(receipt.date)}${receipt.invoiceNumber ? ` · Invoice ${receipt.invoiceNumber}` : ""} · ${receipt.source === "scan" ? "Scanned" : "Manual entry"}`}
        actions={
          draft ? (
            <>
              <Button variant="secondary" onClick={() => setDraft(null)}>Cancel</Button>
              <Button
                icon={Save}
                onClick={() => {
                  saveReceipt(draft);
                  setDraft(null);
                }}
              >
                Save changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  if (confirm("Delete this receipt?")) {
                    deleteReceipt(receipt.id);
                    navigate("/dashboard");
                  }
                }}
              >
                Delete
              </Button>
              <Button variant="secondary" icon={Pencil} onClick={() => setDraft(receipt)}>Edit</Button>
              {canResubmit && (
                <Button icon={RefreshCw} disabled={busy} onClick={() => resubmit(receipt)}>
                  {busy ? "Submitting…" : "Submit to inventory"}
                </Button>
              )}
            </>
          )
        }
      />

      {receipt.status === "error" && (
        <div className="mb-4"><Notice tone="rose">Processing failed: {receipt.statusMessage ?? "unknown error"}</Notice></div>
      )}

      {draft ? (
        <Card>
          <Notice tone="sky">
            Edits here update this receipt record. Inventory already committed by the API is not changed; resubmit if
            quantities were wrong.
          </Notice>
          <div className="mt-4">
            <ReceiptEditor receipt={draft} onChange={setDraft} />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <Card>
            <h2 className="mb-3 font-semibold text-slate-900">Line items</h2>
            <div className="overflow-x-auto">
              <table className="table-base min-w-[560px]">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit price</th>
                    <th className="text-right">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, index) => (
                    <tr key={index}>
                      <td className="font-medium text-slate-900">{item.name}</td>
                      <td>{fmtQty(item.qty)} {item.unit}</td>
                      <td>{currency.format(item.unitPrice)}</td>
                      <td className="text-right font-medium">{currency.format(item.qty * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="h-fit space-y-2 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Summary</span>
              <Badge tone={badge.tone}>{badge.label}</Badge>
            </div>
            <SummaryRow label="Subtotal" value={currency.format(receiptSubtotal(receipt))} />
            <SummaryRow label="Tax" value={currency.format(receipt.tax)} />
            {receipt.tip > 0 && <SummaryRow label="Tip" value={currency.format(receipt.tip)} />}
            <div className="border-t border-slate-100 pt-2">
              <SummaryRow label="Total" value={<span className="text-lg font-bold">{currency.format(receiptTotal(receipt))}</span>} />
            </div>
            {receipt.notes && <p className="pt-2 text-slate-500">{receipt.notes}</p>}
            {receipt.invoiceId && <p className="pt-2 font-mono text-[11px] break-all text-slate-400">API invoice {receipt.invoiceId}</p>}
          </Card>
        </div>
      )}

      {!draft && receipt.normalized && receipt.normalized.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-semibold text-slate-900">Ingredient normalization</h2>
          <p className="mb-3 text-sm text-slate-500">
            How each supplier line was matched to the canonical catalog. Auto-committed items were added to inventory.
          </p>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[560px]">
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
                {receipt.normalized.map((item) => {
                  const route = item.routing ? routingBadge[item.routing] : null;
                  return (
                    <tr key={item.id}>
                      <td className="font-mono text-xs text-slate-500">{item.rawName}</td>
                      <td className="font-semibold text-slate-900">{item.canonicalName ?? "—"}</td>
                      <td>
                        {item.normalizedQty !== null ? `${fmtQty(item.normalizedQty)} ${item.normalizedUnit ?? ""}` : "—"}
                      </td>
                      <td>{route ? <Badge tone={route.tone}>{route.label}</Badge> : <Badge>Pending</Badge>}</td>
                      <td className="text-right"><Confidence value={item.confidence} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
