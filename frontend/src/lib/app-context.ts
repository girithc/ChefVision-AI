import { createContext, useContext } from "react";

import type { InventoryRecord, PlannedEvent, Receipt, Recipe, Session } from "./types";

export interface AppState {
  session: Session | null;
  offline: boolean;
  /** Retries signing in to the API with the demo account (falls back to offline mode). */
  reconnect(): Promise<void>;

  receipts: Receipt[];
  saveReceipt(receipt: Receipt): void;
  deleteReceipt(id: string): void;
  /** Uploads to the API (if online) and records normalization results on the receipt. */
  submitReceipt(receipt: Receipt): Promise<Receipt>;
  loadSampleData(): void;

  recipes: Recipe[];
  saveRecipe(recipe: Recipe): void;
  deleteRecipe(id: string): void;

  events: PlannedEvent[];
  saveEvent(event: PlannedEvent): void;
  deleteEvent(id: string): void;

  inventory: InventoryRecord[];
  inventoryError: string | null;
  refreshInventory(): Promise<void>;
}

export const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return value;
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
