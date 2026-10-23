import "server-only";
import { cookies } from "next/headers";
import { signSession, verifySession } from "./crypto";

export const SESSION_COOKIE = "cash_check_session";
export const OAUTH_COOKIE = "cash_check_oauth";

const secure = process.env.NODE_ENV === "production";
export const sessionCookieOptions = { httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 };
export const oauthCookieOptions = { httpOnly: true, secure, sameSite: "lax" as const, path: "/api/auth/snaptrade", maxAge: 60 * 10 };

export async function getSessionUserId(): Promise<string | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function setSession(appUserId: string) {
  (await cookies()).set(SESSION_COOKIE, signSession(appUserId), sessionCookieOptions);
}

export async function clearSession() {
  (await cookies()).set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
}
