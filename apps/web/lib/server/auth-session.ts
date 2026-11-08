import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type TempoSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const SESSION_COOKIE = "tempo_session";
const SESSION_COOKIE_PROD = "__Host-tempo_session";

export function sessionCookieName(): string {
  return process.env.NODE_ENV === "production" ? SESSION_COOKIE_PROD : SESSION_COOKIE;
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function encryptionKey(): Buffer {
  const secret = process.env.SESSION_ENCRYPTION_KEY;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("SESSION_ENCRYPTION_KEY must contain at least 32 bytes.");
  }
  return createHash("sha256").update(secret, "utf8").digest();
}

export function sealSession(session: TempoSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(session)), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
}

export function openSession(value: string | undefined): TempoSession | null {
  if (!value || value.length > 3800) return null;
  try {
    const packed = Buffer.from(value, "base64url");
    if (packed.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), packed.subarray(0, 12));
    decipher.setAuthTag(packed.subarray(12, 28));
    const json = Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]).toString("utf8");
    const session: unknown = JSON.parse(json);
    if (
      typeof session !== "object" ||
      session === null ||
      !("accessToken" in session) || typeof session.accessToken !== "string" ||
      !("refreshToken" in session) || typeof session.refreshToken !== "string" ||
      !("expiresAt" in session) || typeof session.expiresAt !== "number"
    ) return null;
    return session as TempoSession;
  } catch {
    return null;
  }
}

export function cognitoConfig() {
  const domain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const redirectUri = process.env.COGNITO_REDIRECT_URI;
  const logoutUri = process.env.COGNITO_LOGOUT_URI;
  if (!domain || !clientId || !redirectUri || !logoutUri) {
    throw new Error("Cognito is not configured. Set COGNITO_DOMAIN, COGNITO_CLIENT_ID, COGNITO_REDIRECT_URI and COGNITO_LOGOUT_URI.");
  }
  const parsedDomain = new URL(domain);
  const parsedRedirect = new URL(redirectUri);
  const parsedLogout = new URL(logoutUri);
  if (parsedDomain.protocol !== "https:" || process.env.NODE_ENV === "production" && (parsedRedirect.protocol !== "https:" || parsedLogout.protocol !== "https:")) {
    throw new Error("Cognito and production callback URLs must use HTTPS.");
  }
  return { domain: parsedDomain.origin, clientId, redirectUri: parsedRedirect.toString(), logoutUri: parsedLogout.toString() };
}

export function cognitoClientAuth(): Record<string, string> {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  if (clientSecret) {
    return { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}` };
  }
  return {};
}

export function sealShortLivedValue(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
}

export function openShortLivedValue(value: string | undefined): string | null {
  if (!value || value.length > 512) return null;
  try {
    const packed = Buffer.from(value, "base64url");
    if (packed.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), packed.subarray(0, 12));
    decipher.setAuthTag(packed.subarray(12, 28));
    return Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
