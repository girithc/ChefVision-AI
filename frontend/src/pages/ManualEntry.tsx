import { useState } from "react";
import { Loader2, Save } from "lucide-react";

import { ReceiptEditor } from "@/components/ReceiptEditor";
import { Button, Card, PageHeader } from "@/components/ui";
import { useApp } from "@/lib/app-context";
import { blankReceipt } from "@/lib/receipt-factory";
import { navigate } from "@/lib/router";

/** Screen 3: enter receipt data by hand when extraction is not correct or no photo exists. */
export function ManualEntry() {
  const { submitReceipt, offline } = useApp();
  const [receipt, setReceipt] = useState(() => blankReceipt("manual"));
  const [busy, setBusy] = useState(false);

  const valid = receipt.supplier.trim() && receipt.items.some((item) => item.name.trim() && item.qty > 0);

  async function save() {
    setBusy(true);
    const saved = await submitReceipt(receipt);
    navigate(`/receipts/${saved.id}`);
  }

  return (
    <>
      <PageHeader title="Manual Entry" subtitle="Enter item name, quantity, unit, and price for each line." />
      <Card>
        <ReceiptEditor receipt={receipt} onChange={setReceipt} />
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>Cancel</Button>
          <Button icon={busy ? Loader2 : Save} onClick={save} disabled={!valid || busy}>
            {busy ? "Saving…" : offline ? "Save receipt" : "Save & add to inventory"}
          </Button>
        </div>
      </Card>
    </>
  );
}
