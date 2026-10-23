import { randomBytes } from "node:crypto";

/** Fake, throwaway settings so server code can run in tests. Never real credentials. */
export function useTestEnv() {
  Object.assign(process.env, {
    APP_URL: "https://cash-check.test",
    SNAPTRADE_CLIENT_ID: "test-client-id",
    SNAPTRADE_CLIENT_SECRET: "test-client-secret",
    DATABASE_URL: "postgres://user:pass@localhost:5432/test",
    TOKEN_ENCRYPTION_KEY: randomBytes(32).toString("base64url"),
    SESSION_SIGNING_SECRET: randomBytes(48).toString("base64url"),
    OAUTH_COOKIE_SECRET: randomBytes(48).toString("base64url"),
  });
}
