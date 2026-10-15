"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { saveFeedbackRecord } from "../../lib/feedback-store";

type FeedbackPage = { id: string; name: string } | null;

type FeedbackWidgetProps = {
  page?: FeedbackPage;
};

export default function FeedbackWidget({ page = null }: FeedbackWidgetProps) {
  const [open, setOpen] = useState(false);
  const [ideas, setIdeas] = useState("");
  const [right, setRight] = useState("");
  const [wrong, setWrong] = useState("");
  const [sent, setSent] = useState(false);

  const hasContent = ideas.trim() || right.trim() || wrong.trim();

  function submit() {
    if (!hasContent) return;
    saveFeedbackRecord({
      id: `fb-${Date.now()}`,
      pageId: page?.id ?? null,
      pageName: page?.name ?? null,
      ideas: ideas.trim(),
      right: right.trim(),
      wrong: wrong.trim(),
      submittedAt: new Date().toISOString(),
    });
    setSent(true);
    setIdeas("");
    setRight("");
    setWrong("");
  }

  function close() {
    setOpen(false);
    setSent(false);
    setIdeas("");
    setRight("");
    setWrong("");
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Send feedback"
          title="Send feedback"
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex max-h-[80vh] w-[min(94vw,400px)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl">
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[13px] font-bold text-slate-900">Feedback</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">About</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {page?.name ?? "General"}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close feedback"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {sent ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 pb-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-sm font-bold text-slate-900">Thank you</p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Send more
              </button>
            </div>
          ) : (
            <>
              <div className="app-scrollbar flex-1 space-y-3.5 overflow-y-auto px-5 pb-2">
                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-600">Ideas</span>
                  <textarea
                    rows={2}
                    value={ideas}
                    onChange={(event) => setIdeas(event.target.value)}
                    placeholder="Features, improvements, wish list…"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-600">What's right</span>
                  <textarea
                    rows={2}
                    value={right}
                    onChange={(event) => setRight(event.target.value)}
                    placeholder="What's saving you time…"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-600">What's wrong</span>
                  <textarea
                    rows={2}
                    value={wrong}
                    onChange={(event) => setWrong(event.target.value)}
                    placeholder="Bugs, confusion, friction…"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </label>
              </div>

              <div className="px-5 pb-4 pt-2">
                <button
                  type="button"
                  onClick={submit}
                  disabled={!hasContent}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Send feedback
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
