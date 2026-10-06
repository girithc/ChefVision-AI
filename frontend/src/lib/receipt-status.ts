import type { BadgeTone } from "@/components/ui";
import type { Receipt } from "./types";

export const statusBadge: Record<Receipt["status"], { tone: BadgeTone; label: string }> = {
  local: { tone: "slate", label: "Saved locally" },
  pending: { tone: "sky", label: "Uploading" },
  processing: { tone: "sky", label: "Normalizing" },
  done: { tone: "green", label: "In inventory" },
  error: { tone: "rose", label: "Error" },
};

export function needsReviewCount(receipt: Receipt): number {
  return (receipt.normalized ?? []).filter((item) => item.routing && item.routing !== "auto_commit").length;
}
