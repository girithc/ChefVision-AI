"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Mic, TriangleAlert, X } from "lucide-react";
import CameraCaptureModal from "../../checklists/run/CameraCaptureModal";
import type { Asset, Priority, WorkOrder } from "../data";

type AlertRecordModalProps = {
  asset: Asset;
  nextId: string;
  onSubmit: (workOrder: WorkOrder) => void;
  onClose: () => void;
};

type SpeechResultEvent = { results: { [index: number]: { [index: number]: { transcript: string } } } };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type constructorOfSpeech = new () => SpeechRecognitionLike;

const priorityOptions: Priority[] = ["Low", "Medium", "High", "Urgent"];

const staffOptions = [
  "Marco (Maintenance tech)",
  "Sarah (Facilities)",
  "GasTech Services (vendor)",
  "ColdFix Ltd (vendor)",
  "Hobart Care",
  "AirFlow Systems",
];

export default function AlertRecordModal({ asset, nextId, onSubmit, onClose }: AlertRecordModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("High");
  const [assignee, setAssignee] = useState(staffOptions[0]);
  const [deadline, setDeadline] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const voiceSupported =
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function toggleVoice() {
    if (listening) {
      stopListening();
      return;
    }
    const scope = window as unknown as {
      SpeechRecognition?: constructorOfSpeech;
      webkitSpeechRecognition?: constructorOfSpeech;
    };
    const ctor = scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
    if (!ctor) {
      setVoiceMessage("Voice input is not supported in this browser — please type instead.");
      return;
    }
    const recognition: SpeechRecognitionLike = new ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTitle((current) => (current ? `${current} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setVoiceMessage(null);
    setListening(true);
    recognition.start();
  }

  function handlePhotoCapture(photoUrl: string) {
    setPhotoUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return photoUrl;
    });
    setCameraOpen(false);
  }

  function submit() {
    if (!title.trim() || !deadline) return;
    onSubmit({
      id: nextId,
      assetId: asset.id,
      title: title.trim() + (photoUrl ? " · photo evidence attached" : ""),
      priority,
      status: "Open",
      assignee,
      openedAt: new Date().toISOString().slice(0, 10),
      deadline,
      notes: photoUrl ? "Photo evidence attached to this alert." : undefined,
    });
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400";
  const labelClass = "text-[11px] font-semibold text-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <TriangleAlert className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Record alert</h3>
              <p className="mt-0.5 text-[11px] text-slate-400">{asset.name} · {asset.id}</p>
            </div>
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
            <label className={labelClass}>What happened?</label>
            <input
              type="text"
              placeholder="Describe the issue, or use voice below…"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  listening
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {listening && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />}
                <Mic className="h-4 w-4" />
                {listening ? "Listening… tap to stop" : "Voice input"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                photoUrl
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Camera className="h-4 w-4" />
              {photoUrl ? "Photo attached" : "Camera"}
            </button>
          </div>

          {voiceMessage && <p className="text-[11px] text-slate-500">{voiceMessage}</p>}
          {!voiceSupported && (
            <p className="text-[11px] text-slate-400">Voice input is not supported in this browser — please type instead.</p>
          )}

          {photoUrl && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="Alert evidence" className="h-14 w-14 rounded-lg border border-slate-200 object-cover" />
              <div className="min-w-0 flex-1 text-[11px] font-medium text-slate-600">Photo evidence attached</div>
              <button
                type="button"
                onClick={() => {
                  if (photoUrl) URL.revokeObjectURL(photoUrl);
                  setPhotoUrl(null);
                }}
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>Priority</label>
              <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className={inputClass}>
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Repair deadline</label>
              <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Assign to</label>
            <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className={inputClass}>
              {staffOptions.map((person) => (
                <option key={person} value={person}>{person}</option>
              ))}
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

      <CameraCaptureModal open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handlePhotoCapture} />
    </div>
  );
}
