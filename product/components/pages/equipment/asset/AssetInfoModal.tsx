"use client";

import { X } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import { formatDate, type Asset, type AssetStatus } from "../data";

const statusTone: Record<AssetStatus, Tone> = {
  Operational: "emerald",
  "Under repair": "amber",
  Retired: "sky",
};

type AssetInfoModalProps = {
  asset: Asset | null;
  onClose: () => void;
};

export default function AssetInfoModal({ asset, onClose }: AssetInfoModalProps) {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{asset.name}</h3>
            <p className="mt-0.5 text-[11px] text-slate-400">{asset.id} · {asset.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge label={asset.status} tone={statusTone[asset.status]} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close equipment information"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 text-xs">
          <div><dt className="text-[11px] text-slate-400">Model</dt><dd className="mt-0.5 font-semibold text-slate-900">{asset.model}</dd></div>
          <div><dt className="text-[11px] text-slate-400">Serial</dt><dd className="mt-0.5 font-semibold text-slate-900">{asset.serial}</dd></div>
          <div><dt className="text-[11px] text-slate-400">Location</dt><dd className="mt-0.5 font-semibold text-slate-900">{asset.location}</dd></div>
          <div><dt className="text-[11px] text-slate-400">Purchased</dt><dd className="mt-0.5 font-semibold text-slate-900">{asset.purchasedAt}</dd></div>
          <div><dt className="text-[11px] text-slate-400">Warranty</dt><dd className="mt-0.5 font-semibold text-slate-900">{asset.warranty.provider}</dd></div>
          <div><dt className="text-[11px] text-slate-400">Expires</dt><dd className="mt-0.5 font-semibold text-slate-900">{asset.warranty.expires}</dd></div>
          <div><dt className="text-[11px] text-slate-400">Coverage</dt><dd className="mt-0.5 font-semibold text-slate-900">{asset.warranty.coverage}</dd></div>
          <div><dt className="text-[11px] text-slate-400">Contract</dt><dd className="mt-0.5 font-semibold text-slate-900">{asset.contract ? `${asset.contract.vendor} · ${asset.contract.costPerYear}` : "None"}</dd></div>
          {asset.contract && (
            <div className="col-span-2"><dt className="text-[11px] text-slate-400">Next scheduled visit</dt><dd className="mt-0.5 font-semibold text-slate-900">{asset.contract.cadence} · {formatDate(asset.contract.nextVisit)}</dd></div>
          )}
        </dl>
      </div>
    </div>
  );
}
