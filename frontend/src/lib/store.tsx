import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import * as api from "./api";
import { AppContext, type AppState } from "./app-context";
import { inventoryFromReceipts } from "./planning";
import type { InventoryRecord, InvoiceRecord, PlannedEvent, Receipt, Recipe, Session } from "./types";

const SESSION_KEY = "chefvision.session";

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

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

function receiptFromInvoice(invoice: InvoiceRecord): Receipt {
  return {
    id: invoice.externalReceiptId ?? invoice.id,
    invoiceId: invoice.id,
    source: invoice.source,
    supplier: invoice.supplierName ?? "",
    date: invoice.invoiceDate ?? invoice.createdAt.slice(0, 10),
    invoiceNumber: invoice.invoiceNumber ?? "",
    items: invoice.lineItems.map((item) => ({
      name: item.rawName,
      qty: item.rawQty,
      unit: item.rawUnit,
      unitPrice: item.unitPrice,
    })),
    tax: invoice.tax,
    tip: invoice.tip,
    notes: invoice.notes,
    status: invoice.status,
    statusMessage: invoice.errorMessage ?? undefined,
    normalized: invoice.lineItems,
    createdAt: invoice.createdAt,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const scope = session ? `chefvision.${session.restaurantId}` : null;

  const [receipts, setReceipts] = usePersistentState<Receipt[]>(scope && `${scope}.receipts`, []);
  const [recipes, setRecipes] = usePersistentState<Recipe[]>(scope && `${scope}.recipes`, []);
  const [events, setEvents] = usePersistentState<PlannedEvent[]>(scope && `${scope}.events`, []);
  const [serverInventory, setServerInventory] = useState<InventoryRecord[]>([]);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const offline = false;
  const token = session?.token ?? null;

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthenticating(true);
    setAuthError(null);
    setServerInventory([]);
    try {
      const result = await api.login(email, password);
      const next = { token: result.token, role: result.role, restaurantId: result.restaurantId, email };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setSession(next);
      setAuthenticating(false);
      return true;
    } catch (error) {
      setSession(null);
      setAuthError(error instanceof Error ? error.message : "Sign-in failed");
      setAuthenticating(false);
      return false;
    }
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
    setServerInventory([]);
  }, []);

  useEffect(() => {
    if (!token) return;
    void api.listInvoices(token).then((invoices) => {
      setReceipts(invoices.map(receiptFromInvoice));
    }).catch((error) => {
      setInventoryError(error instanceof Error ? error.message : "Failed to load receipt history");
    });
  }, [token, setReceipts]);

  useEffect(() => {
    if (!token) return;
    void Promise.all([api.listRecipes(token), api.listEvents(token)])
      .then(([savedRecipes, savedEvents]) => {
        setRecipes(savedRecipes);
        setEvents(savedEvents);
      })
      .catch((error) => {
        setInventoryError(error instanceof Error ? error.message : "Failed to load planning data");
      });
  }, [token, setRecipes, setEvents]);

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
    authenticating,
    authError,
    offline,
    signIn,
    signOut,

    receipts,
    saveReceipt: (receipt) => {
      setReceipts((list) => upsert(list, receipt));
      if (token && receipt.invoiceId) void api.updateInvoice(token, receipt.invoiceId, receipt);
    },
    deleteReceipt: (id) => {
      const receipt = receipts.find((entry) => entry.id === id);
      setReceipts((list) => list.filter((entry) => entry.id !== id));
      if (token && receipt?.invoiceId) {
        void api.deleteInvoice(token, receipt.invoiceId).then(refreshInventory);
      }
    },
    submitReceipt,
    recipes,
    saveRecipe: (recipe) => {
      setRecipes((list) => upsert(list, recipe));
      if (token) void api.saveRecipe(token, recipe);
    },
    deleteRecipe: (id) => {
      setRecipes((list) => list.filter((recipe) => recipe.id !== id));
      if (token) void api.deleteRecipe(token, id);
    },

    events,
    saveEvent: (event) => {
      setEvents((list) => upsert(list, event));
      if (token) void api.saveEvent(token, event);
    },
    deleteEvent: (id) => {
      setEvents((list) => list.filter((event) => event.id !== id));
      if (token) void api.deleteEvent(token, id);
    },

    inventory,
    inventoryError: offline ? null : inventoryError,
    refreshInventory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
