"use client";

import { useState } from "react";
import { CalendarPlus, CreditCard } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { initialBills, type Bill, type BillStatus } from "../data";

const statusTone: Record<BillStatus, Tone> = {
  Due: "amber",
  Scheduled: "sky",
  Partial: "rose",
  Paid: "emerald",
};

export default function BillPay() {
  const [bills, setBills] = useState<Bill[]>(initialBills);

  function schedule(id: string) {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    setBills((current) =>
      current.map((bill) =>
        bill.id === id
          ? { ...bill, status: "Scheduled", scheduledFor: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }) }
          : bill
      )
    );
  }

  function pay(id: string, amount: number) {
    setBills((current) =>
      current.map((bill) => {
        if (bill.id !== id) return bill;
        const paid = Math.min(bill.paid + amount, bill.amount);
        const status: BillStatus = paid >= bill.amount ? "Paid" : "Partial";
        return { ...bill, paid, status, scheduledFor: status === "Paid" ? undefined : bill.scheduledFor };
      })
    );
  }

  const openTotal = bills.reduce((sum, bill) => sum + (bill.amount - bill.paid), 0);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
          <div className="text-xs font-bold text-slate-800">
            Supplier bills — open balance <span className="text-slate-900">${openTotal.toFixed(2)}</span>
          </div>
          <span className="text-[10px] text-slate-400">Transferred from invoices · paid via QuickBooks Online</span>
        </div>

        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
          {bills.map((bill) => {
            const remaining = bill.amount - bill.paid;
            return (
              <div key={bill.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                      {bill.supplier} <span className="text-[10px] font-medium text-slate-400">{bill.id} · {bill.invoiceRef}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      ${bill.amount.toFixed(2)}
                      {bill.paid > 0 && bill.paid < bill.amount ? ` · paid $${bill.paid.toFixed(2)} · $${remaining.toFixed(2)} remaining` : ""}
                      {bill.scheduledFor ? ` · scheduled for ${bill.scheduledFor}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={bill.status} tone={statusTone[bill.status]} />
                    {bill.status === "Due" && (
                      <button
                        type="button"
                        onClick={() => schedule(bill.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Schedule
                      </button>
                    )}
                    {bill.status !== "Paid" && (
                      <>
                        <button
                          type="button"
                          onClick={() => pay(bill.id, remaining / 2)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          Pay 50%
                        </button>
                        <button
                          type="button"
                          onClick={() => pay(bill.id, remaining)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Pay full
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
