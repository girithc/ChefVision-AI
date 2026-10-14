"use client";

import { X } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import type { Asset } from "../data";

const sensorTone: Record<string, Tone> = { Normal: "emerald", Warning: "amber", Alert: "rose" };

type SensorLogsModalProps = {
  asset: Asset | null;
  onClose: () => void;
};

export default function SensorLogsModal({ asset, onClose }: SensorLogsModalProps) {
  if (!asset?.sensor) return null;

  const { sensor } = asset;
  const logs = sensor.logs;
  const width = 340;
  const height = 110;
  const pad = 12;
  const leftPad = 40;
  const values = logs.map((log) => log.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stroke = sensor.state === "Alert" ? "#f43f5e" : sensor.state === "Warning" ? "#f59e0b" : "#10b981";

  const points = logs.map((log, index) => ({
    ...log,
    x: logs.length === 1 ? width / 2 : leftPad + (index / (logs.length - 1)) * (width - leftPad - pad),
    y: height - pad - ((log.value - min) / range) * (height - pad * 2),
  }));
  const linePath = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = `M ${leftPad},${height - pad} L ${linePath.replace(/ /g, " L ")} L ${width - pad},${height - pad} Z`;

  const tickCount = 4;
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const value = min + (range / (tickCount - 1)) * index;
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return { value, y };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{asset.name} — {sensor.metric}</h3>
            <p className="mt-0.5 text-[11px] text-slate-400">Target {sensor.target} · {sensor.updatedAt}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge label={sensor.state} tone={sensorTone[sensor.state]} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sensor logs"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Sensor readings">
              {ticks.map((tick) => (
                <g key={tick.value}>
                  <line x1={leftPad} y1={tick.y} x2={width - pad} y2={tick.y} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3 3" />
                  <text x={leftPad - 6} y={tick.y + 3} textAnchor="end" fontSize="8" fill="#94a3b8">
                    {tick.value.toFixed(1)}{sensor.unit}
                  </text>
                </g>
              ))}
              <path d={areaPath} fill={stroke} opacity={0.08} />
              <path d={`M ${linePath}`} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {points.map((point) => (
                <g key={point.time}>
                  <circle cx={point.x} cy={point.y} r={3} fill="#ffffff" stroke={stroke} strokeWidth={2} />
                  <text x={point.x} y={height - 1} textAnchor="middle" fontSize="7" fill="#94a3b8">
                    {point.time.replace(":02", "").replace(":55", "").replace(":25", "").replace(":17", "").replace(":47", "")}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-3 divide-y divide-slate-50">
            {[...logs].reverse().map((log, index) => (
              <div key={`${log.time}-${index}`} className="flex items-center justify-between px-1 py-2 text-[11px]">
                <span className="text-slate-500">{log.time}</span>
                <span className="font-semibold text-slate-900">
                  {log.value}{sensor.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
