"use client";

import { BookOpen, X } from "lucide-react";
import type { Sop } from "../data";

type SopModalProps = {
  sop: Sop | null;
  onClose: () => void;
};

export default function SopModal({ sop, onClose }: SopModalProps) {
  if (!sop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BookOpen className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">{sop.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close SOP"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ol className="divide-y divide-slate-50 px-5 py-2">
          {sop.steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                {index + 1}
              </span>
              <span className="text-xs leading-relaxed text-slate-700">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
