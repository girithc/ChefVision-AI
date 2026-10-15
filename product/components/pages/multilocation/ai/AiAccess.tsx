"use client";

import { useState } from "react";
import { Camera, Link2, MessagesSquare, Sparkles } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { chatChannels, posConnections } from "../data";

const sampleQuestions = [
  "How is operational performance this week?",
  "Which location needs attention first?",
  "What problems keep repeating?",
];

export default function AiAccess() {
  const [answer, setAnswer] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />
          <span className="text-xs font-semibold text-violet-900">
            AI questions about operational performance
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {sampleQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() =>
                setAnswer(
                  question.startsWith("How")
                    ? "Company health is 84/100. Sales +4.1% WoW, food cost inside target, but checklist completion at Airport dropped to 84% and 4 issues are open there."
                    : question.startsWith("Which")
                      ? "Airport (licensed) first: health 71 and falling, 3 overdue checklists, 4 open issues, and the worst food cost (34.8%). Assign a due-dated corrective action to its manager."
                      : "Two patterns repeat across locations: walk-in temperature breaches (7× — Downtown + Airport) and late invoice entry past 24h (11×, all locations). Both have named owners and open corrective actions."
                )
              }
              className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-violet-700 transition-colors hover:bg-violet-100"
            >
              {question}
            </button>
          ))}
        </div>
        {answer && (
          <div className="mt-2.5 rounded-xl bg-white/90 px-4 py-3 text-xs leading-relaxed text-violet-950">{answer}</div>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="flex items-center gap-2 px-1 pb-3 text-xs font-bold text-slate-800">
            <MessagesSquare className="h-3.5 w-3.5 text-slate-500" />
            Chat & messaging access
          </div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
            {chatChannels.map((channel) => (
              <div key={channel.name} className="flex items-center justify-between gap-3 px-5 py-3.5 text-[11px]">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{channel.name}</div>
                  <div className="mt-0.5 truncate text-[10px] text-slate-400">{channel.detail}</div>
                </div>
                <StatusBadge label={channel.connected ? "Connected" : "Available"} tone={channel.connected ? "emerald" : "slate"} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="flex items-center gap-2 px-1 pb-3 text-xs font-bold text-slate-800">
            <Camera className="h-3.5 w-3.5 text-slate-500" />
            AI photo verification & pattern detection
          </div>
          <div className="space-y-2 rounded-xl bg-white p-4 text-[11px] leading-relaxed text-slate-600">
            <p>
              <strong className="font-semibold text-slate-900">Photo verification:</strong> checklist photos are checked
              against the reference standard (e.g. FIFO-labeled shelves) — low match confidence lands in review.
            </p>
            <p>
              <strong className="font-semibold text-slate-900">Pattern detection:</strong> repeated photo rejections and
              check failures cluster into recurring problems — surfaced in the Issues tab automatically.
            </p>
            <p className="text-slate-400">
              3 rejections this week clustered into 1 recurring problem (Pico labeling, Riverside).
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex items-center gap-2 px-1 pb-3 text-xs font-bold text-slate-800">
          <Link2 className="h-3.5 w-3.5 text-slate-500" />
          Read-only POS data connections
        </div>
        <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl bg-white sm:grid-cols-2">
          {posConnections.map((connection) => (
            <div key={connection.name} className="flex items-center justify-between gap-3 border border-slate-100 p-4 text-[11px]">
              <div>
                <div className="font-semibold text-slate-900">{connection.name}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{connection.detail}</div>
              </div>
              <StatusBadge label={`${connection.mode} · ${connection.connected ? "Connected" : "Available"}`} tone={connection.connected ? "emerald" : "slate"} />
            </div>
          ))}
        </div>
        <p className="px-1 pt-2 text-[10px] text-slate-400">
          Read-only by design: POS data flows in for analysis — the platform never writes back to the POS.
        </p>
      </div>
    </div>
  );
}
