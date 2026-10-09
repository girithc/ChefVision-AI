"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  Boxes,
  CalendarCheck,
  CheckCheck,
  Download,
  FileText,
  LayoutGrid,
  List,
  LineChart,
  PanelLeftClose,
  Plus,
  ScanLine,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Warehouse,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AgentBuilderCanvas from "./AgentBuilderCanvas";

type NavId =
  | "overview"
  | "builder"
  | "suppliers"
  | "receipts"
  | "inventory"
  | "orders"
  | "events"
  | "analytics";

type Tone = "emerald" | "indigo" | "sky" | "amber" | "rose";

const navItems: Array<{ id: NavId; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "builder", label: "Agent Builder", icon: Workflow },
  { id: "suppliers", label: "Supplier CRM", icon: Users },
  { id: "receipts", label: "Receipts", icon: ScanLine },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "orders", label: "Purchase Orders", icon: ShoppingCart },
  { id: "events", label: "Events", icon: CalendarCheck },
  { id: "analytics", label: "Analytics", icon: LineChart },
];

const stats = [
  { icon: Users, label: "Active suppliers", value: "42", delta: "+4", tone: "emerald" as Tone },
  { icon: ShoppingCart, label: "Open purchase orders", value: "12", delta: "3 need review", tone: "indigo" as Tone },
  { icon: Warehouse, label: "Inventory value", value: "$28,940", delta: "Updated", tone: "sky" as Tone },
  { icon: AlertTriangle, label: "Stock-out risks", value: "3", delta: "High priority", tone: "rose" as Tone },
];

const suppliers = [
  { name: "Coastal Seafood", category: "Seafood", owner: "Jason Lee", status: "Attention", tone: "amber" as Tone, health: 68, delivery: "Oct 2" },
  { name: "Fresh Produce Co.", category: "Produce", owner: "Amelia Ruiz", status: "Healthy", tone: "emerald" as Tone, health: 94, delivery: "Oct 1" },
  { name: "Dry Goods Ltd.", category: "Dry goods", owner: "Noah Patel", status: "Healthy", tone: "emerald" as Tone, health: 91, delivery: "Oct 4" },
  { name: "Premium Meats Co.", category: "Protein", owner: "Olivia Chen", status: "Review", tone: "sky" as Tone, health: 74, delivery: "Oct 3" },
  { name: "Vine & Barrel", category: "Beverage", owner: "Ethan Walker", status: "Healthy", tone: "emerald" as Tone, health: 96, delivery: "Oct 6" },
];

const receiptInbox = [
  { vendor: "Coastal Seafood", file: "invoice_2041.jpg", items: "17 items", status: "Needs review", tone: "amber" as Tone },
  { vendor: "Fresh Produce Co.", file: "delivery_slip_88.jpg", items: "24 items", status: "Published", tone: "emerald" as Tone },
  { vendor: "Dry Goods Ltd.", file: "invoice_7231.pdf", items: "31 items", status: "Queued", tone: "sky" as Tone },
  { vendor: "Vine & Barrel", file: "receipt_112.jpg", items: "9 items", status: "Queued", tone: "sky" as Tone },
];

const extractedLines = [
  { raw: "org tom 5lb", match: "Organic Roma Tomatoes", qty: "5 lb", price: "$18.40", status: "Confirmed", tone: "emerald" as Tone, confidence: "99%" },
  { raw: "snapper fillet 8lb", match: "Red Snapper Fillet", qty: "8 lb", price: "$104.00", status: "Needs review", tone: "amber" as Tone, confidence: "91%" },
  { raw: "baby spinch 3", match: "Baby Spinach", qty: "3 lb", price: "$11.25", status: "Needs review", tone: "amber" as Tone, confidence: "92%" },
  { raw: "ev oo 3L", match: "Extra Virgin Olive Oil", qty: "3 L", price: "$54.90", status: "Confirmed", tone: "emerald" as Tone, confidence: "98%" },
  { raw: "arborio 20", match: "Arborio Rice", qty: "20 lb", price: "$62.00", status: "Confirmed", tone: "emerald" as Tone, confidence: "97%" },
];

const inventory = [
  { name: "Organic Roma Tomatoes", category: "Produce", onHand: "34 lb", par: "50 lb", health: 68, value: "$101.32", tone: "emerald" as Tone },
  { name: "Chicken Breast", category: "Protein", onHand: "12 lb", par: "40 lb", health: 30, value: "$142.80", tone: "amber" as Tone },
  { name: "Red Snapper Fillet", category: "Seafood", onHand: "8 lb", par: "25 lb", health: 32, value: "$192.00", tone: "rose" as Tone },
  { name: "Arborio Rice", category: "Dry goods", onHand: "18 lb", par: "20 lb", health: 90, value: "$55.80", tone: "emerald" as Tone },
  { name: "Extra Virgin Olive Oil", category: "Pantry", onHand: "11 L", par: "15 L", health: 73, value: "$201.30", tone: "emerald" as Tone },
];

const purchaseOrders = [
  { id: "PO-2841", supplier: "Coastal Seafood", total: "$398.40", status: "In transit", tone: "sky" as Tone, items: "20 items", eta: "Oct 2" },
  { id: "PO-2842", supplier: "Premium Meats Co.", total: "$412.00", status: "Awaiting approval", tone: "amber" as Tone, items: "14 items", eta: "Oct 3" },
  { id: "PO-2843", supplier: "Fresh Produce Co.", total: "$96.20", status: "Scheduled", tone: "emerald" as Tone, items: "8 items", eta: "Oct 1" },
];

const events = [
  { name: "Harvest Wine Dinner", date: "Oct 8", guests: "100 guests", menus: "4 menu items", risk: "2 shortages", tone: "rose" as Tone },
  { name: "Chef's Table Popup", date: "Oct 12", guests: "40 guests", menus: "6 menu items", risk: "On track", tone: "emerald" as Tone },
];

const tasks = [
  { title: "Approve PO-2842", detail: "Premium Meats Co. · $412.00" },
  { title: "Resolve 2 invoice items", detail: "Coastal Seafood · invoice_2041.jpg" },
  { title: "Confirm Harvest Dinner menu", detail: "100 guests · Oct 8" },
];

const toneText: Record<Tone, string> = {
  emerald: "text-emerald-700 bg-emerald-50",
  indigo: "text-indigo-700 bg-indigo-50",
  sky: "text-sky-700 bg-sky-50",
  amber: "text-amber-700 bg-amber-50",
  rose: "text-rose-700 bg-rose-50",
};

const toneBar: Record<Tone, string> = {
  emerald: "bg-emerald-500",
  indigo: "bg-indigo-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

const toneIcon: Record<Tone, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  indigo: "bg-indigo-50 text-indigo-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold ${toneText[tone]}`}>
      {label}
    </span>
  );
}

function ProgressBar({ value, tone }: { value: number; tone: Tone }) {
  return (
    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${toneBar[tone]}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delta, tone }: { icon: LucideIcon; label: string; value: string; delta: string; tone: Tone }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneIcon[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{delta}</span>
      </div>
      <div className="mt-3 text-[11px] font-medium text-slate-400">{label}</div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
    </article>
  );
}

function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800">
      {children}
    </button>
  );
}

function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
      {children}
    </button>
  );
}

function Panel({ title, subtitle, action, children, className = "" }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-white shadow-xs ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
        <div>
          <h2 className="text-xs font-bold text-slate-800">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1 p-4 sm:p-5">{children}</div>
    </section>
  );
}

type Workflow = {
  id: string;
  name: string;
  detail: string;
  status: string;
  blank?: boolean;
};

const initialWorkflows: Workflow[] = [
  { id: "invoice-intake", name: "Invoice intake agent", detail: "Reads invoices and extracts line items", status: "Active" },
  { id: "inventory-sync", name: "Inventory sync agent", detail: "Keeps stock levels aligned across systems", status: "Active" },
  { id: "purchase-order", name: "Purchase order agent", detail: "Drafts reorder requests from inventory gaps", status: "Draft" },
];

type Supplier = (typeof suppliers)[number];

function SupplierList({ suppliers }: { suppliers: Supplier[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
        {suppliers.map((supplier) => (
          <article key={supplier.name} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">{supplier.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{supplier.category} · {supplier.owner}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Health</div>
                  <div className="text-xs font-semibold text-slate-900">{supplier.health}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Next delivery</div>
                  <div className="text-xs font-semibold text-slate-900">{supplier.delivery}</div>
                </div>
                <StatusBadge label={supplier.status} tone={supplier.tone} />
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={supplier.health} tone={supplier.tone} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

type EventItem = (typeof events)[number];

function EventList({ events }: { events: EventItem[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
        {events.map((event) => (
          <article key={event.name} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">{event.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{event.date} · {event.guests} · {event.menus}</p>
              </div>
              <StatusBadge label={event.risk} tone={event.tone} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-4 w-4" />
              Recipe-aware estimate ready
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

type PurchaseOrder = (typeof purchaseOrders)[number];

function PurchaseOrderList({ orders }: { orders: PurchaseOrder[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
        {orders.map((order) => (
          <article key={order.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">{order.id}</h3>
                <p className="mt-1 text-xs text-slate-500">{order.supplier} · {order.items}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">ETA</div>
                  <div className="text-xs font-semibold text-slate-900">{order.eta}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Total</div>
                  <div className="text-xs font-semibold text-slate-900">{order.total}</div>
                </div>
                <StatusBadge label={order.status} tone={order.tone} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

type InventoryItem = (typeof inventory)[number];

function InventoryList({ items }: { items: InventoryItem[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
        {items.map((item) => (
          <article key={item.name} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">{item.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{item.category}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">On hand</div>
                  <div className="text-xs font-semibold text-slate-900">{item.onHand}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Par</div>
                  <div className="text-xs font-semibold text-slate-900">{item.par}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Value</div>
                  <div className="text-xs font-semibold text-slate-900">{item.value}</div>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={item.health} tone={item.tone} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

type Receipt = (typeof receiptInbox)[number];
type ExtractedLine = (typeof extractedLines)[number];

function ReceiptInboxList({ receipts }: { receipts: Receipt[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
        {receipts.map((receipt) => (
          <article key={receipt.file} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">{receipt.vendor}</h3>
                <p className="mt-1 text-xs text-slate-500">{receipt.file} · {receipt.items}</p>
              </div>
              <StatusBadge label={receipt.status} tone={receipt.tone} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ExtractedLinesList({ lines }: { lines: ExtractedLine[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
        {lines.map((line) => (
          <article key={line.raw} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">{line.match}</h3>
                <p className="mt-1 text-xs text-slate-500">{line.raw} · {line.qty} · {line.price}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Confidence</div>
                  <div className="text-xs font-semibold text-slate-900">{line.confidence}</div>
                </div>
                <StatusBadge label={line.status} tone={line.tone} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AgentList({
  workflows,
  activeId,
  onSelect,
}: {
  workflows: Workflow[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
        {workflows.map((workflow) => (
          <button
            key={workflow.id}
            type="button"
            onClick={() => onSelect(workflow.id)}
            className={`flex w-full items-center justify-between gap-3 p-5 text-left transition-colors ${
              workflow.id === activeId ? "bg-slate-50" : "hover:bg-slate-50/60"
            }`}
          >
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">{workflow.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{workflow.detail}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              workflow.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}>
              {workflow.status}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AppWorkspace() {
  const [activeNav, setActiveNav] = useState<NavId>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [builderView, setBuilderView] = useState<"canvas" | "list">("canvas");
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(initialWorkflows[0].id);

  return (
    <div className="flex h-full min-h-0 bg-white/95">
      <aside
        className={`hidden shrink-0 flex-col justify-between border-r border-slate-100 bg-slate-50/50 transition-[width,padding] duration-200 md:flex ${
          sidebarCollapsed ? "w-[84px]" : "w-64"
        }`}
      >
        <div className={sidebarCollapsed ? "px-4 pt-6 pb-4" : "px-6 pt-6 pb-6"}>
          <div className={`mb-8 flex items-center px-1 ${sidebarCollapsed ? "justify-center" : "justify-between gap-2"}`}>
            <button
              type="button"
              onClick={sidebarCollapsed ? () => setSidebarCollapsed(false) : undefined}
              className={`flex min-w-0 items-center gap-2 rounded-lg ${sidebarCollapsed ? "justify-center" : ""}`}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "ChefVision AI"}
              title={sidebarCollapsed ? "Expand sidebar" : "ChefVision AI"}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </span>
              {!sidebarCollapsed && (
                <span className="min-w-0 text-left">
                  <span className="block font-display text-sm font-bold leading-tight tracking-tight text-slate-900">ChefVision AI</span>
                  <span className="block text-[11px] leading-tight text-slate-400">Back of House</span>
                </span>
              )}
            </button>

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>

          <nav className="space-y-1.5" aria-label="Product navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-2 rounded-lg text-xs font-medium transition-colors ${
                    sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-2.5 py-2 text-left"
                  } ${active ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                  title={item.label}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                  {!sidebarCollapsed && item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`flex h-14 shrink-0 flex-col justify-center border-t border-slate-100 text-[11px] ${sidebarCollapsed ? "px-4" : "px-6"}`}>
          <div className={`items-center gap-1.5 font-medium text-emerald-700 ${sidebarCollapsed ? "flex justify-center" : "flex"}`}>
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
            {!sidebarCollapsed && "Document AI online"}
          </div>
          {!sidebarCollapsed && (
            <div className="mt-1 text-slate-400">Last sync 2 minutes ago</div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white/85 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search suppliers, invoices, inventory..."
              className="w-full rounded-xl bg-slate-100 py-2 pl-9 pr-4 text-xs text-slate-700 outline-none ring-0 focus:outline-none focus:ring-0"
            />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-colors hover:text-slate-900" type="button" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
            </button>
            <button className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-colors hover:text-slate-900" type="button" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 sm:flex">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">M</div>
              <span className="text-xs font-medium text-slate-600">Marianne</span>
            </div>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-100 p-3 md:hidden" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                  active ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-600"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <main className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {activeNav === "builder" && (
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Agent Builder
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const id = `workflow-${Date.now()}`;
                      setWorkflows((current) => [
                        ...current,
                        { id, name: "New agent workflow", detail: "Blank canvas", status: "Draft", blank: true },
                      ]);
                      setActiveWorkflowId(id);
                      setBuilderView("canvas");
                    }}
                    aria-label="Create agent workflow"
                    title="Create agent workflow"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderView(builderView === "canvas" ? "list" : "canvas")}
                    aria-label={builderView === "canvas" ? "Show agents" : "Show canvas"}
                    title={builderView === "canvas" ? "Show agents" : "Show canvas"}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {builderView === "canvas" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="mt-5 min-h-0 flex-1">
                {builderView === "canvas" ? (
                  <AgentBuilderCanvas key={activeWorkflowId} workflowId={activeWorkflowId} blank={workflows.find((workflow) => workflow.id === activeWorkflowId)?.blank} />
                ) : (
                  <AgentList
                    workflows={workflows}
                    activeId={activeWorkflowId}
                    onSelect={(id) => {
                      setActiveWorkflowId(id);
                      setBuilderView("canvas");
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {activeNav === "overview" && (
            <div className="space-y-5">
              <PageHeader
                title="Good morning, Marianne"
                action={
                  <>
                    <GhostButton>
                      <ScanLine className="h-4 w-4" />
                      Scan invoice
                    </GhostButton>
                    <PrimaryButton>
                      <Plus className="h-4 w-4" />
                      Add supplier
                    </PrimaryButton>
                  </>
                }
              />

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.4fr_.6fr]">
                <Panel title="Supplier health" subtitle="Accounts that need attention this week" action={<StatusBadge label="Live" tone="emerald" />}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11.5px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400">
                          <th className="pb-3">Supplier</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Owner</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Health</th>
                          <th className="pb-3 text-right">Next delivery</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-700">
                        {suppliers.map((supplier) => (
                          <tr key={supplier.name}>
                            <td className="py-3 font-semibold text-slate-900">{supplier.name}</td>
                            <td className="py-3 text-slate-600">{supplier.category}</td>
                            <td className="py-3 text-slate-600">{supplier.owner}</td>
                            <td className="py-3"><StatusBadge label={supplier.status} tone={supplier.tone} /></td>
                            <td className="py-3"><ProgressBar value={supplier.health} tone={supplier.tone} /></td>
                            <td className="py-3 text-right font-semibold text-slate-900">{supplier.delivery}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>

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
            </div>
          )}

          {activeNav === "suppliers" && (
            <div className="space-y-5">
              <PageHeader
                title="Supplier CRM"
                action={
                  <>
                    <GhostButton>
                      <Download className="h-4 w-4" />
                      Export
                    </GhostButton>
                    <PrimaryButton>
                      <Plus className="h-4 w-4" />
                      Add supplier
                    </PrimaryButton>
                  </>
                }
              />
              <SupplierList suppliers={suppliers} />
            </div>
          )}

          {activeNav === "receipts" && (
            <div className="space-y-5">
              <PageHeader
                title="Receipt intelligence"
                action={
                  <>
                    <GhostButton>
                      <FileText className="h-4 w-4" />
                      Upload files
                    </GhostButton>
                    <PrimaryButton>
                      <ScanLine className="h-4 w-4" />
                      Use camera
                    </PrimaryButton>
                  </>
                }
              />
              <ReceiptInboxList receipts={receiptInbox} />
              <ExtractedLinesList lines={extractedLines} />
            </div>
          )}

          {activeNav === "inventory" && (
            <div className="space-y-5">
              <PageHeader
                title="Inventory ledger"
                action={
                  <>
                    <GhostButton>
                      <Download className="h-4 w-4" />
                      Export XLSX
                    </GhostButton>
                    <PrimaryButton>
                      <Plus className="h-4 w-4" />
                      Add item
                    </PrimaryButton>
                  </>
                }
              />
              <InventoryList items={inventory} />
            </div>
          )}

          {activeNav === "orders" && (
            <div className="space-y-5">
              <PageHeader
                title="Purchase orders"
                action={<PrimaryButton>Create order</PrimaryButton>}
              />
              <PurchaseOrderList orders={purchaseOrders} />
            </div>
          )}

          {activeNav === "events" && (
            <div className="space-y-5">
              <PageHeader
                title="Event planner"
                action={<PrimaryButton>Plan event</PrimaryButton>}
              />
              <EventList events={events} />
            </div>
          )}

          {activeNav === "analytics" && (
            <div className="space-y-5">
              <PageHeader title="Analytics" action={<GhostButton>Last 7 days</GhostButton>} />
              <div className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                  <div className="text-[11px] text-slate-400">Next 7 days demand</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">$21,850</div>
                  <div className="mt-4 flex h-14 items-end gap-1.5">
                    <span className="flex-1 rounded bg-emerald-100" style={{ height: "38%" }} />
                    <span className="flex-1 rounded bg-emerald-200" style={{ height: "52%" }} />
                    <span className="flex-1 rounded bg-emerald-300" style={{ height: "47%" }} />
                    <span className="flex-1 rounded bg-emerald-400" style={{ height: "72%" }} />
                    <span className="flex-1 rounded bg-emerald-500" style={{ height: "100%" }} />
                  </div>
                </article>
                <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                  <div className="text-[11px] text-slate-400">Predicted waste reduction</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">12.4%</div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Overprep risk</span><span className="font-semibold text-emerald-600">Low</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Spoilage risk</span><span className="font-semibold text-amber-600">Medium</span></div>
                  </div>
                </article>
                <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                  <div className="text-[11px] text-slate-400">Events considered</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">10</div>
                  <div className="mt-4 text-xs text-slate-500">Includes local music festival, 2 private dinners, and 7 recurring reservations.</div>
                </article>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
