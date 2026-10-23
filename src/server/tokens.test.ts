import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTestEnv } from "@/test/env";

const db = vi.hoisted(() => ({
  getTokens: vi.fn(),
  acquireRefreshLease: vi.fn(),
  saveRefreshedTokens: vi.fn(),
  releaseRefreshLease: vi.fn(),
  deleteTokens: vi.fn(),
}));
const oauthMock = vi.hoisted(() => ({ refreshAccessToken: vi.fn() }));

vi.mock("./db", () => db);
vi.mock("./oauth", async () => {
  class OAuthTokenError extends Error {
    constructor(public readonly code: string, message: string) { super(message); }
  }
  return { ...oauthMock, OAuthTokenError };
});

type Tokens = typeof import("./tokens");
type Crypto = typeof import("./crypto");
let tokens: Tokens;
let crypto: Crypto;

function row(expiresInMs: number, leaseUntil: Date | null = null) {
  return {
    app_user_id: "u1",
    refresh_token_enc: crypto.encryptToken("old-refresh"),
    access_token_enc: crypto.encryptToken("old-access"),
    access_expires_at: new Date(Date.now() + expiresInMs),
    scope: "openid read",
    refresh_lease_until: leaseUntil,
  };
}

beforeEach(async () => {
  useTestEnv();
  Object.values(db).forEach((fn) => fn.mockReset());
  oauthMock.refreshAccessToken.mockReset();
  tokens = await import("./tokens");
  crypto = await import("./crypto");
});

describe("validAccessToken", () => {
  it("returns the saved token and does not refresh when it is fresh", async () => {
    db.getTokens.mockResolvedValue(row(60 * 60 * 1000));
    await expect(tokens.validAccessToken("u1")).resolves.toBe("old-access");
    expect(db.acquireRefreshLease).not.toHaveBeenCalled();
  });

  it("takes the lease before refreshing, then saves the rotated tokens", async () => {
    const stale = row(60 * 1000);
    db.getTokens.mockResolvedValue(stale);
    db.acquireRefreshLease.mockResolvedValue(stale);
    oauthMock.refreshAccessToken.mockResolvedValue({ access_token: "new-access", refresh_token: "new-refresh", expires_in: 36000, token_type: "Bearer" });

    await expect(tokens.validAccessToken("u1")).resolves.toBe("new-access");

    expect(oauthMock.refreshAccessToken).toHaveBeenCalledWith("old-refresh");
    const saved = db.saveRefreshedTokens.mock.calls[0];
    expect(crypto.decryptToken(saved[1])).toBe("new-access");
    expect(crypto.decryptToken(saved[2])).toBe("new-refresh");
    expect(db.acquireRefreshLease.mock.invocationCallOrder[0]).toBeLessThan(oauthMock.refreshAccessToken.mock.invocationCallOrder[0]);
  });

  it("does not call SnapTrade when another request holds the lease; it waits for the new token", async () => {
    const stale = row(60 * 1000, new Date(Date.now() + 30_000));
    const fresh = { ...row(60 * 60 * 1000), access_token_enc: crypto.encryptToken("their-access") };
    db.acquireRefreshLease.mockResolvedValue(null);
    db.getTokens.mockResolvedValueOnce(stale).mockResolvedValue(fresh);

    await expect(tokens.validAccessToken("u1")).resolves.toBe("their-access");
    expect(oauthMock.refreshAccessToken).not.toHaveBeenCalled();
  });

  it("deletes the saved tokens and asks to reconnect when SnapTrade says invalid_grant", async () => {
    const stale = row(60 * 1000);
    db.getTokens.mockResolvedValue(stale);
    db.acquireRefreshLease.mockResolvedValue(stale);
    const { OAuthTokenError } = await import("./oauth");
    oauthMock.refreshAccessToken.mockRejectedValue(new OAuthTokenError("invalid_grant", "expired"));

    await expect(tokens.validAccessToken("u1")).rejects.toBeInstanceOf(tokens.ReconnectRequiredError);
    expect(db.deleteTokens).toHaveBeenCalledWith("u1");
  });

  it("releases the lease and keeps the tokens on any other error", async () => {
    const stale = row(60 * 1000);
    db.getTokens.mockResolvedValue(stale);
    db.acquireRefreshLease.mockResolvedValue(stale);
    oauthMock.refreshAccessToken.mockRejectedValue(new Error("network down"));

    await expect(tokens.validAccessToken("u1")).rejects.toThrow("network down");
    expect(db.releaseRefreshLease).toHaveBeenCalledWith("u1");
    expect(db.deleteTokens).not.toHaveBeenCalled();
  });
});
