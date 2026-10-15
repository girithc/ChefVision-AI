/**
 * Feedback store — all text, so localStorage on the frontend is enough.
 * Swap `saveFeedbackRecord` for a backend POST when the API exists.
 */

export type FeedbackRecord = {
  id: string;
  pageId: string | null;
  pageName: string | null;
  ideas: string;
  right: string;
  wrong: string;
  submittedAt: string;
};

const KEY = "chefvision-feedback";

/** Fired on the window whenever the store changes, so open listeners refresh. */
export const FEEDBACK_CHANGED_EVENT = "chefvision-feedback-changed";

export function loadFeedback(): FeedbackRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FeedbackRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveFeedbackRecord(record: FeedbackRecord): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadFeedback();
    window.localStorage.setItem(KEY, JSON.stringify([record, ...all]));
    window.dispatchEvent(new CustomEvent(FEEDBACK_CHANGED_EVENT));
  } catch {
    // storage full or unavailable — feedback is best-effort
  }
}

export function deleteFeedbackRecord(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const remaining = loadFeedback().filter((record) => record.id !== id);
    window.localStorage.setItem(KEY, JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent(FEEDBACK_CHANGED_EVENT));
  } catch {
    // best-effort
  }
}
