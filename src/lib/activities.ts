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
