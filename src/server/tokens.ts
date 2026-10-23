import "server-only";
import { decryptToken, encryptToken } from "./crypto";
import { acquireRefreshLease, deleteTokens, getTokens, releaseRefreshLease, saveRefreshedTokens } from "./db";
import { OAuthTokenError, refreshAccessToken } from "./oauth";

export class ReconnectRequiredError extends Error {
  constructor() { super("Please reconnect your SnapTrade account."); }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function validAccessToken(appUserId: string, forceRefresh = false): Promise<string> {
  let row = await getTokens(appUserId);
  if (!row) throw new ReconnectRequiredError();
  if (!forceRefresh && row.access_expires_at.getTime() - Date.now() > 5 * 60 * 1000) return decryptToken(row.access_token_enc);

  const leased = await acquireRefreshLease(appUserId);
  if (!leased) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await sleep(250);
      row = await getTokens(appUserId);
      if (!row) throw new ReconnectRequiredError();
      if (!row.refresh_lease_until && row.access_expires_at.getTime() - Date.now() > 60_000) return decryptToken(row.access_token_enc);
    }
    throw new Error("Your portfolio is already refreshing. Please try again in a moment.");
  }

  try {
    const refreshed = await refreshAccessToken(decryptToken(leased.refresh_token_enc));
    await saveRefreshedTokens(
      appUserId,
      encryptToken(refreshed.access_token),
      encryptToken(refreshed.refresh_token),
      new Date(Date.now() + refreshed.expires_in * 1000),
      refreshed.scope || leased.scope,
    );
    return refreshed.access_token;
  } catch (error) {
    await releaseRefreshLease(appUserId);
    if (error instanceof OAuthTokenError && error.code === "invalid_grant") {
      await deleteTokens(appUserId);
      throw new ReconnectRequiredError();
    }
    throw error;
  }
}
