const tokenKey = "chefvision-demo-token";
const page = document.body.dataset.page;

const authCard = document.getElementById("auth-card");
const loginForm = document.getElementById("login-form");
const authMessage = document.getElementById("auth-message");

let token = localStorage.getItem(tokenKey);
let pollHandle = null;
let lastLogLength = 0;

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(loginForm);
  if (authMessage) authMessage.textContent = "signing in…";

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });
    const payload = await response.json();
    if (!response.ok || !payload.token) throw new Error(payload.error ?? "login failed");
    token = payload.token;
    localStorage.setItem(tokenKey, token);
    if (authMessage) authMessage.textContent = "";
    authCard?.classList.add("hidden");
    revealPanel();
    await bootstrap();
  } catch (error) {
    if (authMessage) authMessage.textContent = error instanceof Error ? error.message : "login failed";
  }
});

window.addEventListener("load", async () => {
  if (!token) return;
  authCard?.classList.add("hidden");
  revealPanel();
  await bootstrap();
});

function revealPanel() {
  document.getElementById("run-panel")?.classList.remove("hidden");
  document.getElementById("results-panel")?.classList.remove("hidden");
}

async function bootstrap() {
  if (page === "run") {
    await loadRunPage();
    pollHandle = window.setInterval(() => void loadRunPage(), 1500);
    bindBatchStart();
  }
  if (page === "results") {
    await loadResultsPage();
    pollHandle = window.setInterval(() => void loadResultsPage(), 5000);
  }
}

function bindBatchStart() {
  const form = document.getElementById("batch-form");
  const button = document.getElementById("start-batch-button");
  const limit = document.getElementById("batch-limit");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    button.disabled = true;
    lastLogLength = 0;
    try {
      await authedFetch("/admin/demo/batch/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: Number(limit.value || 1000) })
      });
      await loadRunPage();
    } catch (error) {
      alert(error instanceof Error ? error.message : "batch start failed");
    } finally {
      button.disabled = false;
    }
  });
}

async function loadRunPage() {
  try {
    const response = await authedFetch("/admin/demo/pipeline");
    const data = await response.json();
    renderBatchStatus(data.batchStatus);
    renderRuntimeKv(data.modelInfo);
    renderDatasetKv(data.dataset);
    renderReportSummary(data.latestReport);
  } catch (error) {
    console.warn(error);
  }
}

const openInvoiceIds = new Set();
const invoiceDetailCache = new Map();

async function loadResultsPage() {
  try {
    const response = await authedFetch("/admin/demo/results");
    const data = await response.json();
    renderMetrics(document.getElementById("totals-grid"), data.totals);
    renderMetrics(document.getElementById("invoice-statuses"), arrayToMap(data.invoiceStatuses, "status"));
    renderMetrics(document.getElementById("routing-breakdown"), arrayToMap(data.routingBreakdown, "routing"));
    renderTable(document.getElementById("top-inventory"), data.topInventory);
    renderTable(document.getElementById("top-canonicals"), data.topCanonicals);
    renderInvoicesTable(document.getElementById("recent-invoices"), data.recentInvoices);
    renderTable(document.getElementById("recent-line-items"), data.recentLineItems);
    const el = document.getElementById("report-json");
    el.textContent = data.report ? JSON.stringify(data.report, null, 2) : "no report yet.";
  } catch (error) {
    console.warn(error);
  }
}

function renderInvoicesTable(container, rows) {
  if (!container) return;
  if (!rows?.length) { container.innerHTML = '<p class="empty" style="padding:14px">no rows yet.</p>'; return; }
  const columns = Object.keys(rows[0]);
  const header = columns.map((c) => `<th>${prettify(c)}</th>`).join("");
  const body = rows.map((row) => {
    const id = row.id ?? "";
    const isOpen = openInvoiceIds.has(id);
    const cells = columns.map((c) => `<td>${escapeHtml(formatCell(row[c]))}</td>`).join("");
    const mainRow = `<tr class="expandable${isOpen ? " open" : ""}" data-invoice-id="${escapeHtml(id)}">${cells}</tr>`;
    const detailRow = isOpen
      ? `<tr class="detail-row" data-detail-for="${escapeHtml(id)}"><td colspan="${columns.length}">${detailBodyHtml(id)}</td></tr>`
      : "";
    return mainRow + detailRow;
  }).join("");
  container.innerHTML = `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;

  container.querySelectorAll("tr.expandable").forEach((tr) => {
    tr.addEventListener("click", () => toggleInvoiceRow(tr.dataset.invoiceId));
  });
}

function detailBodyHtml(invoiceId) {
  const detail = invoiceDetailCache.get(invoiceId);
  if (!detail) {
    return `<div class="detail-panel"><div class="empty" style="padding:14px">loading<span class="loading-dot"></span></div></div>`;
  }
  if (detail.error) {
    return `<div class="detail-panel"><div class="empty" style="padding:14px">error: ${escapeHtml(detail.error)}</div></div>`;
  }
  const inv = detail.invoice ?? {};
  const items = detail.lineItems ?? [];
  const raw = detail.rawText ?? "(no raw text available)";

  const meta = {
    id: inv.id,
    supplier: inv.supplierName,
    invoiceDate: inv.invoiceDate,
    status: inv.status,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt
  };
  const metaHtml = Object.entries(meta).map(
    ([k, v]) => `<div class="kv"><span>${prettify(k)}</span><strong>${escapeHtml(formatCell(v))}</strong></div>`
  ).join("");

  const itemsHtml = items.length
    ? `<table><thead><tr>
         <th>Raw</th><th>Qty</th><th>Unit</th><th>Canonical</th><th>Conf.</th><th>Routing</th>
       </tr></thead><tbody>${
         items.map((li) => `
           <tr>
             <td>${escapeHtml(formatCell(li.rawName))}</td>
             <td>${escapeHtml(formatCell(li.rawQty))}</td>
             <td>${escapeHtml(formatCell(li.rawUnit))}</td>
             <td>${escapeHtml(formatCell(li.canonicalName))}</td>
             <td>${escapeHtml(formatCell(li.confidence))}</td>
             <td>${li.routing ? `<span class="route-tag ${escapeHtml(li.routing)}">${escapeHtml(li.routing)}</span>` : "—"}</td>
           </tr>`).join("")
       }</tbody></table>`
    : '<p class="empty">no line items parsed.</p>';

  return `
    <div class="detail-panel">
      <div class="detail-block">
        <h3>Input · raw OCR text</h3>
        <pre class="detail-raw">${escapeHtml(raw)}</pre>
      </div>
      <div class="detail-block">
        <h3>Output · extraction + normalization</h3>
        <div class="detail-meta">${metaHtml}</div>
        <div class="table-wrap">${itemsHtml}</div>
      </div>
    </div>
  `;
}

async function toggleInvoiceRow(invoiceId) {
  if (!invoiceId) return;
  if (openInvoiceIds.has(invoiceId)) {
    openInvoiceIds.delete(invoiceId);
    refreshInvoiceRow(invoiceId);
    return;
  }
  openInvoiceIds.add(invoiceId);
  refreshInvoiceRow(invoiceId);
  if (!invoiceDetailCache.has(invoiceId)) {
    try {
      const response = await authedFetch(`/admin/demo/invoice/${encodeURIComponent(invoiceId)}`);
      const data = await response.json();
      invoiceDetailCache.set(invoiceId, data);
    } catch (error) {
      invoiceDetailCache.set(invoiceId, { error: error instanceof Error ? error.message : "failed" });
    }
    if (openInvoiceIds.has(invoiceId)) refreshInvoiceRow(invoiceId);
  }
}

function refreshInvoiceRow(invoiceId) {
  const container = document.getElementById("recent-invoices");
  if (!container) return;
  const mainTr = container.querySelector(`tr.expandable[data-invoice-id="${cssEscape(invoiceId)}"]`);
  if (!mainTr) return;
  const existingDetail = container.querySelector(`tr.detail-row[data-detail-for="${cssEscape(invoiceId)}"]`);
  const isOpen = openInvoiceIds.has(invoiceId);
  mainTr.classList.toggle("open", isOpen);
  if (isOpen) {
    const colCount = mainTr.children.length;
    const html = `<td colspan="${colCount}">${detailBodyHtml(invoiceId)}</td>`;
    if (existingDetail) {
      existingDetail.innerHTML = html;
    } else {
      const row = document.createElement("tr");
      row.className = "detail-row";
      row.dataset.detailFor = invoiceId;
      row.innerHTML = html;
      mainTr.after(row);
    }
  } else if (existingDetail) {
    existingDetail.remove();
  }
}

function cssEscape(value) {
  return String(value).replace(/["\\]/g, "\\$&");
}

function renderBatchStatus(status) {
  const chip = document.getElementById("batch-state-chip");
  const fill = document.getElementById("progress-fill");
  const count = document.getElementById("progress-count");
  const stage = document.getElementById("progress-stage");
  const log = document.getElementById("batch-log");

  const state = status.state ?? "idle";
  chip.textContent = state;
  chip.className = `chip ${state}`;

  const pct = status.totalInvoices ? Math.round((status.processedInvoices / status.totalInvoices) * 100) : 0;
  fill.style.width = `${pct}%`;
  count.textContent = `${status.processedInvoices ?? 0} / ${status.totalInvoices ?? 0}`;
  stage.textContent = status.stage ?? "—";

  const logs = status.logs ?? [];
  if (logs.length) {
    const wasAtBottom = log.scrollTop + log.clientHeight >= log.scrollHeight - 10;
    log.textContent = logs.join("\n");
    if (wasAtBottom || logs.length !== lastLogLength) log.scrollTop = log.scrollHeight;
    lastLogLength = logs.length;
  } else {
    log.textContent = "awaiting batch…";
  }
}

function renderRuntimeKv(info) {
  const container = document.getElementById("runtime-kv");
  if (!container) return;
  container.innerHTML = "";
  if (!info) { container.innerHTML = '<p class="empty">normalizer offline</p>'; return; }
  appendKv(container, info);
}

function renderDatasetKv(dataset) {
  const container = document.getElementById("dataset-kv");
  if (!container) return;
  container.innerHTML = "";
  appendKv(container, {
    invoiceCount: dataset.invoiceCount,
    totalExpectedLineItems: dataset.totalExpectedLineItems
  });
}

function appendKv(container, map) {
  for (const [label, value] of Object.entries(map)) {
    const row = document.createElement("div");
    row.className = "kv";
    row.innerHTML = `<span>${prettify(label)}</span><strong>${escapeHtml(formatCell(value))}</strong>`;
    container.appendChild(row);
  }
}

function renderReportSummary(report) {
  const container = document.getElementById("report-summary");
  if (!container) return;
  container.innerHTML = "";
  if (!report) {
    container.innerHTML = '<div class="metric"><span>Report</span><strong>none yet</strong></div>';
    return;
  }
  const summary = {
    invoiceCount: report.invoiceCount,
    completedInvoices: report.completedInvoices,
    failedInvoices: report.failedInvoices,
    totalExpectedLineItems: report.totalExpectedLineItems,
    totalExtractedLineItems: report.totalExtractedLineItems,
    rawNameMatchRate: report.rawNameMatchRate,
    canonicalMatchRate: report.canonicalMatchRate
  };
  renderMetrics(container, summary);
}

function renderMetrics(container, metrics) {
  if (!container) return;
  container.innerHTML = "";
  if (!metrics || !Object.keys(metrics).length) {
    container.innerHTML = '<div class="metric"><span>Status</span><strong>—</strong></div>';
    return;
  }
  for (const [label, value] of Object.entries(metrics)) {
    const card = document.createElement("div");
    card.className = "metric";
    card.innerHTML = `<span>${prettify(label)}</span><strong>${escapeHtml(formatCell(value))}</strong>`;
    container.appendChild(card);
  }
}

function renderTable(container, rows) {
  if (!container) return;
  if (!rows?.length) { container.innerHTML = '<p class="empty" style="padding:14px">no rows yet.</p>'; return; }
  const columns = Object.keys(rows[0]);
  const header = columns.map((c) => `<th>${prettify(c)}</th>`).join("");
  const body = rows.map((row) =>
    `<tr>${columns.map((c) => `<td>${escapeHtml(formatCell(row[c]))}</td>`).join("")}</tr>`
  ).join("");
  container.innerHTML = `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
}

function arrayToMap(rows, key) {
  return Object.fromEntries((rows ?? []).map((r) => [r[key], r.count]));
}

async function authedFetch(url, init = {}) {
  if (!token) throw new Error("not logged in");
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(url, { ...init, headers });
  if (response.status === 401) {
    localStorage.removeItem(tokenKey);
    token = null;
    authCard?.classList.remove("hidden");
    document.getElementById("run-panel")?.classList.add("hidden");
    document.getElementById("results-panel")?.classList.add("hidden");
    throw new Error("session expired");
  }
  if (!response.ok) {
    let message = `request failed: ${response.status}`;
    try { message = (await response.json()).error ?? message; } catch {}
    throw new Error(message);
  }
  return response;
}

function prettify(value) {
  return String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function formatCell(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  }
  return String(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

window.addEventListener("beforeunload", () => { if (pollHandle) clearInterval(pollHandle); });
