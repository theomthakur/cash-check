import type { EventName } from "./feedback";

/** Counts one anonymous event. Never blocks the page and never throws. */
export function track(name: EventName) {
  try {
    void fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }), keepalive: true }).catch(() => undefined);
  } catch {
    /* counting is optional */
  }
}
