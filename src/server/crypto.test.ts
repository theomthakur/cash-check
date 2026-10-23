import { beforeAll, describe, expect, it } from "vitest";
import { useTestEnv } from "@/test/env";

let crypto: typeof import("./crypto");

beforeAll(async () => {
  useTestEnv();
  crypto = await import("./crypto");
});

describe("token encryption", () => {
  it("round-trips a token and never stores it in plain text", () => {
    const sealed = crypto.encryptToken("refresh-token-123");
    expect(sealed).not.toContain("refresh-token-123");
    expect(crypto.decryptToken(sealed)).toBe("refresh-token-123");
  });

  it("uses a fresh random value each time", () => {
    expect(crypto.encryptToken("same")).not.toBe(crypto.encryptToken("same"));
  });

  it("rejects a tampered value", () => {
    const [iv, tag, body] = crypto.encryptToken("secret").split(".");
    const flipped = `${body.slice(0, -2)}${body.endsWith("AA") ? "BB" : "AA"}`;
    expect(() => crypto.decryptToken(`${iv}.${tag}.${flipped}`)).toThrow();
  });
});

describe("session cookie", () => {
  it("accepts a value it signed", () => {
    expect(crypto.verifySession(crypto.signSession("user-1"))).toBe("user-1");
  });

  it("rejects a changed user id, a missing value and garbage", () => {
    const signed = crypto.signSession("user-1");
    expect(crypto.verifySession(signed.replace("user-1", "user-2"))).toBeNull();
    expect(crypto.verifySession(undefined)).toBeNull();
    expect(crypto.verifySession("not-a-session")).toBeNull();
  });
});

describe("sign-in attempt cookie", () => {
  it("round-trips the attempt and rejects tampering", () => {
    const attempt = { state: "s", nonce: "n", verifier: "v", issuedAt: 1 };
    const sealed = crypto.sealOAuthAttempt(attempt);
    expect(crypto.openOAuthAttempt(sealed)).toEqual(attempt);
    expect(() => crypto.openOAuthAttempt(`${sealed}x`)).toThrow();
  });
});
