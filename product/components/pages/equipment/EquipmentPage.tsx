"use client";

import { useMemo, useState } from "react";
import { Activity, ChevronRight, Plus, TriangleAlert } from "lucide-react";
import { PageHeader, StatusBadge, type Tone } from "../../shared/ui";
import {
  assets as seedAssets,
  formatDate,
  initialWorkOrders,
  isEscalated,
  type Asset,
  type AssetStatus,
  type Priority,
  type SensorState,
  type WorkOrder,
  type WorkOrderStatus,
} from "./data";
import AssetDetail from "./asset/AssetDetail";
import ReportBreakdownModal from "./workorders/ReportBreakdownModal";
import MaintenanceTimeline from "./schedules/MaintenanceTimeline";

type Tab = "equipment" | "workorders" | "schedules" | "sensors";

const assetStatusTone: Record<AssetStatus, Tone> = {
  Operational: "emerald",
  "Under repair": "amber",
  Retired: "sky",
};

const workOrderStatusTone: Record<WorkOrderStatus, Tone> = {
  Open: "sky",
  Assigned: "indigo",
  "In progress": "amber",
  "Awaiting parts": "slate",
  Resolved: "emerald",
};

const priorityTone: Record<Priority, Tone> = {
  Low: "sky",
  Medium: "indigo",
  High: "amber",
  Urgent: "rose",
};

const sensorTone: Record<SensorState, Tone> = {
  Normal: "emerald",
  Warning: "amber",
  Alert: "rose",
};

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "equipment", label: "Equipment" },
  { id: "workorders", label: "Work orders" },
  { id: "schedules", label: "Schedules" },
  { id: "sensors", label: "Sensors" },
];

export default function EquipmentPage() {
  const [tab, setTab] = useState<Tab>("equipment");
  const [assets, setAssets] = useState<Asset[]>(seedAssets);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [preselectedAssetId, setPreselectedAssetId] = useState<string | null>(null);

  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) ?? null;
  const openWorkOrders = workOrders.filter((workOrder) => workOrder.status !== "Resolved");
  const escalatedWorkOrders = openWorkOrders.filter(isEscalated);
  const sensorAlerts = assets.filter((asset) => asset.sensor && asset.sensor.state !== "Normal");

  const nextWorkOrderId = () => {
    const max = workOrders.reduce((acc, workOrder) => Math.max(acc, Number(workOrder.id.slice(3))), 1040);
    return `WO-${max + 1}`;
  };

  const scheduleRows = useMemo(
    () =>
      assets
        .flatMap((asset) =>
          asset.preventive.map((task) => ({ asset, task }))
        )
        .sort((a, b) => a.task.nextDue.localeCompare(b.task.nextDue)),
    [assets]
  );

  function createWorkOrder(workOrder: WorkOrder) {
    setWorkOrders((current) => [workOrder, ...current]);
    setAssets((current) =>
      current.map((asset) =>
        asset.id === workOrder.assetId
          ? {
              ...asset,
              breakdowns12mo: asset.breakdowns12mo + 1,
              status: asset.status === "Retired" ? asset.status : "Under repair",
            }
          : asset
      )
    );
    setReportOpen(false);
    setPreselectedAssetId(null);
  }

  if (selectedAsset) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-y-auto app-scrollbar">
        <AssetDetail
          asset={selectedAsset}
          onBack={() => setSelectedAssetId(null)}
          nextId={nextWorkOrderId()}
          onCreateWorkOrder={createWorkOrder}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Equipment & Maintenance"
        action={
          <button
            type="button"
            onClick={() => {
              setPreselectedAssetId(null);
              setReportOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <TriangleAlert className="h-4 w-4" />
            Report breakdown
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Registered assets</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{assets.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Open work orders</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{openWorkOrders.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Escalated</div>
          <div className={`mt-1 text-lg font-bold ${escalatedWorkOrders.length ? "text-rose-600" : "text-slate-900"}`}>
            {escalatedWorkOrders.length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400">Sensor alerts</div>
          <div className={`mt-1 text-lg font-bold ${sensorAlerts.length ? "text-amber-600" : "text-slate-900"}`}>
            {sensorAlerts.length}
          </div>
        </div>
      </div>

      <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
        {tabs.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTab(option.id)}
            className={`px-3.5 py-2 text-xs font-semibold transition-colors ${
              index > 0 ? "border-l border-slate-200" : ""
            } ${
              tab === option.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {tab === "equipment" && (
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="overflow-hidden rounded-xl bg-white">
            <table className="w-full text-left text-[11.5px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="px-5 pt-4 pb-3 font-medium">Asset</th>
                  <th className="px-5 pt-4 pb-3 font-medium">Location</th>
                  <th className="px-5 pt-4 pb-3 font-medium">Status</th>
                  <th className="px-5 pt-4 pb-3 font-medium">Sensor</th>
                  <th className="px-5 pt-4 pb-3 font-medium text-right">Faults 12 mo</th>
                  <th className="w-10 px-5 pt-4 pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-slate-900">{asset.name}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{asset.id} · {asset.model}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{asset.location}</td>
                    <td className="px-5 py-4">
                      <StatusBadge label={asset.status} tone={assetStatusTone[asset.status]} />
                    </td>
                    <td className="px-5 py-4">
                      {asset.sensor ? (
                        <StatusBadge label={`${asset.sensor.reading} · ${asset.sensor.state}`} tone={sensorTone[asset.sensor.state]} />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={asset.breakdowns12mo >= 3 ? "font-bold text-rose-600" : "font-semibold text-slate-900"}>
                        {asset.breakdowns12mo}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-300">
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "workorders" && (
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="app-scrollbar max-h-[420px] grid grid-cols-1 gap-0 overflow-hidden overflow-y-auto overscroll-contain rounded-xl sm:grid-cols-2 lg:grid-cols-3">
            {[...workOrders]
              .sort((a, b) => Number(isEscalated(b)) - Number(isEscalated(a)) || a.deadline.localeCompare(b.deadline))
              .map((workOrder) => {
                const asset = assets.find((item) => item.id === workOrder.assetId);
                const escalated = isEscalated(workOrder);
                return (
                  <article
                    key={workOrder.id}
                    className={`border p-4 ${escalated ? "border-rose-200 bg-rose-50/60" : "border-slate-100 bg-white"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-medium text-slate-400">{workOrder.id}</span>
                      <StatusBadge label={workOrder.priority} tone={priorityTone[workOrder.priority]} />
                    </div>
                    <div className="mt-2 text-sm font-semibold leading-snug text-slate-900">{workOrder.title}</div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {asset?.name ?? workOrder.assetId} · {workOrder.assignee}
                    </div>
                    {workOrder.notes ? <div className="mt-1 text-[11px] text-slate-400">{workOrder.notes}</div> : null}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-semibold text-slate-700">
                        Deadline {formatDate(workOrder.deadline)}
                        {escalated && (
                          <span className="ml-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-rose-600">
                            <TriangleAlert className="h-3 w-3" />
                            Escalated
                          </span>
                        )}
                      </div>
                      <StatusBadge label={workOrder.status} tone={workOrderStatusTone[workOrder.status]} />
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      )}

      {tab === "schedules" && <MaintenanceTimeline rows={scheduleRows} />}

      {tab === "sensors" && (
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl sm:grid-cols-2 lg:grid-cols-3">
            {assets
              .filter((asset) => asset.sensor)
              .map((asset) => {
                const sensor = asset.sensor!;
                const stateTint =
                  sensor.state === "Alert"
                    ? "border-rose-200 bg-rose-50/60"
                    : sensor.state === "Warning"
                      ? "border-amber-200 bg-amber-50/60"
                      : "border-slate-100 bg-white";
                return (
                  <article key={asset.id} className={`border p-4 ${stateTint}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{asset.name}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{sensor.metric}</div>
                    </div>
                    <StatusBadge label={sensor.state} tone={sensorTone[sensor.state]} />
                  </div>
                  <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{sensor.reading}</div>
                  <div className="mt-1 text-[11px] text-slate-500">Target {sensor.target}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Updated {sensor.updatedAt}</span>
                    {sensor.state !== "Normal" && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreselectedAssetId(asset.id);
                          setReportOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Activity className="h-3.5 w-3.5" />
                        Report issue
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <ReportBreakdownModal
        open={reportOpen}
        assets={assets}
        nextId={nextWorkOrderId()}
        preselectedAssetId={preselectedAssetId}
        onSubmit={createWorkOrder}
        onClose={() => {
          setReportOpen(false);
          setPreselectedAssetId(null);
        }}
      />
    </div>
  );
}
