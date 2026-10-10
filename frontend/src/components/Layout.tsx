import { useState, type ReactNode } from "react";
import {
  BadgeCheck,
  Boxes,
  CalendarDays,
  CalendarRange,
  ChefHat,
  LayoutGrid,
  Menu,
  PenLine,
  RefreshCw,
  ScanLine,
  Settings2,
  ShoppingCart,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";

import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/cn";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const sections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Receipts",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { path: "/scan", label: "Scan Receipt", icon: ScanLine },
      { path: "/manual", label: "Manual Entry", icon: PenLine },
    ],
  },
  {
    title: "Planning",
    items: [
      { path: "/events", label: "Events", icon: CalendarDays },
      { path: "/recipes", label: "Recipes", icon: ChefHat },
      { path: "/monthly", label: "Monthly View", icon: CalendarRange },
    ],
  },
  {
    title: "Inventory",
    items: [
      { path: "/inventory", label: "Inventory", icon: Boxes },
      { path: "/reorder", label: "Check & Reorder", icon: ShoppingCart },
    ],
  },
  {
    title: "Platform",
    items: [{ path: "/admin", label: "Admin Console", icon: Settings2, adminOnly: true }],
  },
];

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#/" className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-white/10">
        <ChefHat className="h-[19px] w-[19px]" />
      </div>
      <div>
        <span className="block font-display text-lg leading-5 font-bold tracking-tight text-slate-900">ChefVision AI</span>
        <span className="block text-[9px] font-bold tracking-[0.18em] text-emerald-600 uppercase">Restaurant ops</span>
      </div>
    </a>
  );
}

export function Layout({ path, children }: { path: string; children: ReactNode }) {
  const { session, offline, reconnect } = useApp();
  const [retrying, setRetrying] = useState(false);
  const [open, setOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full w-[17rem] flex-col justify-between border-r border-slate-200/70 bg-white/85 p-5 shadow-[8px_0_30px_-24px_rgba(15,23,42,0.25)] backdrop-blur-xl">
      <div>
        <Logo className="mb-5 px-1" />
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50/70 p-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
              <UtensilsCrossed className="h-3.5 w-3.5" />
            </span>
            ChefVision workspace
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-emerald-700/80">Receipts, inventory, and event planning in one workflow.</p>
        </div>
        {sections.map((section) => {
          const items = section.items.filter((item) => !item.adminOnly || session?.role === "admin");
          if (items.length === 0) return null;
          return (
            <div key={section.title} className="mb-4">
              <div className="mb-1.5 px-2 text-[9px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                {section.title}
              </div>
              <nav className="space-y-1">
                {items.map((item) => {
                  const active = path === item.path || path.startsWith(`${item.path}/`);
                  return (
                    <a
                      key={item.path}
                      href={`#${item.path}`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition-all",
                        active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:bg-emerald-50 hover:text-slate-900",
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", active ? "text-emerald-300" : "text-slate-400 group-hover:text-emerald-600")} />
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-100 pt-4 text-xs">
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
            {session?.email.slice(0, 1).toUpperCase() ?? "C"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-semibold text-slate-800">{session?.email}</span>
            <span className="flex items-center gap-1 text-[10px] capitalize text-slate-400">
              <BadgeCheck className="h-3 w-3 text-emerald-500" /> {session?.role}
            </span>
          </span>
        </div>
        <div className="mb-2 flex items-center gap-1.5 px-1 font-medium">
          <span className={cn("h-1.5 w-1.5 rounded-full", offline ? "bg-amber-500" : "animate-pulse bg-emerald-500")} />
          <span className={offline ? "text-amber-700" : "text-emerald-700"}>
            {offline ? "Offline demo mode" : "Connected to API"}
          </span>
        </div>
        {offline && (
          <button
            type="button"
            disabled={retrying}
            onClick={async () => {
              setRetrying(true);
              await reconnect();
              setRetrying(false);
            }}
            className="flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", retrying && "animate-spin")} /> Retry connection
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">{sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="h-full">{sidebar}</div>
          <button type="button" aria-label="Close menu" className="flex-1 bg-slate-900/30" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white/70 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
          <button type="button" aria-label="Open menu" onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-slate-100">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>
        <main className="mx-auto w-full max-w-[82rem] flex-1 p-4 sm:p-7 lg:p-9">{children}</main>
      </div>
    </div>
  );
}
