import type { ActivityKind } from "./types";

export const MONEY_IN: readonly ActivityKind[] = ["dividend", "interest", "contribution", "sale"];
export const MONEY_OUT: readonly ActivityKind[] = ["purchase", "withdrawal", "fee"];

/**
 * Turns a SnapTrade activity type into a kind we count, or null for kinds we leave out
 * (transfers, options, splits and so on). The direction of the money comes from the kind,
 * so it does not matter whether SnapTrade writes a purchase as a negative or positive amount.
 */
export function classifyActivity(type: string): ActivityKind | null {
  switch (type.toUpperCase()) {
    case "DIVIDEND":
    case "SUBSTITUTE_DIVIDEND":
      return "dividend";
    case "INTEREST":
      return "interest";
    case "CONTRIBUTION":
      return "contribution";
    case "SELL":
      return "sale";
    case "BUY":
    case "REI":
      return "purchase";
    case "WITHDRAWAL":
      return "withdrawal";
    case "FEE":
    case "TAX":
      return "fee";
    default:
      return null;
  }
}

export const isMoneyIn = (kind: ActivityKind) => MONEY_IN.includes(kind);

/** "11 other items are not counted (9 transfer, 2 split)." or null when nothing was skipped. Lists every kind (up to 8). */
export function ignoredSummary(count: number, types?: Record<string, number>): string | null {
  if (!count) return null;
  const sorted = Object.entries(types ?? {}).sort((a, b) => b[1] - a[1]);
  const shown = sorted.slice(0, 8).map(([type, n]) => `${n} ${type.toLowerCase().replace(/_/g, " ")}`);
  const more = sorted.length - 8;
  if (more > 0) shown.push(`and ${more} more ${more === 1 ? "kind" : "kinds"}`);
  return `${count} other ${count === 1 ? "item is" : "items are"} not counted${shown.length ? ` (${shown.join(", ")})` : ""}.`;
}

/** The sentence about cash 30 days ago. It is only a rough guess when some activity was skipped. */
export function cashThenNote(thenMoney: string, ignored: string | null): string {
  return ignored
    ? `Rough guess: cash was about ${thenMoney} 30 days ago. ${ignored} Treat this as a guess.`
    : `Cash was about ${thenMoney} 30 days ago. That is an estimate from the activity SnapTrade lists. Things it does not list, like currency exchanges, are not counted.`;
}
