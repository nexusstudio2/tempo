import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  cognitoClientAuth,
  cognitoConfig,
  openSession,
  sealSession,
  sessionCookieName,
  sessionCookieOptions,
  type TempoSession,
} from "@/lib/server/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TokenResponse = { access_token?: string; refresh_token?: string; expires_in?: number };
const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function unauthorized() {
  return NextResponse.json({ code: "unauthorized", message: "Se requiere una sesión válida.", details: [], correlationId: randomUUID() }, { status: 401 });
}

async function refreshSession(session: TempoSession): Promise<TempoSession | null> {
  try {
    const { domain, clientId } = cognitoConfig();
    const form = new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, refresh_token: session.refreshToken });
    const response = await fetch(new URL("/oauth2/token", domain), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", ...cognitoClientAuth() },
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    const tokens = await response.json() as TokenResponse;
    if (!tokens.access_token) return null;
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? session.refreshToken,
      expiresAt: Date.now() + (tokens.expires_in ?? 300) * 1000,
    };
  } catch {
    return null;
  }
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (METHODS_WITH_BODY.has(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ code: "forbidden", message: "Origen no permitido." }, { status: 403 });
    }
  }

  const { path } = await context.params;
  if (!path?.length || path.some((part) => part === ".." || part === ".")) {
    return NextResponse.json({ code: "not_found", message: "Ruta no encontrada." }, { status: 404 });
  }

  const cookieStore = await cookies();
  let session = openSession(cookieStore.get(sessionCookieName())?.value);
  if (!session) return unauthorized();
  const refreshed = session.expiresAt <= Date.now() + 30_000;
  if (refreshed) {
    const nextSession = await refreshSession(session);
    if (!nextSession) return unauthorized();
    session = nextSession;
  }

  const apiOrigin = process.env.API_PROXY_TARGET ?? "http://localhost:8080";
  const target = new URL(`/api/v1/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`, apiOrigin);
  const headers = new Headers();
  for (const name of ["accept", "content-type", "idempotency-key", "x-correlation-id"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("authorization", `Bearer ${session.accessToken}`);
  if (!headers.has("x-correlation-id")) headers.set("x-correlation-id", randomUUID());

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: METHODS_WITH_BODY.has(request.method) ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return NextResponse.json({ code: "api_unavailable", message: "La API no está disponible." }, { status: 502 });
  }

  const responseHeaders = new Headers();
  for (const name of ["content-type", "x-correlation-id", "retry-after", "www-authenticate"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  responseHeaders.set("cache-control", "no-store");
  const response = new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  if (refreshed) {
    const sealed = sealSession(session);
    if (sealed.length <= 3800) response.cookies.set(sessionCookieName(), sealed, sessionCookieOptions());
  }
  return response;
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
