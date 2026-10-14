"use client";

import { useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import type { Asset, Priority, WorkOrder } from "../data";

type ReportBreakdownModalProps = {
  open: boolean;
  assets: Asset[];
  nextId: string;
  preselectedAssetId?: string | null;
  onSubmit: (workOrder: WorkOrder) => void;
  onClose: () => void;
};

const priorityOptions: Priority[] = ["Low", "Medium", "High", "Urgent"];

export default function ReportBreakdownModal({
  open,
  assets,
  nextId,
  preselectedAssetId,
  onSubmit,
  onClose,
}: ReportBreakdownModalProps) {
  const [assetId, setAssetId] = useState(preselectedAssetId ?? assets[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [assignee, setAssignee] = useState("Marco (Maintenance tech)");
  const [deadline, setDeadline] = useState("");

  if (!open) return null;

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400";
  const labelClass = "text-[11px] font-semibold text-slate-500";

  function submit() {
    if (!title.trim() || !assetId || !deadline) return;
    onSubmit({
      id: nextId,
      assetId,
      title: title.trim(),
      priority,
      status: "Open",
      assignee,
      openedAt: new Date().toISOString().slice(0, 10),
      deadline,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <TriangleAlert className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">Report breakdown</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div className="space-y-1">
            <label className={labelClass}>Equipment</label>
            <select value={assetId} onChange={(event) => setAssetId(event.target.value)} className={inputClass}>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.id} — {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>What happened?</label>
            <input
              type="text"
              placeholder="e.g. Not cooling, leaking, making noise…"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as Priority)}
                className={inputClass}
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Repair deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Assign to</label>
            <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className={inputClass}>
              {["Marco (Maintenance tech)", "Sarah (Facilities)", "GasTech Services (vendor)", "ColdFix Ltd (vendor)", "Hobart Care", "AirFlow Systems"].map(
                (person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!title.trim() || !deadline}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create work order
          </button>
        </div>
      </div>
    </div>
  );
}
