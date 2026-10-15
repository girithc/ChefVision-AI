/**
 * Page registry — the app's page database.
 * Every screen, view, and overlay is registered here with a name and a short
 * description so the platform can make pages discoverable (search, assistant,
 * onboarding, deep links).
 */

export type PageParentId =
  | "overview"
  | "checklists"
  | "equipment"
  | "multilocation"
  | "purchases"
  | "inventory"
  | "recipes"
  | "finance"
  | "purchasing"
  | "menu"
  | "accounting"
  | "builder"
  | "data"
  | "users"
  | "feedback";

export type PageEntry = {
  /** Unique page id (stable — safe for deep links later). */
  id: string;
  /** Sidebar item this page belongs to. */
  parent: PageParentId;
  /** Sidebar label of the parent. */
  parentLabel: string;
  /** Display name of the page/view. */
  name: string;
  /** One-line description of what the page is for. */
  description: string;
  kind: "page" | "view" | "detail" | "modal";
  /** For tab views: the tab-state value this entry corresponds to inside its page. */
  tabId?: string;
  /** Extra terms for search/discovery. */
  keywords?: string[];
};

export const pageRegistry: PageEntry[] = [
  // ── Home ────────────────────────────────────────────────────────────────
  {
    id: "home",
    parent: "overview",
    parentLabel: "Home",
    name: "Home",
    description: "Daily launchpad with quick-capture actions and today's focus decisions.",
    kind: "page",
    keywords: ["dashboard", "start", "morning"],
  },
  {
    id: "home.quick-actions",
    parent: "overview",
    parentLabel: "Home",
    name: "Quick actions",
    description: "One-tap capture, quick note, and fix-it shortcuts.",
    kind: "view",
    keywords: ["capture", "note", "fix"],
  },
  {
    id: "home.todays-focus",
    parent: "overview",
    parentLabel: "Home",
    name: "Today's focus",
    description: "The decisions to resolve before service, with one-click resolve.",
    kind: "view",
    keywords: ["tasks", "decisions", "approvals"],
  },

  // ── Checklist & SOPs ─────────────────────────────────────────────────────
  {
    id: "checklists",
    parent: "checklists",
    parentLabel: "Checklist & SOPs",
    name: "Checklist library",
    description: "Browse daily, weekly, and monthly checklists and SOPs by frequency.",
    kind: "page",
    keywords: ["sop", "daily", "weekly", "monthly", "haccp", "opening", "closing"],
  },
  {
    id: "checklists.daily",
    parent: "checklists",
    parentLabel: "Checklist & SOPs",
    name: "Daily checklists",
    description: "Daily checklists and SOPs — opening, closing, HACCP, and temperature logs.",
    kind: "view",
    tabId: "daily",
    keywords: ["daily", "opening", "closing", "haccp"],
  },
  {
    id: "checklists.weekly",
    parent: "checklists",
    parentLabel: "Checklist & SOPs",
    name: "Weekly checklists",
    description: "Weekly checklists — deep cleans, sanitation schedules, and equipment walks.",
    kind: "view",
    tabId: "weekly",
    keywords: ["weekly", "deep clean", "sanitation"],
  },
  {
    id: "checklists.monthly",
    parent: "checklists",
    parentLabel: "Checklist & SOPs",
    name: "Monthly checklists",
    description: "Monthly checklists — pest control, fire safety, and periodic maintenance.",
    kind: "view",
    tabId: "monthly",
    keywords: ["monthly", "pest", "fire safety"],
  },
  {
    id: "checklists.run",
    parent: "checklists",
    parentLabel: "Checklist & SOPs",
    name: "Checklist run",
    description: "Execute a checklist: simple checks, photo evidence, temperature logging, live progress.",
    kind: "detail",
    keywords: ["execute", "temperature", "photo evidence", "progress"],
  },

  // ── Equipment & Maintenance ──────────────────────────────────────────────
  {
    id: "equipment",
    parent: "equipment",
    parentLabel: "Equipment & Maintenance",
    name: "Equipment register",
    description: "Every asset with location, model, status, live sensor reading, and 12-month fault count.",
    kind: "page",
    keywords: ["assets", "machines", "register"],
  },
  {
    id: "equipment.work-orders",
    tabId: "workorders",
    parent: "equipment",
    parentLabel: "Equipment & Maintenance",
    name: "Work orders",
    description: "Repair board: assignee, priority, deadline, escalation — escalated orders first.",
    kind: "view",
    keywords: ["repair", "maintenance", "escalation", "deadline"],
  },
  {
    id: "equipment.schedules",
    tabId: "schedules",
    parent: "equipment",
    parentLabel: "Equipment & Maintenance",
    name: "Maintenance schedule",
    description: "Chronological preventive maintenance timeline: overdue → today → this week → upcoming.",
    kind: "view",
    keywords: ["preventive", "timeline", "servicing"],
  },
  {
    id: "equipment.sensors",
    tabId: "sensors",
    parent: "equipment",
    parentLabel: "Equipment & Maintenance",
    name: "Sensor matrix",
    description: "Live sensor tablets with readings, targets, and state tinting; camera + note capture per sensor.",
    kind: "view",
    keywords: ["monitoring", "temperature", "readings", "sensors"],
  },
  {
    id: "equipment.asset-detail",
    parent: "equipment",
    parentLabel: "Equipment & Maintenance",
    name: "Asset detail",
    description: "Full asset record: upcoming visits, inspection & monitoring, service history, repair-vs-replace verdict.",
    kind: "detail",
    keywords: ["warranty", "contract", "history", "repair or replace"],
  },
  {
    id: "equipment.sensor-logs",
    parent: "equipment",
    parentLabel: "Equipment & Maintenance",
    name: "Sensor logs",
    description: "Reading history chart with y-axis values and the raw log list for one sensor.",
    kind: "modal",
    keywords: ["readings", "chart"],
  },
  {
    id: "equipment.report-breakdown",
    parent: "equipment",
    parentLabel: "Equipment & Maintenance",
    name: "Report breakdown",
    description: "Log a breakdown and generate a work order with priority, deadline, and assignee.",
    kind: "modal",
    keywords: ["breakdown", "work order"],
  },
  {
    id: "equipment.alert-record",
    parent: "equipment",
    parentLabel: "Equipment & Maintenance",
    name: "Alert record",
    description: "Record an alert with camera evidence and voice notes; creates a work order.",
    kind: "modal",
    keywords: ["alert", "voice", "photo", "issue"],
  },

  // ── Invoices & Purchases ─────────────────────────────────────────────────
  {
    id: "purchases",
    parent: "purchases",
    parentLabel: "Invoices & Purchases",
    name: "Invoice inbox",
    description: "Capture invoices by photo, PDF, or email; track extraction from queued to published; expand any invoice for its lines.",
    kind: "page",
    keywords: ["upload", "ocr", "extraction", "invoice history"],
  },
  {
    id: "purchases.matching",
    tabId: "matching",
    parent: "purchases",
    parentLabel: "Invoices & Purchases",
    name: "Ingredient matching",
    description: "Confirm or reject supplier item → ingredient matches with confidence scores.",
    kind: "view",
    keywords: ["matching", "normalize", "sku", "accept", "reject"],
  },
  {
    id: "purchases.prices",
    tabId: "prices",
    parent: "purchases",
    parentLabel: "Invoices & Purchases",
    name: "Price intelligence",
    description: "Cheapest supplier per ingredient, choose-supplier comparison, price-increase alerts, and product price history.",
    kind: "view",
    keywords: ["comparison", "cheapest", "suppliers", "price history", "alerts"],
  },
  {
    id: "purchases.accounting",
    tabId: "accounting",
    parent: "purchases",
    parentLabel: "Invoices & Purchases",
    name: "Accounting transfer",
    description: "Category totals for published invoices and transfer to QuickBooks, Xero, or XLSX.",
    kind: "view",
    keywords: ["export", "quickbooks", "xero", "categories"],
  },

  // ── Inventory ────────────────────────────────────────────────────────────
  {
    id: "inventory",
    parent: "inventory",
    parentLabel: "Inventory",
    name: "Stock on hand",
    description: "Quantities, valuation, par status, unit conversions, and location filters for every item.",
    kind: "page",
    keywords: ["stock", "valuation", "par", "locations", "conversion"],
  },
  {
    id: "inventory.counts",
    tabId: "counts",
    parent: "inventory",
    parentLabel: "Inventory",
    name: "Count sheets",
    description: "Digital counts per location with live variance, possible-waste flags, and count history.",
    kind: "view",
    keywords: ["count", "variance", "waste", "discrepancy"],
  },
  {
    id: "inventory.value",
    tabId: "value",
    parent: "inventory",
    parentLabel: "Inventory",
    name: "Value & flow",
    description: "Opening and closing inventory values, weekly value changes, and purchased/used/remaining flow.",
    kind: "view",
    keywords: ["opening", "closing", "flow", "purchased", "used"],
  },

  // ── Recipes & Costs ──────────────────────────────────────────────────────
  {
    id: "recipes",
    parent: "recipes",
    parentLabel: "Recipes & Costs",
    name: "Recipe library",
    description: "Finished dishes and prep sub-recipes with cost per serving and food-cost badges.",
    kind: "page",
    keywords: ["dishes", "menu", "sub-recipes", "batches"],
  },
  {
    id: "recipes.ingredients",
    tabId: "ingredients",
    parent: "recipes",
    parentLabel: "Recipes & Costs",
    name: "Ingredient master",
    description: "The ingredient database: costs auto-updated from invoices, yields, allergens, and price trends.",
    kind: "view",
    keywords: ["ingredients", "database", "yield", "allergens"],
  },
  {
    id: "recipes.labels",
    tabId: "labels",
    parent: "recipes",
    parentLabel: "Recipes & Costs",
    name: "Label studio",
    description: "Generate prep and product labels: prep/use-by dates, batch code, allergens, and portion cost.",
    kind: "view",
    keywords: ["labels", "print", "use by", "batch"],
  },
  {
    id: "recipes.detail.cost",
    parent: "recipes",
    parentLabel: "Recipes & Costs",
    name: "Recipe cost breakdown",
    description: "Yield-adjusted ingredient costing with batch and per-serving totals.",
    kind: "detail",
    keywords: ["costing", "portions"],
  },
  {
    id: "recipes.detail.recipe",
    parent: "recipes",
    parentLabel: "Recipes & Costs",
    name: "Kitchen recipe card",
    description: "Step-by-step method formatted for kitchen tablets, printable.",
    kind: "detail",
    keywords: ["steps", "method", "tablet", "print"],
  },
  {
    id: "recipes.detail.allergens",
    parent: "recipes",
    parentLabel: "Recipes & Costs",
    name: "Recipe allergens",
    description: "Allergens aggregated from every ingredient and sub-recipe.",
    kind: "detail",
    keywords: ["allergens"],
  },

  // ── Financial Reports ────────────────────────────────────────────────────
  {
    id: "finance",
    parent: "finance",
    parentLabel: "Financial Reports",
    name: "Daily P&L",
    description: "Daily controllable profit-and-loss: sales, food %, labor %, prime cost per day.",
    kind: "page",
    keywords: ["profit", "loss", "prime cost", "labor", "sales report"],
  },
  {
    id: "finance.food-cost",
    tabId: "cost",
    parent: "finance",
    parentLabel: "Financial Reports",
    name: "Food cost analysis",
    description: "Actual vs theoretical food cost, usage variance per ingredient, and category usage report.",
    kind: "view",
    keywords: ["actual", "theoretical", "variance", "usage"],
  },
  {
    id: "finance.spending",
    tabId: "spending",
    parent: "finance",
    parentLabel: "Financial Reports",
    name: "Spending & budgets",
    description: "Budget vs actual by category (pie), price movements, price alerts, and supplier spend.",
    kind: "view",
    keywords: ["budget", "spending", "price movement", "suppliers"],
  },
  {
    id: "finance.trends",
    tabId: "trends",
    parent: "finance",
    parentLabel: "Financial Reports",
    name: "Sales trends",
    description: "Week-over-week and year-over-year sales, covers, and average-check comparisons.",
    kind: "view",
    keywords: ["week over week", "year over year", "comparisons"],
  },

  // ── Multi-location & AI ────────────────────────────────────────────────────
  {
    id: "multilocation.health",
    tabId: "health",
    parent: "multilocation",
    parentLabel: "Multi-location & AI",
    name: "Health & rankings",
    description: "Operational health score per location, outlet rankings, and regional/company-wide rollups.",
    kind: "page",
    keywords: ["health score", "ranking", "comparison", "regional", "company"],
  },
  {
    id: "multilocation.issues",
    tabId: "issues",
    parent: "multilocation",
    parentLabel: "Multi-location & AI",
    name: "Issues board",
    description: "Recurring problems across locations, named owners, due dates, reminders, escalation, and closure confirmation.",
    kind: "view",
    keywords: ["corrective actions", "owners", "escalation", "recurring"],
  },
  {
    id: "multilocation.reports",
    tabId: "reports",
    parent: "multilocation",
    parentLabel: "Multi-location & AI",
    name: "Weekly leadership report",
    description: "Auto-compiled weekly management report: sales, food cost, labor, operations.",
    kind: "view",
    keywords: ["weekly report", "leadership", "management"],
  },
  {
    id: "multilocation.ai",
    tabId: "ai",
    parent: "multilocation",
    parentLabel: "Multi-location & AI",
    name: "AI & integrations",
    description: "AI performance Q&A, photo verification + pattern detection, chat/messaging access, read-only POS connections.",
    kind: "view",
    keywords: ["assistant", "slack", "teams", "whatsapp", "photo verification", "pos"],
  },

  // ── Purchasing & Ordering ────────────────────────────────────────────────
  {
    id: "purchasing",
    parent: "purchasing",
    parentLabel: "Purchasing & Ordering",
    name: "Vendor order guides",
    description: "Centralized shared order guides by vendor, category, or storage location — par levels and on-hand per item.",
    kind: "page",
    keywords: ["order guide", "vendors", "par levels", "shared", "outlets"],
  },
  {
    id: "purchasing.suggestions",
    tabId: "suggestions",
    parent: "purchasing",
    parentLabel: "Purchasing & Ordering",
    name: "Suggested orders",
    description: "Auto-suggested order quantities from par gaps, editable, placed through vendor integrations.",
    kind: "view",
    keywords: ["suggested ordering", "reorder", "place order", "integration"],
  },
  {
    id: "purchasing.history",
    tabId: "history",
    parent: "purchasing",
    parentLabel: "Purchasing & Ordering",
    name: "Purchase history",
    description: "Vendor and product purchase history, tracked against supplier invoices.",
    kind: "view",
    keywords: ["purchase history", "invoices", "reconciliation"],
  },

  // ── Menu Engineering ──────────────────────────────────────────────────────
  {
    id: "menu",
    parent: "menu",
    parentLabel: "Menu Engineering",
    name: "Menu engineering matrix",
    description: "Stars, Plow Horses, Puzzles, and Dogs — popularity vs contribution margin per dish.",
    kind: "page",
    keywords: ["sales mix", "stars", "plow horses", "puzzles", "dogs", "contribution"],
  },
  {
    id: "menu.impact",
    parent: "menu",
    parentLabel: "Menu Engineering",
    name: "Ingredient price impact",
    description: "What-if simulator: move an ingredient price and see every dish's margin and food-cost % react.",
    kind: "view",
    keywords: ["simulator", "price change", "margins", "pricing decisions"],
  },

  // ── Accounting & Labor ──────────────────────────────────────────────────────
  {
    id: "accounting.integrations",
    tabId: "integrations",
    parent: "accounting",
    parentLabel: "Accounting & Labor",
    name: "Connected systems",
    description: "POS, payroll, and accounting integrations with connect/disconnect and last-sync status.",
    kind: "view",
    keywords: ["pos", "toast", "square", "gusto", "adp", "quickbooks", "xero"],
  },
  {
    id: "accounting.sales",
    tabId: "sales",
    parent: "accounting",
    parentLabel: "Accounting & Labor",
    name: "Daily sales & PMIX",
    description: "Daily sales entries imported from POS plus product-mix analysis of top sellers.",
    kind: "view",
    keywords: ["sales import", "pmix", "product mix", "covers"],
  },
  {
    id: "accounting.bills",
    tabId: "bills",
    parent: "accounting",
    parentLabel: "Accounting & Labor",
    name: "Bill pay",
    description: "Bill payment workflows: schedule, partial (50%), and full payments against supplier bills.",
    kind: "view",
    keywords: ["bills", "payments", "schedule", "partial", "accounts payable"],
  },
  {
    id: "accounting.consolidated",
    tabId: "consolidated",
    parent: "accounting",
    parentLabel: "Accounting & Labor",
    name: "Consolidated reporting",
    description: "Multi-restaurant rollup: sales, food %, labor %, profit, and the AI assistant for cost questions.",
    kind: "view",
    keywords: ["multi location", "rollup", "assistant"],
  },

  // ── Traces & Uptime ──────────────────────────────────────────────────────
  {
    id: "traces",
    parent: "builder",
    parentLabel: "Traces & Uptime",
    name: "Process list",
    description: "Every platform workflow with live run status: invoice intake, re-costing, sensors, reports, assistant.",
    kind: "page",
    keywords: ["agents", "workflows", "runs"],
  },
  {
    id: "builder.uptime",
    parent: "builder",
    parentLabel: "Traces & Uptime",
    name: "Pipeline uptime",
    description: "Success rate, volume, and latency for each platform pipeline, with past runs and tests.",
    kind: "view",
    tabId: "uptime",
    keywords: ["uptime", "health", "pipelines", "runs"],
  },
  {
    id: "traces.detail",
    parent: "builder",
    parentLabel: "Traces & Uptime",
    name: "Run trace",
    description: "LangSmith-style waterfall: nested spans, timings, tokens, and cost for one workflow run.",
    kind: "detail",
    keywords: ["waterfall", "spans", "langsmith", "debug"],
  },

  // ── Data ─────────────────────────────────────────────────────────────────
  {
    id: "data",
    parent: "data",
    parentLabel: "Data",
    name: "Data workspace",
    description: "Central data workspace — reserved for datasets, exports, and integrations.",
    kind: "page",
    keywords: ["datasets", "export", "integrations"],
  },

  // ── Users & Permissions ──────────────────────────────────────────────────
  {
    id: "users",
    parent: "users",
    parentLabel: "Users & Permissions",
    name: "User management",
    description: "Invite, assign roles, and suspend or reactivate team members.",
    kind: "page",
    keywords: ["team", "invite", "suspend", "roles"],
  },
  {
    id: "users.roles",
    tabId: "roles",
    parent: "users",
    parentLabel: "Users & Permissions",
    name: "Roles & permissions",
    description: "RBAC matrix: define roles and toggle 21 permissions across 7 categories.",
    kind: "view",
    keywords: ["rbac", "permissions", "access", "roles"],
  },

  // ── Feedback ──────────────────────────────────────────────────────────────
  {
    id: "feedback",
    parent: "feedback",
    parentLabel: "Feedback",
    name: "Feedback inbox",
    description: "All feedback submitted from the ✦ button — tagged by page, stored on this device.",
    kind: "page",
    keywords: ["feedback", "suggestions", "ideas", "reports"],
  },
  // ── Global overlays ──────────────────────────────────────────────────────
  {
    id: "global.assistant",
    parent: "overview",
    parentLabel: "Home",
    name: "AI assistant",
    description: "Conversational overlay answering from live inventory, invoices, and reports.",
    kind: "modal",
    keywords: ["chat", "help", "assistant"],
  },
  {
    id: "global.camera",
    parent: "overview",
    parentLabel: "Home",
    name: "Camera capture",
    description: "Device camera overlay for photo evidence on checks, sensors, and alerts.",
    kind: "modal",
    keywords: ["camera", "photo", "evidence"],
  },
];

export function getPageById(id: string): PageEntry | undefined {
  return pageRegistry.find((entry) => entry.id === id);
}

export function pagesByParent(parent: PageParentId): PageEntry[] {
  return pageRegistry.filter((entry) => entry.parent === parent);
}

export function searchPages(query: string): PageEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return pageRegistry.filter(
    (entry) =>
      entry.name.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.keywords?.some((keyword) => keyword.toLowerCase().includes(q))
  );
}

/** Resolve the exact registry entry for a page + active tab value. */
export function resolvePageByTab(parent: PageParentId, tabId?: string): PageEntry | undefined {
  if (tabId) {
    const match = pageRegistry.find((entry) => entry.parent === parent && entry.tabId === tabId);
    if (match) return match;
  }
  return pageRegistry.find((entry) => entry.parent === parent && entry.kind === "page");
}
