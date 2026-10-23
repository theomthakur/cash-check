import { createHash } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { useTestEnv } from "@/test/env";

let oauth: typeof import("./oauth");

beforeAll(async () => {
  useTestEnv();
  oauth = await import("./oauth");
});

describe("sign-in attempt", () => {
  it("builds an S256 challenge from the verifier", () => {
    const attempt = oauth.createOAuthAttempt();
    expect(attempt.challenge).toBe(createHash("sha256").update(attempt.verifier).digest("base64url"));
    expect(attempt.verifier.length).toBeGreaterThanOrEqual(43);
  });

  it("uses a new state, nonce and verifier every time", () => {
    const a = oauth.createOAuthAttempt();
    const b = oauth.createOAuthAttempt();
    expect(a.state).not.toBe(b.state);
    expect(a.nonce).not.toBe(b.nonce);
    expect(a.verifier).not.toBe(b.verifier);
  });
});
