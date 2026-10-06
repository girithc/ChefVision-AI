import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import * as api from "./api";
import { AppContext, type AppState } from "./app-context";
import { inventoryFromReceipts } from "./planning";
import { sampleReceipts, seedEvents, seedRecipes } from "./seed";
import type { InventoryRecord, PlannedEvent, Receipt, Recipe, Session } from "./types";

function readStorage<T>(key: string | null, fallback: T): T {
  if (!key) return fallback;
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

function usePersistentState<T>(key: string | null, initial: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initial));
  const [loadedKey, setLoadedKey] = useState(key);

  // Re-load during render when the storage key changes (e.g. a different restaurant signs in).
  if (loadedKey !== key) {
    setLoadedKey(key);
    setValue(readStorage(key, initial));
  }

  const update = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(previous) : next;
        if (key) localStorage.setItem(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [item, ...list];
  const copy = [...list];
  copy[index] = item;
  return copy;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = usePersistentState<Session | null>("chefvision.session", null);
  const scope = session ? `chefvision.${session.restaurantId}` : null;

  const [receipts, setReceipts] = usePersistentState<Receipt[]>(scope && `${scope}.receipts`, []);
  const [recipes, setRecipes] = usePersistentState<Recipe[]>(scope && `${scope}.recipes`, seedRecipes);
  const [events, setEvents] = usePersistentState<PlannedEvent[]>(scope && `${scope}.events`, seedEvents);
  const [serverInventory, setServerInventory] = useState<InventoryRecord[]>([]);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const offline = Boolean(session && !session.token);
  const token = session?.token ?? null;

  const signOut = useCallback(() => {
    setSession(null);
    setServerInventory([]);
  }, [setSession]);

  const refreshInventory = useCallback(async () => {
    if (!token) return;
    try {
      setServerInventory(await api.getInventory(token));
      setInventoryError(null);
    } catch (error) {
      if (error instanceof api.ApiError && error.status === 401) {
        signOut();
        return;
      }
      setInventoryError(error instanceof Error ? error.message : "Failed to load inventory");
    }
  }, [token, signOut]);

  useEffect(() => {
    // Fetch-on-mount: state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshInventory();
  }, [refreshInventory]);

  const inventory = useMemo(
    () => (offline ? inventoryFromReceipts(receipts) : serverInventory),
    [offline, receipts, serverInventory],
  );

  const submitReceipt = useCallback(
    async (receipt: Receipt): Promise<Receipt> => {
      if (!token) {
        const local = { ...receipt, status: "local" as const, statusMessage: "Saved locally (offline mode)" };
        setReceipts((list) => upsert(list, local));
        return local;
      }

      const pending: Receipt = { ...receipt, status: "pending", statusMessage: "Uploading" };
      setReceipts((list) => upsert(list, pending));
      try {
        const { invoiceId } = await api.uploadReceipt(token, receipt);
        setReceipts((list) => upsert(list, { ...pending, invoiceId, status: "processing", statusMessage: "Normalizing" }));
        const invoice = await api.waitForInvoice(token, invoiceId);
        const finished: Receipt = {
          ...pending,
          invoiceId,
          status: invoice.status,
          statusMessage: invoice.errorMessage ?? undefined,
          normalized: invoice.lineItems,
        };
        setReceipts((list) => upsert(list, finished));
        await refreshInventory();
        return finished;
      } catch (error) {
        const failed: Receipt = {
          ...pending,
          status: "error",
          statusMessage: error instanceof Error ? error.message : "Upload failed",
        };
        setReceipts((list) => upsert(list, failed));
        return failed;
      }
    },
    [token, setReceipts, refreshInventory],
  );

  const value: AppState = {
    session,
    offline,
    signIn: setSession,
    signOut,

    receipts,
    saveReceipt: (receipt) => setReceipts((list) => upsert(list, receipt)),
    deleteReceipt: (id) => setReceipts((list) => list.filter((receipt) => receipt.id !== id)),
    submitReceipt,
    loadSampleData: () => setReceipts((list) => [...sampleReceipts(), ...list]),

    recipes,
    saveRecipe: (recipe) => setRecipes((list) => upsert(list, recipe)),
    deleteRecipe: (id) => setRecipes((list) => list.filter((recipe) => recipe.id !== id)),

    events,
    saveEvent: (event) => setEvents((list) => upsert(list, event)),
    deleteEvent: (id) => setEvents((list) => list.filter((event) => event.id !== id)),

    inventory,
    inventoryError: offline ? null : inventoryError,
    refreshInventory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
