/** What the app counts, and what it accepts as feedback. Kept separate so it can be tested. */
export const EVENT_NAMES = ["demo_opened", "live_loaded", "pdf_downloaded"] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export function parseEventName(value: unknown): EventName | null {
  return typeof value === "string" && (EVENT_NAMES as readonly string[]).includes(value) ? (value as EventName) : null;
}

export type FeedbackInput = { useful: boolean; source: "demo" | "live"; note: string | null };

export const MAX_NOTE = 280;

export function parseFeedback(body: unknown): FeedbackInput | null {
  if (body === null || typeof body !== "object") return null;
  const { useful, source, note } = body as Record<string, unknown>;
  if (typeof useful !== "boolean") return null;
  if (source !== "demo" && source !== "live") return null;
  if (note !== undefined && note !== null && typeof note !== "string") return null;
  const clean = typeof note === "string" ? note.replace(/\s+/g, " ").trim().slice(0, MAX_NOTE) : "";
  return { useful, source, note: clean || null };
}

/** True when the request came from our own pages. Browsers always send Origin on a POST. */
export function isSameOrigin(originHeader: string | null, appUrl: string): boolean {
  if (!originHeader) return false;
  try {
    return new URL(originHeader).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseNote(body: unknown): { token: string; note: string } | null {
  if (body === null || typeof body !== "object") return null;
  const { token, note } = body as Record<string, unknown>;
  if (typeof token !== "string" || !UUID.test(token) || typeof note !== "string") return null;
  const clean = note.replace(/\s+/g, " ").trim().slice(0, MAX_NOTE);
  return clean ? { token, note: clean } : null;
}
