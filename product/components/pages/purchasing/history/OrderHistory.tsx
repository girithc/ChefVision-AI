"use client";

import { StatusBadge, type Tone } from "../../../shared/ui";
import type { PurchaseOrder, PurchaseOrderStatus } from "../data";

const statusTone: Record<PurchaseOrderStatus, Tone> = {
  Draft: "slate",
  Placed: "sky",
  Received: "indigo",
  Invoiced: "emerald",
};

export default function OrderHistory({ orders }: { orders: PurchaseOrder[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="px-1 pb-3 text-xs font-bold text-slate-800">
        Vendor & product purchase history — tracked against supplier invoices
      </div>
      <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full text-left text-[11.5px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="px-5 pt-4 pb-3 font-medium">Order</th>
              <th className="px-5 pt-4 pb-3 font-medium">Vendor</th>
              <th className="px-5 pt-4 pb-3 font-medium">Outlet</th>
              <th className="px-5 pt-4 pb-3 font-medium text-right">Items</th>
              <th className="px-5 pt-4 pb-3 font-medium text-right">Total</th>
              <th className="px-5 pt-4 pb-3 font-medium">Placed via</th>
              <th className="px-5 pt-4 pb-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-slate-900">{order.id}</div>
                  <div className="mt-0.5 text-[10px] text-slate-400">{order.date}</div>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{order.vendor}</td>
                <td className="px-5 py-3.5 text-slate-600">{order.outlet}</td>
                <td className="px-5 py-3.5 text-right text-slate-600">{order.itemCount}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-slate-900">${order.total.toFixed(2)}</td>
                <td className="px-5 py-3.5 text-slate-600">{order.via}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {order.invoiceRef && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                        {order.invoiceRef}
                      </span>
                    )}
                    <StatusBadge label={order.status} tone={statusTone[order.status]} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-1 pt-2 text-[10px] text-slate-400">
        Placed orders flow to the supplier, arrive as deliveries, and reconcile against supplier invoices — the invoice
        reference appears once received and invoiced.
      </p>
    </div>
  );
}
