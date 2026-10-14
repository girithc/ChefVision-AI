"use client";

import { useState } from "react";
import { PenLine, TriangleAlert, X } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import type { Asset, WorkOrder } from "../data";

const sensorTone: Record<string, Tone> = { Normal: "emerald", Warning: "amber", Alert: "rose" };

type SensorNoteModalProps = {
  asset: Asset | null;
  existingNote: string | null;
  onSave: (note: string | null) => void;
  onClose: () => void;
  nextId: string;
  onCreateIssue: (workOrder: WorkOrder) => void;
};

export default function SensorNoteModal({
  asset,
  existingNote,
  onSave,
  onClose,
  nextId,
  onCreateIssue,
}: SensorNoteModalProps) {
  const [draft, setDraft] = useState("");
  const [reading, setReading] = useState<number | null>(() => {
    const parsed = parseFloat(asset?.sensor?.reading ?? "");
    return Number.isFinite(parsed) ? parsed : null;
  });

  if (!asset?.sensor) return null;

  const { sensor } = asset;
  const stateTone: Tone = sensorTone[sensor.state];

  function markAsIssue() {
    if (!asset) return;
    const noteSuffix = draft.trim() ? ` — ${draft.trim()}` : "";
    const readingText = reading !== null ? `${reading}${sensor.unit}` : sensor.reading;
    onCreateIssue({
      id: nextId,
      assetId: asset.id,
      title: `${sensor.metric} ${readingText} outside target (${sensor.target})${noteSuffix}`,
      priority: sensor.state === "Alert" ? "High" : sensor.state === "Warning" ? "Medium" : "Low",
      status: "Open",
      assignee: "Marco (Maintenance tech)",
      openedAt: new Date().toISOString().slice(0, 10),
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: existingNote ? `Staff note: ${existingNote}` : undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">{asset.name} — log</h3>
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
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Reading (manual entry)</div>
              <StatusBadge label={sensor.state} tone={stateTone} />
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">{sensor.metric}</span>
              <input
                type="number"
                inputMode="decimal"
                value={reading ?? ""}
                onChange={(event) => {
                  const parsed = parseFloat(event.target.value);
                  setReading(Number.isFinite(parsed) ? parsed : null);
                }}
                className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-right text-sm font-bold text-slate-900 outline-none focus:border-slate-400"
              />
              <span className="text-xs text-slate-500">{sensor.unit}</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">Target {sensor.target} · last sensor reading {sensor.reading} at {sensor.updatedAt}</div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">Optional note</label>
            <textarea
              rows={3}
              placeholder="Add context — e.g. door left open during delivery…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs leading-relaxed text-slate-700 outline-none focus:border-slate-400"
            />
          </div>

          <p className="text-[10px] text-slate-400">
            Logging is optional — just mark it as an issue and the sensor reading ships with the work order.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
          {existingNote ? (
            <button
              type="button"
              onClick={() => {
                onSave(null);
                onClose();
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              Delete note
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const trimmed = draft.trim();
                onSave(trimmed ? trimmed : existingNote);
                onClose();
              }}
              disabled={!draft.trim()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save note
            </button>
            <button
              type="button"
              onClick={markAsIssue}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <TriangleAlert className="h-4 w-4" />
              Mark as issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
