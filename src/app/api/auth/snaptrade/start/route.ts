import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { sealOAuthAttempt } from "@/server/crypto";
import { env } from "@/server/env";
import { createOAuthAttempt, getOAuthMetadata } from "@/server/oauth";
import { OAUTH_COOKIE, oauthCookieOptions } from "@/server/session";

export async function GET(request: NextRequest) {
  try {
    const metadata = await getOAuthMetadata();
    const { challenge, ...attempt } = createOAuthAttempt();
    (await cookies()).set(OAUTH_COOKIE, sealOAuthAttempt(attempt), oauthCookieOptions);
    const url = new URL(metadata.authorization_endpoint);
    url.search = new URLSearchParams({
      response_type: "code",
      client_id: env().SNAPTRADE_CLIENT_ID,
      redirect_uri: `${env().APP_URL}/api/auth/snaptrade/callback`,
      scope: "openid read",
      state: attempt.state,
      nonce: attempt.nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    }).toString();
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL("/?auth=error&message=SnapTrade%20is%20not%20configured%20yet.", request.nextUrl.origin));
  }
}
