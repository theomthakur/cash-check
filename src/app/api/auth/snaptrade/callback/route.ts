import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { encryptToken, openOAuthAttempt } from "@/server/crypto";
import { saveInitialTokens } from "@/server/db";
import { env } from "@/server/env";
import { exchangeCode, type OAuthAttempt, verifyIdToken } from "@/server/oauth";
import { OAUTH_COOKIE, SESSION_COOKIE, oauthCookieOptions, sessionCookieOptions } from "@/server/session";
import { signSession } from "@/server/crypto";

export async function GET(request: NextRequest) {
  const store = await cookies();
  const redirect = (message: string) => NextResponse.redirect(new URL(`/?auth=error&message=${encodeURIComponent(message)}`, env().APP_URL));
  try {
    const sealed = store.get(OAUTH_COOKIE)?.value;
    store.set(OAUTH_COOKIE, "", { ...oauthCookieOptions, maxAge: 0 });
    if (!sealed) return redirect("The sign-in attempt expired. Please try again.");
    const attempt = openOAuthAttempt<OAuthAttempt>(sealed);
    if (Date.now() - attempt.issuedAt > 10 * 60 * 1000) return redirect("The sign-in attempt expired. Please try again.");
    if (request.nextUrl.searchParams.get("error")) return redirect("SnapTrade access was not approved.");
    if (request.nextUrl.searchParams.get("state") !== attempt.state) return redirect("The sign-in state did not match.");
    const code = request.nextUrl.searchParams.get("code");
    if (!code) return redirect("SnapTrade did not return an authorization code.");
    const tokens = await exchangeCode(code, attempt.verifier);
    if (!tokens.id_token) return redirect("SnapTrade did not return an identity token.");
    const snaptradeSub = await verifyIdToken(tokens.id_token, attempt.nonce);
    const appUserId = await saveInitialTokens({
      app_user_id: randomUUID(),
      snaptrade_sub: snaptradeSub,
      refresh_token_enc: encryptToken(tokens.refresh_token),
      access_token_enc: encryptToken(tokens.access_token),
      access_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
      scope: tokens.scope || "openid read",
    });
    const response = NextResponse.redirect(new URL("/?auth=connected", env().APP_URL));
    response.cookies.set(SESSION_COOKIE, signSession(appUserId), sessionCookieOptions);
    return response;
  } catch (error) {
    return redirect(error instanceof Error ? error.message : "SnapTrade sign-in failed.");
  }
}
