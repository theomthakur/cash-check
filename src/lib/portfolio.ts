import type {
  AllocationRow,
  Bucket,
  CurrencySummary,
  PortfolioSnapshot,
} from "./types";

const BUCKETS: Bucket[] = ["stocks", "bonds", "cash", "other"];

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function cashByCurrency(
  snapshot: PortfolioSnapshot,
  now = new Date(snapshot.asOf),
): CurrencySummary[] {
  const rows = new Map<string, CurrencySummary>();
  const get = (currency: string) => {
    const code = currency.toUpperCase();
    const existing = rows.get(code);
    if (existing) return existing;
    const created: CurrencySummary = {
      currency: code,
      currentCash: 0,
      inflows30d: 0,
      dividends: 0,
      interest: 0,
      contributions: 0,
    };
    rows.set(code, created);
    return created;
  };

  for (const account of snapshot.accounts) {
    for (const cash of account.cash) {
      get(cash.currency).currentCash += cash.amount;
    }
  }

  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - 30);
  for (const activity of snapshot.activities) {
    const date = new Date(activity.date);
    if (date < cutoff || date > now || activity.amount <= 0) continue;
    const row = get(activity.currency);
    row.inflows30d += activity.amount;
    const field = activity.type === "dividend" ? "dividends" : activity.type === "contribution" ? "contributions" : "interest";
    row[field] += activity.amount;
  }

  return [...rows.values()]
    .map((row) => ({
      ...row,
      currentCash: roundMoney(row.currentCash),
      inflows30d: roundMoney(row.inflows30d),
      dividends: roundMoney(row.dividends),
      interest: roundMoney(row.interest),
      contributions: roundMoney(row.contributions),
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

export function bucketValues(
  snapshot: PortfolioSnapshot,
  currency: string,
): Record<Bucket, number> {
  const result: Record<Bucket, number> = {
    stocks: 0,
    bonds: 0,
    cash: 0,
    other: 0,
  };
  for (const holding of snapshot.holdings) {
    if (holding.currency === currency) result[holding.bucket] += holding.value;
  }
  const accountCash = snapshot.accounts.flatMap((account) => account.cash);
  for (const cash of accountCash) {
    if (cash.currency === currency) result.cash += cash.amount;
  }
  return result;
}

export function allocationDrift(
  values: Record<Bucket, number>,
  targets: Record<Bucket, number>,
): number {
  const total = BUCKETS.reduce((sum, bucket) => sum + values[bucket], 0);
  if (total <= 0) return 0;
  return BUCKETS.reduce(
    (sum, bucket) =>
      sum + Math.abs((values[bucket] / total) * 100 - targets[bucket]),
    0,
  );
}

export function simulateBuyOnly(
  values: Record<Bucket, number>,
  targets: Record<Bucket, number>,
): AllocationRow[] {
  const targetTotal = BUCKETS.reduce((sum, bucket) => sum + targets[bucket], 0);
  const validTarget = Math.abs(targetTotal - 100) <= 0.001;

  const total = BUCKETS.reduce((sum, bucket) => sum + values[bucket], 0);
  const availableCash = Math.max(0, values.cash);
  const simulated = { ...values };
  const buys: Record<Bucket, number> = {
    stocks: 0,
    bonds: 0,
    cash: 0,
    other: 0,
  };

  if (validTarget && total > 0 && availableCash > 0) {
    const desired = BUCKETS.filter((bucket) => bucket !== "cash").map(
      (bucket) => ({
        bucket,
        deficit: Math.max(0, (targets[bucket] / 100) * total - values[bucket]),
      }),
    );
    const totalDeficit = desired.reduce((sum, item) => sum + item.deficit, 0);
    const targetCash = (targets.cash / 100) * total;
    const investable = Math.min(Math.max(0, availableCash - targetCash), totalDeficit);

    for (const item of desired) {
      const buy = totalDeficit > 0 ? investable * (item.deficit / totalDeficit) : 0;
      buys[item.bucket] = buy;
      simulated[item.bucket] += buy;
      simulated.cash -= buy;
    }
  }

  return BUCKETS.map((bucket) => {
    const currentPercent = total ? (values[bucket] / total) * 100 : 0;
    const simulatedPercent = total ? (simulated[bucket] / total) * 100 : 0;
    return {
      bucket,
      currentValue: roundMoney(values[bucket]),
      currentPercent,
      targetPercent: targets[bucket],
      simulatedValue: roundMoney(simulated[bucket]),
      simulatedPercent,
      buyAmount: roundMoney(buys[bucket]),
      driftBefore: Math.abs(currentPercent - targets[bucket]),
      driftAfter: Math.abs(simulatedPercent - targets[bucket]),
    };
  });
}

export function hypotheticalAnnualEarnings(cash: number, rate: number): number {
  return roundMoney(cash * (rate / 100));
}
