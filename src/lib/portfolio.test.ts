import { describe, expect, it } from "vitest";
import { allocationDrift, cashByCurrency, simulateBuyOnly } from "./portfolio";
import type { PortfolioSnapshot } from "./types";

const snapshot: PortfolioSnapshot = {
  source: "demo",
  asOf: "2026-10-23T12:00:00.000Z",
  accounts: [
    {
      id: "a1",
      name: "Brokerage",
      institution: "Northstar",
      lastSyncedAt: "2026-10-23T11:55:00.000Z",
      syncing: false,
      cash: [
        { amount: 1250.25, currency: "USD" },
        { amount: 200, currency: "CAD" },
      ],
    },
    {
      id: "a2",
      name: "IRA",
      institution: "Northstar",
      lastSyncedAt: "2026-10-23T11:55:00.000Z",
      syncing: false,
      cash: [{ amount: 749.75, currency: "USD" }],
    },
  ],
  holdings: [],
  activities: [
    {
      id: "d1",
      accountId: "a1",
      date: "2026-10-12T00:00:00.000Z",
      type: "dividend",
      amount: 42.5,
      currency: "USD",
      description: "Dividend",
    },
    {
      id: "c1",
      accountId: "a2",
      date: "2026-10-01T00:00:00.000Z",
      type: "contribution",
      amount: 500,
      currency: "USD",
      description: "Contribution",
    },
    {
      id: "old",
      accountId: "a1",
      date: "2026-08-01T00:00:00.000Z",
      type: "interest",
      amount: 99,
      currency: "USD",
      description: "Old interest",
    },
  ],
};

describe("cashByCurrency", () => {
  const zero = { outflows30d: 0, net30d: 0, sales: 0, purchases: 0, withdrawals: 0, fees: 0 };

  it("totals cash, money in and money out without converting currencies", () => {
    expect(cashByCurrency(snapshot)).toEqual([
      { currency: "CAD", currentCash: 200, cashThen: 200, inflows30d: 0, dividends: 0, interest: 0, contributions: 0, ...zero },
      { currency: "USD", currentCash: 2000, cashThen: 1457.5, inflows30d: 542.5, dividends: 42.5, interest: 0, contributions: 500, ...zero, net30d: 542.5 },
    ]);
  });

  it("subtracts money that went out and estimates the cash 30 days ago", () => {
    const withOutflows: PortfolioSnapshot = {
      ...snapshot,
      activities: [
        ...snapshot.activities,
        { id: "b1", accountId: "a1", date: "2026-10-15T00:00:00.000Z", type: "purchase", amount: 300, currency: "USD", description: "Bought" },
        { id: "w1", accountId: "a1", date: "2026-10-16T00:00:00.000Z", type: "withdrawal", amount: 100, currency: "USD", description: "Withdrawal" },
        { id: "f1", accountId: "a1", date: "2026-10-17T00:00:00.000Z", type: "fee", amount: 4.5, currency: "USD", description: "Fee" },
        { id: "s1", accountId: "a1", date: "2026-10-18T00:00:00.000Z", type: "sale", amount: 50, currency: "USD", description: "Sold" },
      ],
    };
    const usd = cashByCurrency(withOutflows).find((row) => row.currency === "USD")!;
    // In: 42.5 + 500 + 50 = 592.5. Out: 300 + 100 + 4.5 = 404.5. Net: 188.
    expect(usd.inflows30d).toBe(592.5);
    expect(usd.outflows30d).toBe(404.5);
    expect(usd.net30d).toBe(188);
    expect(usd.cashThen).toBe(1812);
    expect(usd.purchases).toBe(300);
    expect(usd.fees).toBe(4.5);
  });

  it("treats the amount as a size, so a purchase counts as money out however it is signed", () => {
    const signed: PortfolioSnapshot = {
      ...snapshot,
      activities: [{ id: "b2", accountId: "a1", date: "2026-10-15T00:00:00.000Z", type: "purchase", amount: -300, currency: "USD", description: "Bought" }],
    };
    const usd = cashByCurrency(signed).find((row) => row.currency === "USD")!;
    expect(usd.outflows30d).toBe(300);
    expect(usd.inflows30d).toBe(0);
  });
});

describe("allocationDrift", () => {
  it("returns the hand-checked absolute percentage-point drift", () => {
    const values = { stocks: 6000, bonds: 2000, cash: 2000, other: 0 };
    const targets = { stocks: 70, bonds: 20, cash: 10, other: 0 };
    // |60-70| + |20-20| + |20-10| + |0-0| = 20.
    expect(allocationDrift(values, targets)).toBe(20);
  });
});

describe("simulateBuyOnly", () => {
  it("uses cash to fill target deficits without changing portfolio value", () => {
    const rows = simulateBuyOnly(
      { stocks: 6000, bonds: 2000, cash: 2000, other: 0 },
      { stocks: 70, bonds: 20, cash: 10, other: 0 },
    );
    expect(rows.find((row) => row.bucket === "stocks")?.buyAmount).toBe(1000);
    expect(rows.find((row) => row.bucket === "cash")?.simulatedValue).toBe(1000);
    expect(rows.reduce((sum, row) => sum + row.simulatedValue, 0)).toBe(10000);
  });

  it("splits limited cash proportionally across deficits", () => {
    const rows = simulateBuyOnly(
      { stocks: 4000, bonds: 1000, cash: 1000, other: 0 },
      { stocks: 60, bonds: 30, cash: 10, other: 0 },
    );
    // On $6,000, deficits are $0 for stocks and $800 for bonds; only $400
    // must leave cash to reach its $600 target.
    expect(rows.find((row) => row.bucket === "bonds")?.buyAmount).toBe(400);
    expect(rows.find((row) => row.bucket === "cash")?.simulatedValue).toBe(600);
  });

  it("does not simulate purchases while targets are incomplete", () => {
    const rows = simulateBuyOnly(
      { stocks: 4000, bonds: 1000, cash: 1000, other: 0 },
      { stocks: 40, bonds: 20, cash: 10, other: 0 },
    );
    expect(rows.every((row) => row.buyAmount === 0)).toBe(true);
    expect(rows.find((row) => row.bucket === "cash")?.simulatedValue).toBe(1000);
  });
});
