"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

type CameraCaptureModalProps = {
  open: boolean;
  onClose: () => void;
  onCapture: (photoUrl: string) => void;
};

export default function CameraCaptureModal({ open, onClose, onCapture }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);

    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {
        setError("Camera unavailable. You can upload a photo instead.");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [open]);

  function captureFrame() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.9
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">Take photo</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close camera"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-slate-900">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <Camera className="h-6 w-6 text-slate-500" />
              <p className="text-xs text-slate-300">{error}</p>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ImagePlus className="h-4 w-4" />
            Choose file
          </button>

          <button
            type="button"
            onClick={captureFrame}
            disabled={Boolean(error)}
            aria-label="Capture photo"
            title="Capture photo"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Camera className="h-5 w-5" />
          </button>

          <span className="w-[92px]" />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onCapture(URL.createObjectURL(file));
          }}
        />
      </div>
    </div>
  );
}
