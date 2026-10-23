import type { PortfolioSnapshot } from "./types";

export const demoPortfolio: PortfolioSnapshot = {
  source: "demo",
  asOf: "2026-10-23T16:35:00.000Z",
  accounts: [
    { id: "demo-taxable", name: "Individual brokerage", institution: "Apex Harbor", lastSyncedAt: "2026-10-23T16:32:00.000Z", syncing: false, cash: [{ amount: 12480.6, currency: "USD" }] },
    { id: "demo-ira", name: "Roth IRA", institution: "Northstar Investing", lastSyncedAt: "2026-10-23T16:29:00.000Z", syncing: false, cash: [{ amount: 3265.2, currency: "USD" }] },
    { id: "demo-international", name: "Canadian account", institution: "Maple Direct", lastSyncedAt: "2026-10-23T16:30:00.000Z", syncing: false, cash: [{ amount: 840.5, currency: "CAD" }] },
  ],
  holdings: [
    { id: "h-vti", accountId: "demo-taxable", symbol: "VTI", name: "Vanguard Total Stock Market ETF", value: 48640, currency: "USD", bucket: "stocks" },
    { id: "h-vxus", accountId: "demo-taxable", symbol: "VXUS", name: "Vanguard Total International Stock ETF", value: 15220, currency: "USD", bucket: "stocks" },
    { id: "h-bnd", accountId: "demo-ira", symbol: "BND", name: "Vanguard Total Bond Market ETF", value: 18340, currency: "USD", bucket: "bonds" },
    { id: "h-qqq", accountId: "demo-ira", symbol: "QQQ", name: "Invesco QQQ Trust", value: 21850, currency: "USD", bucket: "stocks" },
    { id: "h-shop", accountId: "demo-international", symbol: "SHOP.TO", name: "Shopify Inc.", value: 6100, currency: "CAD", bucket: "stocks" },
  ],
  activities: [
    { id: "a-dividend-vti", accountId: "demo-taxable", date: "2026-10-18T14:00:00.000Z", type: "dividend", amount: 186.42, currency: "USD", description: "VTI cash dividend" },
    { id: "a-interest", accountId: "demo-taxable", date: "2026-10-12T14:00:00.000Z", type: "interest", amount: 24.18, currency: "USD", description: "Cash interest" },
    { id: "a-contribution", accountId: "demo-ira", date: "2026-10-04T14:00:00.000Z", type: "contribution", amount: 1250, currency: "USD", description: "IRA contribution" },
    { id: "a-withdrawal", accountId: "demo-taxable", date: "2026-10-08T14:00:00.000Z", type: "withdrawal", amount: 250, currency: "USD", description: "Transfer to checking" },
    { id: "a-fee", accountId: "demo-taxable", date: "2026-10-14T14:00:00.000Z", type: "fee", amount: 4.95, currency: "USD", description: "Account fee" },
    { id: "a-purchase-vxus", accountId: "demo-taxable", date: "2026-10-15T14:00:00.000Z", type: "purchase", amount: 900, currency: "USD", description: "Bought VXUS" },
    { id: "a-cad-dividend", accountId: "demo-international", date: "2026-10-09T14:00:00.000Z", type: "dividend", amount: 38.2, currency: "CAD", description: "SHOP.TO dividend" },
  ],
};
