export type Bucket = "stocks" | "bonds" | "cash" | "other";

export type Money = {
  amount: number;
  currency: string;
};

export type AccountSummary = {
  id: string;
  name: string;
  institution: string;
  lastSyncedAt: string;
  syncing: boolean;
  cash: Money[];
};

export type Holding = {
  id: string;
  accountId: string;
  symbol: string;
  name: string;
  value: number;
  currency: string;
  bucket: Bucket;
};

/** What kind of cash movement an activity was. Direction (in or out) comes from the kind, not the sign. */
export type ActivityKind = "dividend" | "interest" | "contribution" | "sale" | "purchase" | "withdrawal" | "fee";

export type CashActivity = {
  id: string;
  accountId: string;
  date: string;
  type: ActivityKind;
  amount: number;
  currency: string;
  description: string;
};

export type PortfolioSnapshot = {
  source: "demo" | "snaptrade";
  asOf: string;
  accounts: AccountSummary[];
  holdings: Holding[];
  activities: CashActivity[];
  /** Activities in the last 30 days of a kind we do not count (transfers, options and so on). */
  ignoredActivities?: number;
  /** How many of those skipped activities there were of each SnapTrade type. */
  ignoredTypes?: Record<string, number>;
};

export type CurrencySummary = {
  currency: string;
  currentCash: number;
  /** Money that came in over the last 30 days. */
  inflows30d: number;
  /** Money that went out over the last 30 days. */
  outflows30d: number;
  /** inflows30d minus outflows30d. */
  net30d: number;
  /** Estimate of the cash 30 days ago: today's cash minus the net change we can see. */
  cashThen: number;
  dividends: number;
  interest: number;
  contributions: number;
  sales: number;
  purchases: number;
  withdrawals: number;
  fees: number;
};

export type AllocationRow = {
  bucket: Bucket;
  currentValue: number;
  currentPercent: number;
  targetPercent: number;
  simulatedValue: number;
  simulatedPercent: number;
  buyAmount: number;
  driftBefore: number;
  driftAfter: number;
};
