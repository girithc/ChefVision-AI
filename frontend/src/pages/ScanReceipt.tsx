import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, ImageUp, Loader2, RotateCcw, Send } from "lucide-react";

import { ReceiptEditor } from "@/components/ReceiptEditor";
import { Button, Card, Notice, PageHeader } from "@/components/ui";
import * as api from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/cn";
import { blankReceipt, receiptFromOcr } from "@/lib/receipt-factory";
import { navigate } from "@/lib/router";
import type { Receipt } from "@/lib/types";

type Stage = "capture" | "extracting" | "review" | "submitting";

/** Screen 2: capture an invoice photo, run Model 1, and review low-confidence fields before submitting. */
export function ScanReceipt() {
  const { submitReceipt, offline } = useApp();
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("capture");
  const [preview, setPreview] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [flaggedFields, setFlaggedFields] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, HEIC).");
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
    setStage("extracting");
    try {
      const ocr = await api.extractInvoiceImage(file);
      setReceipt(receiptFromOcr(ocr));
      setFlaggedFields(ocr.result.flagged_fields);
    } catch (err) {
      setError(
        `${err instanceof Error ? err.message : "OCR failed"}. The OCR service may be offline — enter the items manually below.`,
      );
      setReceipt({ ...blankReceipt("scan"), notes: `Photo: ${file.name}` });
      setFlaggedFields([]);
    }
    setStage("review");
  }

  async function submit() {
    if (!receipt) return;
    setStage("submitting");
    const saved = await submitReceipt(receipt);
    navigate(`/receipts/${saved.id}`);
  }

  function reset() {
    setStage("capture");
    setPreview(null);
    setReceipt(null);
    setFlaggedFields([]);
    setError(null);
  }

  const headerFlags = flaggedFields.filter((field) => !field.startsWith("line_items"));
  const unresolved = receipt?.items.filter((item) => item.flagged).length ?? 0;

  return (
    <>
      <PageHeader
        title="Scan Receipt"
        subtitle="Photograph a delivery invoice or receipt. Model 1 extracts the line items; you confirm anything it is unsure about."
        actions={stage !== "capture" && <Button variant="secondary" icon={RotateCcw} onClick={reset}>Start over</Button>}
      />

      {stage === "capture" && (
        <Card>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void handleFile(e.dataTransfer.files[0]);
            }}
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors",
              dragging ? "border-brand-500 bg-brand-50" : "border-slate-200",
            )}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <ImageUp className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-slate-800">Drop an invoice photo here</h3>
            <p className="mt-1 mb-5 text-sm text-slate-500">or choose a file / use your phone camera</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button icon={ImageUp} onClick={() => fileInput.current?.click()}>Choose file</Button>
              <Button variant="secondary" icon={Camera} onClick={() => cameraInput.current?.click()}>Take photo</Button>
            </div>
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => void handleFile(e.target.files?.[0])} />
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </div>
          {error && <div className="mt-4"><Notice tone="rose">{error}</Notice></div>}
        </Card>
      )}

      {stage !== "capture" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          <Card className="h-fit p-3">
            {preview && <img src={preview} alt="Invoice" className="w-full rounded-xl object-contain" />}
          </Card>

          <Card>
            {stage === "extracting" ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-brand-500" />
                Extracting vendor, date, totals, and line items…
              </div>
            ) : (
              receipt && (
                <div className="space-y-5">
                  {error && <Notice tone="amber">{error}</Notice>}
                  {!error && (
                    <Notice tone={headerFlags.length || unresolved ? "amber" : "green"}>
                      {headerFlags.length || unresolved ? (
                        <>
                          Extraction complete. Review the highlighted fields
                          {headerFlags.length > 0 && <> ({headerFlags.join(", ")})</>} before submitting.
                        </>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> All fields extracted with high confidence.
                        </span>
                      )}
                    </Notice>
                  )}
                  <ReceiptEditor receipt={receipt} onChange={setReceipt} flaggedFields={headerFlags} showTip={false} />
                  <div className="flex justify-end border-t border-slate-100 pt-4">
                    <Button icon={stage === "submitting" ? Loader2 : Send} onClick={submit} disabled={stage === "submitting"}>
                      {stage === "submitting"
                        ? "Normalizing…"
                        : offline
                          ? "Save receipt"
                          : "Confirm & add to inventory"}
                    </Button>
                  </div>
                </div>
              )
            )}
          </Card>
        </div>
      )}
    </>
  );
}
