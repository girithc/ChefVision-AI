"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Boxes,
  ChefHat,
  Database,
  FileChartColumn,
  House,
  Landmark,
  ListChecks,
  MessageSquare,
  PanelLeftClose,
  ReceiptText,
  Search,
  ArrowUp,
  Settings,
  Building2,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
  Users,
  Workflow,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { resolvePageByTab, searchPages, type PageEntry } from "../lib/page-registry";
import FeedbackWidget from "./shared/FeedbackWidget";
import OverviewPage from "./pages/overview/OverviewPage";
import ChecklistsPage from "./pages/checklists/ChecklistsPage";
import AgentsPage from "./pages/agents/AgentsPage";
import EquipmentPage from "./pages/equipment/EquipmentPage";
import PurchasesPage from "./pages/purchases/PurchasesPage";
import MultiLocationPage from "./pages/multilocation/MultiLocationPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import RecipesPage from "./pages/recipes/RecipesPage";
import FinancePage from "./pages/finance/FinancePage";
import PurchasingPage from "./pages/purchasing/PurchasingPage";
import MenuEngineeringPage from "./pages/menu/MenuEngineeringPage";
import AccountingPage from "./pages/accounting/AccountingPage";
import DataPage from "./pages/data/DataPage";
import UsersPage from "./pages/users/UsersPage";
import FeedbackPage from "./pages/feedback/FeedbackPage";

type NavId =
  | "overview"
  | "checklists"
  | "builder"
  | "equipment"
  | "multilocation"
  | "purchases"
  | "inventory"
  | "recipes"
  | "finance"
  | "purchasing"
  | "menu"
  | "accounting"
  | "data"
  | "users"
  | "feedback";

const navItems: Array<{ id: NavId; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Home", icon: House },
  { id: "checklists", label: "Checklist & SOPs", icon: ListChecks },
  { id: "equipment", label: "Equipment & Maintenance", icon: Wrench },
  { id: "multilocation", label: "Multi-location & AI", icon: Building2 },
  { id: "purchases", label: "Invoices & Purchases", icon: ReceiptText },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "recipes", label: "Recipes & Costs", icon: ChefHat },
  { id: "finance", label: "Financial Reports", icon: FileChartColumn },
  { id: "purchasing", label: "Purchasing & Ordering", icon: ShoppingCart },
  { id: "menu", label: "Menu Engineering", icon: UtensilsCrossed },
  { id: "accounting", label: "Accounting & Labor", icon: Landmark },
  { id: "builder", label: "Traces & Uptime", icon: Workflow },
  { id: "data", label: "Data", icon: Database },
  { id: "users", label: "Users & Permissions", icon: Users },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
];

type AssistantMessage = { role: "user" | "assistant"; content: string };

/** Feature flag — flip to true to bring back the AI assistant overlay. */
const AI_ASSISTANT_ENABLED = false;

const assistantGreeting: AssistantMessage = {
  role: "assistant",
  content:
    "Hi Marianne 👋 I'm your ChefVision assistant. Ask me about inventory, food cost, checklists, or today's sales — or type a command like \"order 30 lb chicken\".",
};

function assistantReply(text: string): string {
  const lowered = text.toLowerCase();
  if (lowered.includes("chicken") || lowered.includes("order")) {
    return "Saturday forecast is 320 covers. You're holding 12 lb of chicken — I'd order 30 lb from Premium Meats Co. ($6.20/lb) before the 2 PM cutoff. Want me to draft the purchase order?";
  }
  if (lowered.includes("food cost") || lowered.includes("cost")) {
    return "This week's food cost is 31.4% of sales — inside the 28–32% target. Chicken and olive oil drove the increase; everything else is on trend.";
  }
  if (lowered.includes("checklist") || lowered.includes("sop")) {
    return "2 checklists are overdue: Deep Clean — Walk-in Cooler and the Combi Oven gasket task. Opening — Kitchen is next due tomorrow at 7:00 AM.";
  }
  if (lowered.includes("sales") || lowered.includes("yesterday") || lowered.includes("today")) {
    return "Yesterday did $12,960 across 244 covers (+3.9% vs last Sunday). Friday and Saturday are tracking up week-over-week.";
  }
  if (lowered.includes("equipment") || lowered.includes("repair")) {
    return "Two work orders are escalated: the combi oven door seal (urgent) and the ice machine pump (awaiting parts, ETA Oct 15).";
  }
  return "Got it — I've noted that. I can pull live answers for inventory, food cost, sales, checklists, and equipment. What would you like to dig into?";
}

export default function AppWorkspace() {
  const [activeNav, setActiveNav] = useState<NavId>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const [messages, setMessages] = useState<AssistantMessage[]>([assistantGreeting]);
  const [assistantInput, setAssistantInput] = useState("");
  const [pageQuery, setPageQuery] = useState("");
  const [viewByParent, setViewByParent] = useState<Partial<Record<NavId, string>>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pageResults: PageEntry[] = searchPages(pageQuery).slice(0, 8);
  const currentViewEntry = resolvePageByTab(activeNav, viewByParent[activeNav]) ?? null;

  function setView(parent: NavId, tabId?: string) {
    setViewByParent((current) => {
      const next = { ...current };
      if (tabId) next[parent] = tabId;
      else delete next[parent];
      return next;
    });
  }

  function navigateToPage(entry: PageEntry) {
    setActiveNav(entry.parent);
    setView(entry.parent, entry.tabId);
    setPageQuery("");
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendAssistantMessage() {
    const text = assistantInput.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: "user", content: text }]);
    setAssistantInput("");
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: "assistant", content: assistantReply(text) }]);
    }, 600);
  }

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

          <nav className="space-y-3" aria-label="Product navigation">
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
                    sidebarCollapsed ? "justify-center px-2 py-3" : "px-2.5 py-2.5 text-left"
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

        <div className={`flex h-14 shrink-0 items-center border-t border-slate-100 ${sidebarCollapsed ? "justify-center px-4" : "gap-3 px-6"}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
            MC
          </span>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-slate-900">Marianne Cole</div>
              <div className="truncate text-[10px] text-slate-400">Owner / Admin</div>
            </div>
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
              placeholder="Search pages, tools, reports…"
              value={pageQuery}
              onChange={(event) => setPageQuery(event.target.value)}
              className="w-full rounded-xl bg-slate-100 py-2 pl-9 pr-4 text-xs text-slate-700 outline-none ring-0 focus:outline-none focus:ring-0"
            />
            {pageQuery.trim() !== "" && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
                {pageResults.length === 0 ? (
                  <p className="px-4 py-3 text-[11px] text-slate-400">No pages match “{pageQuery}”.</p>
                ) : (
                  pageResults.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => navigateToPage(entry)}
                      className="flex w-full items-start justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-slate-900">{entry.name}</div>
                        <div className="mt-0.5 truncate text-[10px] text-slate-500">{entry.description}</div>
                      </div>
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                        {entry.parentLabel}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:text-slate-900" type="button" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
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
          {activeNav === "overview" && <OverviewPage />}
          {activeNav === "checklists" && (
            <ChecklistsPage tab={viewByParent.checklists} onTabChange={(tab) => setView("checklists", tab)} />
          )}
          {activeNav === "builder" && (
            <AgentsPage tab={viewByParent.builder} onTabChange={(tab) => setView("builder", tab)} />
          )}
          {activeNav === "equipment" && (
            <EquipmentPage tab={viewByParent.equipment} onTabChange={(tab) => setView("equipment", tab)} />
          )}
          {activeNav === "multilocation" && (
            <MultiLocationPage tab={viewByParent.multilocation} onTabChange={(tab) => setView("multilocation", tab)} />
          )}
          {activeNav === "purchases" && (
            <PurchasesPage tab={viewByParent.purchases} onTabChange={(tab) => setView("purchases", tab)} />
          )}
          {activeNav === "inventory" && (
            <InventoryPage tab={viewByParent.inventory} onTabChange={(tab) => setView("inventory", tab)} />
          )}
          {activeNav === "recipes" && (
            <RecipesPage tab={viewByParent.recipes} onTabChange={(tab) => setView("recipes", tab)} />
          )}
          {activeNav === "finance" && (
            <FinancePage tab={viewByParent.finance} onTabChange={(tab) => setView("finance", tab)} />
          )}
          {activeNav === "purchasing" && (
            <PurchasingPage tab={viewByParent.purchasing} onTabChange={(tab) => setView("purchasing", tab)} />
          )}
          {activeNav === "menu" && <MenuEngineeringPage />}
          {activeNav === "accounting" && (
            <AccountingPage tab={viewByParent.accounting} onTabChange={(tab) => setView("accounting", tab)} />
          )}
          {activeNav === "data" && <DataPage />}
          {activeNav === "users" && (
            <UsersPage tab={viewByParent.users} onTabChange={(tab) => setView("users", tab)} />
          )}
          {activeNav === "feedback" && <FeedbackPage />}
        </main>
      </div>

      <FeedbackWidget
        page={currentViewEntry ? { id: currentViewEntry.id, name: currentViewEntry.name } : null}
      />
      {/* AI assistant — hidden for now (bring back by flipping this flag) */}
      {AI_ASSISTANT_ENABLED && !assistantOpen && (
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          aria-label="Open AI assistant"
          title="AI assistant"
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      )}

      {AI_ASSISTANT_ENABLED && assistantOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(80vh,640px)] w-[min(94vw,460px)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl">
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[13px] font-bold text-slate-900">ChefVision AI</div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Online
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              aria-label="Close AI assistant"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-5 pb-4 pt-2">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                )}
                <p
                  className={`max-w-[85%] text-[13px] leading-relaxed ${
                    message.role === "user"
                      ? "rounded-2xl rounded-br-md bg-slate-900 px-3.5 py-2 text-white"
                      : "text-slate-700"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 py-2 pl-4 pr-2 transition-colors focus-within:border-slate-400">
              <input
                type="text"
                placeholder="Ask about your restaurant…"
                value={assistantInput}
                onChange={(event) => setAssistantInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendAssistantMessage();
                }}
                className="w-full bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={sendAssistantMessage}
                aria-label="Send message"
                disabled={!assistantInput.trim()}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              AI answers from your live inventory, invoices, and reports.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
