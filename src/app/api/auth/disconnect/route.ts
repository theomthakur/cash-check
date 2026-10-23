import { NextResponse } from "next/server";
import { decryptToken } from "@/server/crypto";
import { deleteTokens, getTokens } from "@/server/db";
import { revokeRefreshToken } from "@/server/oauth";
import { clearSession, getSessionUserId } from "@/server/session";

export async function POST() {
  const appUserId = await getSessionUserId();
  if (!appUserId) return NextResponse.json({ ok: true });
  let revoked = true;
  try {
    const row = await getTokens(appUserId);
    if (row) await revokeRefreshToken(decryptToken(row.refresh_token_enc));
  } catch (error) {
    revoked = false;
    console.error("Revoking access failed:", error instanceof Error ? error.name : "unknown");
  }
  await deleteTokens(appUserId);
  await clearSession();
  return NextResponse.json({
    ok: true,
    detail: revoked
      ? "Cash Check access was revoked. Your brokerage connections stay in SnapTrade."
      : "Your Cash Check data was deleted, but SnapTrade could not be reached to revoke access. You can revoke it from your SnapTrade account.",
  });
}
