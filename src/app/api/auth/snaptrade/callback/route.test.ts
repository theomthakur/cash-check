import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { cookieStore, openOAuthAttempt } = vi.hoisted(() => ({
  cookieStore: { get: vi.fn(), set: vi.fn() },
  openOAuthAttempt: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }));
vi.mock("@/server/crypto", () => ({
  encryptToken: vi.fn(),
  openOAuthAttempt,
  signSession: vi.fn(),
}));
vi.mock("@/server/db", () => ({ saveInitialTokens: vi.fn() }));
vi.mock("@/server/env", () => ({ env: () => ({ APP_URL: "https://cash-check.example" }) }));
vi.mock("@/server/oauth", () => ({ exchangeCode: vi.fn(), verifyIdToken: vi.fn() }));
vi.mock("@/server/session", () => ({
  OAUTH_COOKIE: "oauth",
  SESSION_COOKIE: "session",
  oauthCookieOptions: { httpOnly: true },
  sessionCookieOptions: { httpOnly: true },
}));

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.get.mockReturnValue({ value: "sealed-attempt" });
  openOAuthAttempt.mockReturnValue({ state: "expected", nonce: "nonce", verifier: "verifier", issuedAt: Date.now() });
});

describe("SnapTrade callback", () => {
  it("rejects a state mismatch before exchanging the code", async () => {
    const response = await GET(new NextRequest("https://cash-check.example/api/auth/snaptrade/callback?state=wrong&code=code"));
    const location = new URL(response.headers.get("location")!);
    expect(response.status).toBe(307);
    expect(location.searchParams.get("auth")).toBe("error");
    expect(location.searchParams.get("message")).toBe("The sign-in state did not match.");
  });

  it("does not expose unexpected internal errors in the redirect", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    openOAuthAttempt.mockImplementation(() => { throw new Error("database hostname and internal details"); });
    const response = await GET(new NextRequest("https://cash-check.example/api/auth/snaptrade/callback?state=expected&code=code"));
    const location = new URL(response.headers.get("location")!);
    expect(location.searchParams.get("message")).toBe("SnapTrade sign-in failed. Please try again.");
    expect(location.toString()).not.toContain("database");
  });
});
