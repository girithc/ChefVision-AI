"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Camera,
  CheckCircle2,
  Circle,
  Thermometer,
  TriangleAlert,
} from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import type { CheckKind, Checklist, ChecklistItem, Sop } from "../data";
import CameraCaptureModal from "./CameraCaptureModal";
import SopModal from "./SopModal";

const kindTag: Record<CheckKind, string> = {
  check: "text-slate-600 bg-slate-100",
  photo: "text-sky-700 bg-sky-50",
  temperature: "text-amber-700 bg-amber-50",
};

const kindChip: Record<CheckKind, string> = {
  check: "bg-slate-100 text-slate-600",
  photo: "bg-sky-100 text-sky-700",
  temperature: "bg-amber-100 text-amber-700",
};

const kindLabel: Record<CheckKind, string> = {
  check: "Check",
  photo: "Photo",
  temperature: "Temperature",
};

const kindIcon = {
  check: CheckCircle2,
  photo: Camera,
  temperature: Thermometer,
} as const;

const frequencyTone: Record<Checklist["frequency"], Tone> = {
  daily: "sky",
  weekly: "indigo",
  monthly: "amber",
};

export default function ChecklistRun({ checklist, onBack }: { checklist: Checklist; onBack: () => void }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [temps, setTemps] = useState<Record<string, string>>({});
  const [tempDraft, setTempDraft] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [activePhotoItemId, setActivePhotoItemId] = useState<string | null>(null);
  const [activeSop, setActiveSop] = useState<Sop | null>(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const total = checklist.items.length;
  const isItemDone = (item: ChecklistItem) =>
    item.kind === "photo" ? Boolean(photos[item.id]) : Boolean(done[item.id]);
  const completed = checklist.items.filter(isItemDone).length;
  const isComplete = completed === total && total > 0;

  useEffect(() => {
    return () => {
      Object.values(photosRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function toggleDone(id: string) {
    setDone((current) => ({ ...current, [id]: !current[id] }));
  }

  function openCamera(itemId: string) {
    setActivePhotoItemId(itemId);
  }

  function handlePhotoCapture(photoUrl: string) {
    const itemId = activePhotoItemId;
    if (!itemId) return;
    setPhotos((current) => {
      const previous = current[itemId];
      if (previous) URL.revokeObjectURL(previous);
      return { ...current, [itemId]: photoUrl };
    });
    setVerified((current) => ({ ...current, [itemId]: false }));
    setActivePhotoItemId(null);
  }

  function removePhoto(itemId: string) {
    setPhotos((current) => {
      const url = current[itemId];
      if (url) URL.revokeObjectURL(url);
      const next = { ...current };
      delete next[itemId];
      return next;
    });
    setVerified((current) => {
      const next = { ...current };
      delete next[itemId];
      return next;
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {checklist.title}
          </h1>
          <StatusBadge label={checklist.frequency} tone={frequencyTone[checklist.frequency]} />
          {checklist.overdue && (
            <StatusBadge label="Overdue" tone="rose" />
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {checklist.outlet} · {checklist.department} · {checklist.shift} shift · {checklist.reminder}
        </p>
      </div>

      {checklist.overdue && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5">
          <TriangleAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span className="text-xs font-medium text-rose-700">
            This checklist is past its due time — complete it as soon as possible.
          </span>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span>{completed} of {total} complete</span>
          <span>{Math.round((completed / total) * 100)}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
        {isComplete && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            All checks complete
          </div>
        )}
      </div>

      <div className="app-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto">
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
            {checklist.items.map((item) => {
              const itemDone = isItemDone(item);
              const Icon = kindIcon[item.kind];
              return (
                <article key={item.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${kindChip[item.kind]}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold ${itemDone ? "text-slate-400 line-through" : "text-slate-900"}`}>
                          {item.label}
                        </div>
                        {item.hint ? <p className="mt-0.5 text-[11px] text-slate-500">{item.hint}</p> : null}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${kindTag[item.kind]}`}>
                            {kindLabel[item.kind]}
                          </span>
                          {item.sop && (
                            <button
                              type="button"
                              onClick={() => setActiveSop(item.sop ?? null)}
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 transition-colors hover:bg-emerald-100"
                            >
                              <BookOpen className="h-3 w-3" />
                              SOP
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {item.kind === "check" && (
                        <button
                          type="button"
                          onClick={() => toggleDone(item.id)}
                          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                            itemDone
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {itemDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                          {itemDone ? "Done" : "Mark done"}
                        </button>
                      )}

                      {item.kind === "photo" && (
                        <div className="flex items-center gap-2">
                          {itemDone && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photos[item.id]}
                              alt={`Captured for ${item.label}`}
                              className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => openCamera(item.id)}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                              itemDone
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <Camera className="h-4 w-4" />
                            {itemDone ? "Retake" : "Take photo"}
                          </button>
                          {itemDone && (
                            <button
                              type="button"
                              onClick={() => removePhoto(item.id)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )}

                      {item.kind === "temperature" && (
                        <div className="flex items-center gap-2">
                          {itemDone ? (
                            <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                              <Thermometer className="h-4 w-4" />
                              Logged: {temps[item.id]}°F
                            </span>
                          ) : (
                            <>
                              <input
                                type="number"
                                inputMode="decimal"
                                placeholder="°F"
                                value={tempDraft[item.id] ?? ""}
                                onChange={(event) =>
                                  setTempDraft((current) => ({ ...current, [item.id]: event.target.value }))
                                }
                                className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const value = (tempDraft[item.id] ?? "").trim();
                                  if (!value) return;
                                  setTemps((current) => ({ ...current, [item.id]: value }));
                                  setDone((current) => ({ ...current, [item.id]: true }));
                                }}
                                disabled={!(tempDraft[item.id] ?? "").trim()}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Log
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.kind === "photo" && item.reference && itemDone && (
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Required standard</div>
                          <div className="mt-1.5 flex aspect-video items-center justify-center rounded-lg border border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-2 text-center">
                            <span className="text-[10px] leading-snug text-emerald-800">{item.reference}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Submitted</div>
                          <div className="mt-1.5 aspect-video overflow-hidden rounded-lg border border-slate-200 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photos[item.id]} alt={`Submitted for ${item.label}`} className="h-full w-full object-cover" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end">
                        {verified[item.id] ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                            <BadgeCheck className="h-4 w-4" />
                            Verified against standard
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setVerified((current) => ({ ...current, [item.id]: true }))}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800"
                          >
                            <BadgeCheck className="h-4 w-4" />
                            Verify against standard
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <CameraCaptureModal
        open={Boolean(activePhotoItemId)}
        onClose={() => setActivePhotoItemId(null)}
        onCapture={handlePhotoCapture}
      />
      <SopModal sop={activeSop} onClose={() => setActiveSop(null)} />
    </div>
  );
}
