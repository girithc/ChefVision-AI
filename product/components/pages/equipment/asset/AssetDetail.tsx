"use client";

import { useState } from "react";
import { ArrowLeft, Info, Repeat2, TriangleAlert } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { formatDate, isPast, type Asset, type AssetStatus, type WorkOrder } from "../data";
import AssetInfoModal from "./AssetInfoModal";
import AlertRecordModal from "./AlertRecordModal";

const statusTone: Record<AssetStatus, Tone> = {
  Operational: "emerald",
  "Under repair": "amber",
  Retired: "sky",
};

const sensorChipTone: Record<string, string> = {
  Normal: "bg-emerald-50 text-emerald-600",
  Warning: "bg-amber-50 text-amber-600",
  Alert: "bg-rose-50 text-rose-600",
};

function AssetTablets({ asset }: { asset: Asset }) {
  return (
    <section className="rounded-2xl bg-slate-50 p-5 xl:col-span-2">
      <div className="px-1 pb-3 text-xs font-bold text-slate-800">Inspection & Monitoring</div>
      <div className="flex flex-wrap divide-x divide-slate-100 overflow-hidden rounded-xl bg-white">
        {asset.preventive.map((task) => {
          const overdue = isPast(task.nextDue);
          return (
            <div key={task.task} className="min-w-44 flex-1 flex flex-col gap-1.5 p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-900">
                {task.task}
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                    overdue ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {overdue ? "Overdue" : `Due ${formatDate(task.nextDue)}`}
                </span>
              </div>
              <div className="text-[10px] text-slate-500">{task.cadence} · last {formatDate(task.lastDone)}</div>
            </div>
          );
        })}

        {asset.sensor && (
          <div className="min-w-44 flex-1 flex flex-col gap-1.5 p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-900">
              {asset.sensor.metric} · {asset.sensor.reading}
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${sensorChipTone[asset.sensor.state]}`}>
                {asset.sensor.state}
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              Target {asset.sensor.target} · Updated {asset.sensor.updatedAt}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function AssetDetail({
  asset,
  onBack,
  nextId,
  onCreateWorkOrder,
}: {
  asset: Asset;
  onBack: () => void;
  nextId: string;
  onCreateWorkOrder: (workOrder: WorkOrder) => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const repairSpend = asset.history
    .filter((record) => record.type === "Repair")
    .reduce((sum, record) => sum + record.cost, 0);
  const replaceRecommended = asset.breakdowns12mo >= 3;

  const upcoming = [
    ...asset.preventive.map((task) => ({
      id: task.task,
      label: task.task,
      sub: `${task.cadence} · last done ${formatDate(task.lastDone)}`,
      due: task.nextDue,
    })),
    ...(asset.contract
      ? [{
          id: "contract-visit",
          label: `${asset.contract.cadence} — ${asset.contract.vendor}`,
          sub: `Contract service · ${asset.contract.costPerYear}`,
          due: asset.contract.nextVisit,
        }]
      : []),
  ]
    .filter((visit) => !isPast(visit.due))
    .sort((a, b) => a.due.localeCompare(b.due));

  return (
    <div className="space-y-5">
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
            {asset.name}
          </h1>
          <span className="text-[11px] font-medium text-slate-400">{asset.id}</span>
          <StatusBadge label={asset.status} tone={statusTone[asset.status]} />
          <button
            type="button"
            onClick={() => setAlertOpen(true)}
            aria-label="Record alert"
            title="Record alert"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition-colors hover:bg-slate-800"
          >
            <TriangleAlert className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1 flex items-center gap-2 pr-1 text-xs text-slate-500">
          <span>{asset.category} · {asset.location}</span>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            aria-label="Equipment information"
            title="Equipment information"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {replaceRecommended && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5">
          <Repeat2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span className="text-xs leading-relaxed text-amber-800">
            <strong className="font-semibold">{asset.breakdowns12mo} breakdowns in 12 months</strong> ·{" "}
            ${repairSpend.toLocaleString()} spent on repairs. Review repair-versus-replace before the next
            failure.
          </span>
        </div>
      )}

      <section className="rounded-2xl bg-slate-50 p-5">
        <div className="px-1 text-xs font-bold text-slate-800">Upcoming visits</div>
        <div className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
          {upcoming.length === 0 ? (
            <p className="px-5 py-4 text-[11px] text-slate-400">No upcoming visits or check-ups scheduled.</p>
          ) : (
            upcoming.map((visit, index) => (
              <article key={visit.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <div className="text-xs font-semibold text-slate-900">{visit.label}</div>
                  <p className="mt-0.5 text-[11px] text-slate-500">{visit.sub}</p>
                </div>
                <StatusBadge
                  label={`${index === 0 ? "Next · " : "Due "}${formatDate(visit.due)}`}
                  tone={index === 0 ? "emerald" : "sky"}
                />
              </article>
            ))
          )}
        </div>
      </section>

      <AssetTablets asset={asset} />

      <section className="rounded-2xl bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="px-2 text-xs font-bold text-slate-800">Service & repair history</h2>
        </div>
        <div className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-xl bg-white">
          {asset.history.map((record) => (
            <article key={record.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div>
                <div className="text-xs font-semibold text-slate-900">{record.summary}</div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {formatDate(record.date)} · {record.type} · {record.by}
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-900">${record.cost.toLocaleString()}</span>
            </article>
          ))}
        </div>
      </section>

      <AssetInfoModal asset={infoOpen ? asset : null} onClose={() => setInfoOpen(false)} />

      {alertOpen && (
        <AlertRecordModal
          asset={asset}
          nextId={nextId}
          onSubmit={onCreateWorkOrder}
          onClose={() => setAlertOpen(false)}
        />
      )}
    </div>
  );
}
