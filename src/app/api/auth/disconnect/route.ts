import { NextResponse } from "next/server";
import { decryptToken } from "@/server/crypto";
import { deleteTokens, getTokens } from "@/server/db";
import { revokeRefreshToken } from "@/server/oauth";
import { clearSession, getSessionUserId } from "@/server/session";

export async function POST() {
  const appUserId = await getSessionUserId();
  if (!appUserId) return NextResponse.json({ ok: true });
  const row = await getTokens(appUserId);
  try {
    if (row) await revokeRefreshToken(decryptToken(row.refresh_token_enc));
  } finally {
    await deleteTokens(appUserId);
    await clearSession();
  }
  return NextResponse.json({ ok: true, detail: "Cash Check access was revoked. Your brokerage connections remain in SnapTrade." });
}
