import { useState } from "react";
import { Boxes, Download, RefreshCw, Search } from "lucide-react";

import { Button, Card, EmptyState, Notice, PageHeader } from "@/components/ui";
import * as api from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { navigate } from "@/lib/router";
import { fmtQty } from "@/lib/units";

/** Inventory ledger (UC5): normalized on-hand quantities with Excel export. */
export function Inventory() {
  const { inventory, inventoryError, refreshInventory, offline, session } = useApp();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const filtered = inventory.filter((item) => item.canonicalName.toLowerCase().includes(query.trim().toLowerCase()));

  async function exportSheet() {
    setExportError(null);
    try {
      if (offline || !session?.token) {
        api.downloadCsv(
          [["Ingredient", "On Hand Qty", "Unit"], ...inventory.map((item) => [item.canonicalName, fmtQty(item.onHandQty, 3), item.unit])],
          "inventory.csv",
        );
      } else {
        await api.downloadInventoryExport(session.token);
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed");
    }
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={
          offline
            ? "Offline mode: computed from saved receipts (no server-side normalization)."
            : "Inventory ledger updated by normalized invoice line items."
        }
        actions={
          <>
            {!offline && (
              <Button
                variant="secondary"
                icon={RefreshCw}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await refreshInventory();
                  setBusy(false);
                }}
              >
                Refresh
              </Button>
            )}
            <Button icon={Download} onClick={exportSheet} disabled={inventory.length === 0}>
              {offline ? "Export CSV" : "Export Excel"}
            </Button>
          </>
        }
      />

      {(inventoryError || exportError) && (
        <div className="mb-4"><Notice tone="rose">{inventoryError ?? exportError}</Notice></div>
      )}

      <Card>
        {inventory.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="Inventory is empty"
            description="Scan or enter invoices; auto-committed line items appear here."
            action={<Button onClick={() => navigate("/scan")}>Scan receipt</Button>}
          />
        ) : (
          <>
            <div className="relative mb-4 max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9" placeholder="Search ingredients…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
              <table className="table-base min-w-[560px]">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th className="text-right">On hand</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.canonicalId}>
                      <td className="font-medium text-slate-900">{item.canonicalName}</td>
                      <td className="text-right font-semibold tabular-nums">{fmtQty(item.onHandQty, 3)}</td>
                      <td className="text-slate-500">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
