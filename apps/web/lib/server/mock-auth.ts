import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { mockContexts } from "@/features/contexts/mock";
import type { TempoContext } from "@/features/contexts/types";

export const MOCK_SESSION_COOKIE = "tempo_mock_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type MockUser = { email: string; password: string; contextIds: string[] };
export type MockSession = { email: string; activeContextId: string | null; expiresAt: number };

const allContextIds = mockContexts.map((context) => context.id);
const mockUsers: MockUser[] = [
  { email: "carlos@correo.com", password: "cualquiera", contextIds: allContextIds },
  { email: "superadmin@tempo.test", password: "TempoDemo2026!", contextIds: [mockContexts[0].id] },
  { email: "propietario@tempo.test", password: "TempoDemo2026!", contextIds: [mockContexts[1].id] },
  { email: "recepcion@tempo.test", password: "TempoDemo2026!", contextIds: [mockContexts[2].id] },
  { email: "instructor@tempo.test", password: "TempoDemo2026!", contextIds: [mockContexts[3].id] },
  { email: "cliente@tempo.test", password: "TempoDemo2026!", contextIds: [mockContexts[4].id] },
];

function signingSecret(): string | null {
  if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_USE_MOCKS !== "true") return null;
  const secret = process.env.MOCK_SESSION_SECRET;
  return secret && Buffer.byteLength(secret, "utf8") >= 32 ? secret : null;
}

export function findMockUser(email: string, password: string): MockUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  return mockUsers.find((user) => user.email === normalizedEmail && user.password === password) ?? null;
}

export function contextsForMockUser(email: string): TempoContext[] {
  const user = mockUsers.find((candidate) => candidate.email === email);
  return user ? mockContexts.filter((context) => user.contextIds.includes(context.id)) : [];
}

export function mockSessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}

export function sealMockSession(session: MockSession): string {
  const secret = signingSecret();
  if (!secret) throw new Error("Mock authentication is disabled outside development mode.");
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function openMockSession(value: string | undefined): MockSession | null {
  const secret = signingSecret();
  if (!secret || !value || value.length > 2048) return null;
  try {
    const [payload, signature] = value.split(".");
    if (!payload || !signature) return null;
    const expected = createHmac("sha256", secret).update(payload).digest();
    const received = Buffer.from(signature, "base64url");
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as MockSession;
    if (typeof session.email !== "string" || typeof session.expiresAt !== "number" || session.expiresAt <= Date.now()) return null;
    if (session.activeContextId !== null && typeof session.activeContextId !== "string") return null;
    return session;
  } catch {
    return null;
  }
}

export function activeContextForMockSession(session: MockSession): TempoContext | null {
  if (!session.activeContextId) return null;
  return contextsForMockUser(session.email).find((context) => context.id === session.activeContextId) ?? null;
}
