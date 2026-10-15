"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "../../shared/ui";
import {
  initialInvoices,
  initialMatchQueue,
  type Invoice,
  type InvoiceSource,
  type InvoiceStatus,
  type MatchCandidate,
} from "./data";
import InvoiceInbox from "./invoices/InvoiceInbox";
import MatchingQueue from "./matching/MatchingQueue";
import PriceIntelligence from "./prices/PriceIntelligence";
import AccountingExport from "./accounting/AccountingExport";

type Tab = "invoices" | "matching" | "prices" | "accounting";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "invoices", label: "Invoices" },
  { id: "matching", label: "Matching" },
  { id: "prices", label: "Prices" },
  { id: "accounting", label: "Accounting" },
];

export default function PurchasesPage({ tab: tabProp, onTabChange }: { tab?: string; onTabChange?: (tab: string) => void }) {
  const [internalTab, setInternalTab] = useState<Tab>("invoices");
  const tab = (tabProp as Tab | undefined) ?? internalTab;
  const setTab = (next: Tab) => {
    setInternalTab(next);
    onTabChange?.(next);
  };
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(initialInvoices[0]?.id ?? null);
  const [matches, setMatches] = useState<MatchCandidate[]>(initialMatchQueue);

  const pendingMatches = useMemo(() => matches.filter((match) => match.status === "Pending").length, [matches]);

  function handleUpload(source: InvoiceSource) {
    const id = `INV-${Math.floor(9000 + Math.random() * 999)}`;
    const status: InvoiceStatus = "Queued";
    setInvoices((current) => [
      {
        id,
        supplier: "Unassigned supplier",
        invoiceNumber: `#${id.slice(4)}`,
        date: new Date().toISOString().slice(0, 10),
        source,
        status,
        lines: [],
      },
      ...current,
    ]);
    setSelectedInvoiceId(id);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices & Purchases"
        action={
          <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
            {tabs.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTab(option.id)}
                className={`px-3.5 py-2 text-xs font-semibold transition-colors ${
                  index > 0 ? "border-l border-slate-200" : ""
                } ${
                  tab === option.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
                {option.id === "matching" && pendingMatches > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">
                    {pendingMatches}
                  </span>
                )}
              </button>
            ))}
          </div>
        }
      />

      {tab === "invoices" && (
        <InvoiceInbox
          invoices={invoices}
          selectedId={selectedInvoiceId}
          onSelect={(id) => setSelectedInvoiceId((current) => (current === id ? null : id))}
          onUpload={handleUpload}
        />
      )}

      {tab === "matching" && (
        <MatchingQueue
          matches={matches}
          onDecide={(id, status) =>
            setMatches((current) => current.map((match) => (match.id === id ? { ...match, status } : match)))
          }
        />
      )}

      {tab === "prices" && <PriceIntelligence />}

      {tab === "accounting" && <AccountingExport invoices={invoices} />}
    </div>
  );
}
