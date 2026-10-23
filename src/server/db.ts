import "server-only";
import postgres from "postgres";
import { env } from "./env";

export type TokenRow = {
  app_user_id: string;
  snaptrade_sub: string;
  refresh_token_enc: string;
  access_token_enc: string;
  access_expires_at: Date;
  scope: string;
  refresh_lease_until: Date | null;
  updated_at: Date;
};

let client: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;
let usageSchemaReady: Promise<void> | null = null;

function isLocalDatabase(url: string): boolean {
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

function sql() {
  if (!client) client = postgres(env().DATABASE_URL, { ssl: isLocalDatabase(env().DATABASE_URL) ? false : "require", max: 5 });
  return client;
}

/** The usage tables live apart from the sign-in table, so a problem here can never affect sign-in. */
async function ensureUsageSchema() {
  if (!usageSchemaReady) usageSchemaReady = (async () => {
    await sql()`CREATE TABLE IF NOT EXISTS usage_counts (event TEXT PRIMARY KEY, count BIGINT NOT NULL DEFAULT 0)`;
    await sql()`
      CREATE TABLE IF NOT EXISTS feedback (
        id BIGSERIAL PRIMARY KEY,
        token UUID NOT NULL DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        source TEXT NOT NULL,
        useful BOOLEAN NOT NULL,
        note TEXT
      )
    `;
  })().catch((error) => { usageSchemaReady = null; throw error; });
  return usageSchemaReady;
}

async function ensureSchema() {
  if (!schemaReady) schemaReady = (async () => {
    await sql()`
      CREATE TABLE IF NOT EXISTS oauth_tokens (
        app_user_id UUID PRIMARY KEY,
        snaptrade_sub TEXT NOT NULL UNIQUE,
        refresh_token_enc TEXT NOT NULL,
        access_token_enc TEXT NOT NULL,
        access_expires_at TIMESTAMPTZ NOT NULL,
        scope TEXT NOT NULL,
        refresh_lease_until TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  })();
  return schemaReady;
}

export async function getTokens(appUserId: string): Promise<TokenRow | null> {
  await ensureSchema();
  const rows = await sql()<TokenRow[]>`SELECT * FROM oauth_tokens WHERE app_user_id = ${appUserId}::uuid LIMIT 1`;
  return rows[0] ?? null;
}

export async function saveInitialTokens(input: Omit<TokenRow, "refresh_lease_until" | "updated_at">): Promise<string> {
  await ensureSchema();
  const rows = await sql()<Pick<TokenRow, "app_user_id">[]>`
    INSERT INTO oauth_tokens (app_user_id, snaptrade_sub, refresh_token_enc, access_token_enc, access_expires_at, scope)
    VALUES (${input.app_user_id}::uuid, ${input.snaptrade_sub}, ${input.refresh_token_enc}, ${input.access_token_enc}, ${input.access_expires_at}, ${input.scope})
    ON CONFLICT (snaptrade_sub) DO UPDATE SET
      refresh_token_enc = EXCLUDED.refresh_token_enc,
      access_token_enc = EXCLUDED.access_token_enc,
      access_expires_at = EXCLUDED.access_expires_at,
      scope = EXCLUDED.scope,
      refresh_lease_until = NULL,
      updated_at = now()
    RETURNING app_user_id
  `;
  return rows[0].app_user_id;
}

export async function acquireRefreshLease(appUserId: string): Promise<TokenRow | null> {
  await ensureSchema();
  const rows = await sql()<TokenRow[]>`
    UPDATE oauth_tokens
    SET refresh_lease_until = now() + interval '30 seconds', updated_at = now()
    WHERE app_user_id = ${appUserId}::uuid
      AND (refresh_lease_until IS NULL OR refresh_lease_until < now())
    RETURNING *
  `;
  return rows[0] ?? null;
}

export async function saveRefreshedTokens(appUserId: string, accessTokenEnc: string, refreshTokenEnc: string, expiresAt: Date, scope: string) {
  await ensureSchema();
  await sql()`UPDATE oauth_tokens SET access_token_enc=${accessTokenEnc}, refresh_token_enc=${refreshTokenEnc}, access_expires_at=${expiresAt}, scope=${scope}, refresh_lease_until=NULL, updated_at=now() WHERE app_user_id=${appUserId}::uuid`;
}

export async function releaseRefreshLease(appUserId: string) {
  await ensureSchema();
  await sql()`UPDATE oauth_tokens SET refresh_lease_until=NULL, updated_at=now() WHERE app_user_id=${appUserId}::uuid`;
}

export async function deleteTokens(appUserId: string) {
  await ensureSchema();
  await sql()`DELETE FROM oauth_tokens WHERE app_user_id=${appUserId}::uuid`;
}

/** Anonymous counters only: an event name and a number. No people, no money. */
export async function recordEvent(event: string) {
  await ensureUsageSchema();
  await sql()`INSERT INTO usage_counts (event, count) VALUES (${event}, 1) ON CONFLICT (event) DO UPDATE SET count = usage_counts.count + 1`;
}

export async function saveFeedback(input: { source: string; useful: boolean; note: string | null }): Promise<string> {
  await ensureUsageSchema();
  const rows = await sql()<{ token: string }[]>`INSERT INTO feedback (source, useful, note) VALUES (${input.source}, ${input.useful}, ${input.note}) RETURNING token::text AS token`;
  return rows[0].token;
}

/** Adds a note to an answer you just gave. Needs the private token from that answer, and only works once. */
export async function addFeedbackNote(token: string, note: string): Promise<boolean> {
  await ensureUsageSchema();
  const rows = await sql()<{ id: string }[]>`UPDATE feedback SET note = ${note} WHERE token = ${token}::uuid AND note IS NULL RETURNING id::text AS id`;
  return rows.length > 0;
}

export async function feedbackInLastHour(): Promise<number> {
  await ensureUsageSchema();
  const rows = await sql()<{ n: string }[]>`SELECT count(*)::text AS n FROM feedback WHERE created_at > now() - interval '1 hour'`;
  return Number(rows[0]?.n ?? 0);
}

export async function getStats() {
  await ensureUsageSchema();
  const counts = await sql()<{ event: string; count: string }[]>`SELECT event, count::text FROM usage_counts`;
  const votes = await sql()<{ useful: boolean; n: string }[]>`SELECT useful, count(*)::text AS n FROM feedback GROUP BY useful`;
  return {
    events: Object.fromEntries(counts.map((row) => [row.event, Number(row.count)])) as Record<string, number>,
    useful: Number(votes.find((row) => row.useful)?.n ?? 0),
    notUseful: Number(votes.find((row) => !row.useful)?.n ?? 0),
  };
}
