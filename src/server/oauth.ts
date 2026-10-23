import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "./env";

export type OAuthMetadata = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  revocation_endpoint: string;
  jwks_uri: string;
};

export type OAuthTokens = {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
};

export type OAuthAttempt = {
  state: string;
  nonce: string;
  verifier: string;
  issuedAt: number;
};

export class OAuthTokenError extends Error {
  constructor(public readonly code: string, message: string) { super(message); }
}

const metadataUrl = "https://api.snaptrade.com/.well-known/oauth-authorization-server";

export async function getOAuthMetadata(): Promise<OAuthMetadata> {
  const response = await fetch(metadataUrl, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("Could not load SnapTrade OAuth configuration.");
  return response.json() as Promise<OAuthMetadata>;
}

export function createOAuthAttempt(): OAuthAttempt & { challenge: string } {
  const verifier = randomBytes(48).toString("base64url");
  return {
    state: randomBytes(24).toString("base64url"),
    nonce: randomBytes(24).toString("base64url"),
    verifier,
    challenge: createHash("sha256").update(verifier).digest("base64url"),
    issuedAt: Date.now(),
  };
}

function basicAuth() {
  return Buffer.from(`${env().SNAPTRADE_CLIENT_ID}:${env().SNAPTRADE_CLIENT_SECRET}`).toString("base64");
}

async function tokenRequest(values: Record<string, string>): Promise<OAuthTokens> {
  const metadata = await getOAuthMetadata();
  const response = await fetch(metadata.token_endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(values),
    cache: "no-store",
  });
  const body = await response.json() as OAuthTokens & { error?: string; error_description?: string };
  if (!response.ok) throw new OAuthTokenError(body.error || "token_request_failed", body.error_description || body.error || "SnapTrade token request failed.");
  if (!body.access_token || !body.refresh_token) throw new Error("SnapTrade returned incomplete tokens.");
  return body;
}

export async function exchangeCode(code: string, verifier: string): Promise<OAuthTokens> {
  return tokenRequest({
    grant_type: "authorization_code",
    code,
    code_verifier: verifier,
    redirect_uri: `${env().APP_URL}/api/auth/snaptrade/callback`,
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
}

export async function verifyIdToken(idToken: string, nonce: string): Promise<string> {
  const metadata = await getOAuthMetadata();
  const { payload } = await jwtVerify(idToken, createRemoteJWKSet(new URL(metadata.jwks_uri)), {
    issuer: metadata.issuer,
    audience: env().SNAPTRADE_CLIENT_ID,
  });
  if (payload.nonce !== nonce) throw new Error("The SnapTrade sign-in nonce did not match.");
  if (!payload.sub) throw new Error("SnapTrade did not identify the signed-in user.");
  return payload.sub;
}

export async function revokeRefreshToken(refreshToken: string) {
  const metadata = await getOAuthMetadata();
  const response = await fetch(metadata.revocation_endpoint, {
    method: "POST",
    headers: { Authorization: `Basic ${basicAuth()}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token: refreshToken, token_type_hint: "refresh_token" }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("SnapTrade access could not be revoked.");
}
