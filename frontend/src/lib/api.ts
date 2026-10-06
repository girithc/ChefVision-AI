import type { InventoryRecord, InvoiceRecord, OcrResult, Receipt, Session } from "./types";

// Both default to same-origin prefixes that are proxied by Vite (dev) and nginx (Docker).
const API_URL = import.meta.env.VITE_API_URL ?? "/api";
const OCR_URL = import.meta.env.VITE_OCR_URL ?? "/ocr";

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, token: string | null, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.error ?? `Request failed (${response.status})`, response.status);
  }
  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  return request<{ token: string; role: Session["role"]; restaurantId: string }>("/auth/login", null, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/** Runs Model 1 (Ocr-Model-1 FastAPI service) on an invoice photo. */
export async function extractInvoiceImage(file: File): Promise<OcrResult> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${OCR_URL}/api/extract`, { method: "POST", body: form });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.detail ?? `OCR failed (${response.status})`, response.status);
  }
  return response.json() as Promise<OcrResult>;
}

/**
 * Submits a reviewed receipt to the API. The API's demo extractor accepts application/json
 * in the ExtractedInvoice shape, so the human-corrected OCR output is uploaded as JSON.
 */
export async function uploadReceipt(token: string, receipt: Receipt) {
  const payload = {
    supplierName: receipt.supplier || "Unknown Supplier",
    invoiceDate: receipt.date,
    lineItems: receipt.items
      .filter((item) => item.name.trim() && item.qty > 0)
      .map((item) => ({ rawName: item.name, rawQty: item.qty, rawUnit: item.unit || "each" })),
  };
  const form = new FormData();
  form.append("file", new Blob([JSON.stringify(payload)], { type: "application/json" }), `${receipt.id}.json`);
  return request<{ invoiceId: string; status: InvoiceRecord["status"]; createdAt: string }>(
    "/invoices/upload",
    token,
    { method: "POST", body: form },
  );
}

export async function getInvoice(token: string, invoiceId: string) {
  return request<InvoiceRecord>(`/invoices/${invoiceId}`, token);
}

/** Polls an invoice until the async worker finishes or the timeout elapses. */
export async function waitForInvoice(token: string, invoiceId: string, timeoutMs = 60_000): Promise<InvoiceRecord> {
  const started = Date.now();
  for (;;) {
    const invoice = await getInvoice(token, invoiceId);
    if (invoice.status === "done" || invoice.status === "error" || Date.now() - started > timeoutMs) {
      return invoice;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export async function getInventory(token: string) {
  const body = await request<{ items: InventoryRecord[] }>("/inventory", token);
  return body.items;
}

export async function downloadInventoryExport(token: string) {
  const response = await fetch(`${API_URL}/inventory/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new ApiError(`Export failed (${response.status})`, response.status);
  }
  downloadBlob(await response.blob(), "inventory.xlsx");
}

// Admin demo endpoints (shapes come from DashboardRepository and are rendered defensively)
export async function getAdminPipeline(token: string) {
  return request<Record<string, unknown>>("/admin/demo/pipeline", token);
}

export async function getAdminResults(token: string) {
  return request<Record<string, unknown>>("/admin/demo/results", token);
}

export async function startAdminBatch(token: string, limit: number) {
  return request<Record<string, unknown>>("/admin/demo/batch/start", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit }),
  });
}

export async function getAdminBatchStatus(token: string) {
  return request<Record<string, unknown>>("/admin/demo/batch/status", token);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(rows: Array<Array<string | number>>, filename: string) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
}
