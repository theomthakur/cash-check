import "server-only";
import type { AccountSummary, Bucket, CashActivity, Holding, PortfolioSnapshot } from "@/lib/types";
import { validAccessToken } from "./tokens";

const apiBase = "https://api.snaptrade.com";
type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
}

function array(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const candidate = object(value);
  if (Array.isArray(candidate.results)) return candidate.results;
  if (Array.isArray(candidate.data)) return candidate.data;
  return [];
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value ? value : fallback;
}

function number(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function currencyCode(value: unknown): string {
  if (typeof value === "string") return value.toUpperCase();
  return text(object(value).code, "USD").toUpperCase();
}

function bucketFor(kind: string, description: string): Bucket {
  const value = `${kind} ${description}`.toLowerCase();
  if (["bond", "fixed", "treasury"].some((word) => value.includes(word))) return "bonds";
  if (["stock", "etf", "equity", "mutualfund", "mutual fund", "adr", "cef"].some((word) => value.includes(word))) return "stocks";
  return "other";
}

async function api(path: string, accessToken: string) {
  return fetch(`${apiBase}${path}`, { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" }, cache: "no-store" });
}

async function fetchJson(path: string, appUserId: string, accessToken: string): Promise<{ body: unknown; accessToken: string }> {
  let response = await api(path, accessToken);
  if (response.status === 401) {
    accessToken = await validAccessToken(appUserId, true);
    response = await api(path, accessToken);
  }
  if (!response.ok) throw new Error(`SnapTrade request failed (${response.status}).`);
  return { body: await response.json(), accessToken };
}

function accountName(raw: JsonObject) {
  return text(raw.display_name) || text(raw.name) || text(raw.raw_type) || "Brokerage account";
}

function institutionName(raw: JsonObject) {
  const institution = object(raw.institution);
  const connection = object(raw.brokerage_authorization);
  return text(institution.name) || text(raw.institution_name) || text(connection.name) || "Connected brokerage";
}

function syncInfo(raw: JsonObject) {
  const status = object(raw.sync_status);
  const holdings = object(status.holdings);
  const timestamp = text(holdings.last_successful_sync) || text(status.last_successful_sync) || text(raw.updated_at) || new Date().toISOString();
  const syncing = raw.is_syncing === true || holdings.is_syncing === true || holdings.initial_sync_completed === false;
  return { timestamp, syncing };
}

function activityKind(value: string): CashActivity["type"] | null {
  const type = value.toUpperCase();
  if (type === "DIVIDEND" || type === "SUBSTITUTE_DIVIDEND") return "dividend";
  if (type === "INTEREST") return "interest";
  if (type === "CONTRIBUTION") return "contribution";
  return null;
}

export async function getPortfolioSnapshot(appUserId: string): Promise<PortfolioSnapshot> {
  let accessToken = await validAccessToken(appUserId);
  const accountResult = await fetchJson("/accounts", appUserId, accessToken);
  accessToken = accountResult.accessToken;
  const rawAccounts = array(accountResult.body).map(object);
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 30);
  const end = new Date();
  const date = (value: Date) => value.toISOString().slice(0, 10);

  const expanded = await Promise.all(rawAccounts.map(async (raw) => {
    const id = text(raw.id);
    const [balancesResult, positionsResult, activitiesResult] = await Promise.all([
      fetchJson(`/accounts/${encodeURIComponent(id)}/balances`, appUserId, accessToken),
      fetchJson(`/accounts/${encodeURIComponent(id)}/positions/all`, appUserId, accessToken),
      fetchJson(`/accounts/${encodeURIComponent(id)}/activities?startDate=${date(start)}&endDate=${date(end)}`, appUserId, accessToken),
    ]);
    const sync = syncInfo(raw);
    const account: AccountSummary = {
      id,
      name: accountName(raw),
      institution: institutionName(raw),
      lastSyncedAt: sync.timestamp,
      syncing: sync.syncing,
      cash: array(balancesResult.body).map((entry) => {
        const balance = object(entry);
        return { amount: number(balance.cash), currency: currencyCode(balance.currency) };
      }),
    };
    const positionsBody = object(positionsResult.body);
    const holdings: Holding[] = array(positionsResult.body).flatMap((entry, index) => {
      const position = object(entry);
      if (position.cash_equivalent === true) return [];
      const instrument = object(position.instrument);
      const symbol = text(instrument.symbol) || text(instrument.raw_symbol) || "—";
      const description = text(instrument.description) || symbol;
      const value = number(position.units) * number(position.price);
      if (!value) return [];
      const kind = text(instrument.kind, "other");
      return [{
        id: text(instrument.id, `${id}-${index}`),
        accountId: id,
        symbol,
        name: description,
        value,
        currency: currencyCode(position.currency || instrument.currency),
        bucket: bucketFor(kind, description),
      }];
    });
    const activities: CashActivity[] = array(activitiesResult.body).flatMap((entry, index) => {
      const activity = object(entry);
      const kind = activityKind(text(activity.type));
      const amount = number(activity.amount);
      if (!kind || amount <= 0) return [];
      return [{
        id: text(activity.id, `${id}-activity-${index}`),
        accountId: id,
        date: text(activity.trade_date) || text(activity.settlement_date) || text(activity.date),
        type: kind,
        amount,
        currency: currencyCode(activity.currency),
        description: text(activity.description) || text(activity.type),
      }];
    });
    const freshness = text(object(positionsBody.data_freshness).as_of);
    if (freshness) account.lastSyncedAt = freshness;
    return { account, holdings, activities };
  }));

  return {
    source: "snaptrade",
    asOf: new Date().toISOString(),
    accounts: expanded.map((item) => item.account),
    holdings: expanded.flatMap((item) => item.holdings),
    activities: expanded.flatMap((item) => item.activities),
  };
}
