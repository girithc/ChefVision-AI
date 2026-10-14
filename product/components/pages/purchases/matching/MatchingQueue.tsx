"use client";

import { Check, X } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import type { MatchCandidate } from "../data";

const statusTone: Record<MatchCandidate["status"], Tone> = {
  Pending: "amber",
  Confirmed: "emerald",
  Rejected: "rose",
};

type MatchingQueueProps = {
  matches: MatchCandidate[];
  onDecide: (id: string, status: "Confirmed" | "Rejected") => void;
};

export default function MatchingQueue({ matches, onDecide }: MatchingQueueProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl bg-white sm:grid-cols-2 lg:grid-cols-3">
        {matches.length === 0 && (
          <p className="p-5 text-[11px] text-slate-400">Nothing in the matching queue — all clear.</p>
        )}
        {matches.map((match) => (
          <article key={match.id} className="flex flex-col border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  SKU {match.sku}
                </div>
                <div className="mt-0.5 truncate text-sm font-bold text-slate-900">{match.rawName}</div>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {match.confidence}%
              </span>
            </div>

            <div className="mt-1 text-sm font-semibold text-emerald-700">
              {match.matchedIngredient}
            </div>

            <div className="mt-1 text-[11px] text-slate-500">{match.supplier}</div>

            <div className="mt-3 flex items-center justify-between gap-2">
              {match.status === "Pending" ? (
                <div className="flex w-full overflow-hidden rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => onDecide(match.id, "Confirmed")}
                    className="flex flex-1 items-center justify-center gap-1.5 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => onDecide(match.id, "Rejected")}
                    className="flex flex-1 items-center justify-center gap-1.5 border-l border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              ) : (
                <StatusBadge label={match.status === "Confirmed" ? "Accepted" : "Rejected"} tone={statusTone[match.status]} />
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
