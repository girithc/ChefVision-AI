"use client";

import { useEffect, useState } from "react";
import { Inbox, Trash2, X } from "lucide-react";
import { PageHeader, StatusBadge } from "../../shared/ui";
import {
  deleteFeedbackRecord,
  FEEDBACK_CHANGED_EVENT,
  loadFeedback,
  type FeedbackRecord,
} from "../../../lib/feedback-store";

export default function FeedbackPage() {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [pendingDelete, setPendingDelete] = useState<FeedbackRecord | null>(null);

  useEffect(() => {
    // localStorage is client-only: load after mount + refresh whenever a
    // submission happens anywhere in the app (the ✦ widget fires this event).
    setRecords(loadFeedback());
    const refresh = () => setRecords(loadFeedback());
    window.addEventListener(FEEDBACK_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(FEEDBACK_CHANGED_EVENT, refresh);
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Feedback"
        action={
          <span className="text-[11px] font-semibold text-slate-500">
            {records.length} submitted · stored on this device
          </span>
        }
      />

      {records.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <Inbox className="mx-auto h-6 w-6 text-slate-300" />
          <p className="mt-2 text-xs text-slate-400">
            No feedback yet — use the ✦ button (bottom right) on any page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <article key={record.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {record.pageName && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {record.pageName}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {new Date(record.submittedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-300">{record.id}</span>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(record)}
                    aria-label={`Delete feedback ${record.id}`}
                    title="Delete feedback"
                    className="rounded-md p-1 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <dl className="mt-3 space-y-2 text-[11px]">
                {record.ideas && (
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="font-semibold text-slate-500">Ideas</dt>
                    <dd className="mt-0.5 leading-relaxed text-slate-800">{record.ideas}</dd>
                  </div>
                )}
                {record.right && (
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="font-semibold text-slate-500">What's right</dt>
                    <dd className="mt-0.5 leading-relaxed text-slate-800">{record.right}</dd>
                  </div>
                )}
                {record.wrong && (
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="font-semibold text-slate-500">What's wrong</dt>
                    <dd className="mt-0.5 leading-relaxed text-slate-800">{record.wrong}</dd>
                  </div>
                )}
              </dl>

              {record.pageId && (
                <div className="mt-2.5 text-right">
                  <StatusBadge label={record.pageId} tone="slate" />
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div aria-hidden="true" className="absolute inset-0 bg-slate-900/60" onClick={() => setPendingDelete(null)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-900">Delete feedback?</h3>
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                aria-label="Close"
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4 text-xs leading-relaxed text-slate-600">
              {pendingDelete.pageName ? (
                <>
                  The feedback from <strong className="font-semibold text-slate-900">{pendingDelete.pageName}</strong>{" "}
                  ({new Date(pendingDelete.submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}) will be permanently removed from this device.
                </>
              ) : (
                <>This feedback will be permanently removed from this device.</>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteFeedbackRecord(pendingDelete.id);
                  setPendingDelete(null);
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
