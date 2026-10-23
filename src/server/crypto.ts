import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env";

function tokenKey(): Buffer {
  const key = Buffer.from(env().TOKEN_ENCRYPTION_KEY, "base64url");
  if (key.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must decode to 32 bytes.");
  return key;
}

function derivedKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

function encryptWithKey(value: string, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString("base64url")).join(".");
}

function decryptWithKey(value: string, key: Buffer): string {
  const [ivText, tagText, ciphertextText] = value.split(".");
  if (!ivText || !tagText || !ciphertextText) throw new Error("Invalid encrypted value.");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextText, "base64url")), decipher.final()]).toString("utf8");
}

export const encryptToken = (value: string) => encryptWithKey(value, tokenKey());
export const decryptToken = (value: string) => decryptWithKey(value, tokenKey());

export function sealOAuthAttempt(payload: object): string {
  return encryptWithKey(JSON.stringify(payload), derivedKey(env().OAUTH_COOKIE_SECRET));
}

export function openOAuthAttempt<T>(value: string): T {
  return JSON.parse(decryptWithKey(value, derivedKey(env().OAUTH_COOKIE_SECRET))) as T;
}

export function signSession(appUserId: string): string {
  const signature = createHmac("sha256", env().SESSION_SIGNING_SECRET).update(appUserId).digest("base64url");
  return `${appUserId}.${signature}`;
}

export function verifySession(value: string | undefined): string | null {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const appUserId = value.slice(0, separator);
  const supplied = Buffer.from(value.slice(separator + 1), "base64url");
  const expected = createHmac("sha256", env().SESSION_SIGNING_SECRET).update(appUserId).digest();
  return supplied.length === expected.length && timingSafeEqual(supplied, expected) ? appUserId : null;
}
