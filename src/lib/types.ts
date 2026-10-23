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

export type CashActivity = {
  id: string;
  accountId: string;
  date: string;
  type: "dividend" | "interest" | "contribution";
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
};

export type CurrencySummary = {
  currency: string;
  currentCash: number;
  inflows30d: number;
  dividends: number;
  interest: number;
  contributions: number;
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
