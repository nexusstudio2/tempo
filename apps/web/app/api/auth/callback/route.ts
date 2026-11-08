import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  cognitoClientAuth,
  cognitoConfig,
  sealSession,
  sessionCookieName,
  sessionCookieOptions,
  openShortLivedValue,
  type TempoSession,
} from "@/lib/server/auth-session";

export const runtime = "nodejs";

type TokenResponse = { access_token?: string; refresh_token?: string; expires_in?: number };

function loginFailure(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  response.cookies.delete("tempo_oauth_state");
  response.cookies.delete("tempo_oauth_verifier");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const expectedState = openShortLivedValue(request.cookies.get("tempo_oauth_state")?.value);
  const verifier = openShortLivedValue(request.cookies.get("tempo_oauth_verifier")?.value);
  const stateMatches = returnedState && expectedState && Buffer.byteLength(returnedState) === Buffer.byteLength(expectedState)
    ? timingSafeEqual(Buffer.from(returnedState), Buffer.from(expectedState))
    : false;
  if (!code || !verifier || !stateMatches) {
    return loginFailure(request);
  }

  try {
    const { domain, clientId, redirectUri } = cognitoConfig();
    const form = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    });
    const tokenResponse = await fetch(new URL("/oauth2/token", domain), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", ...cognitoClientAuth() },
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!tokenResponse.ok) return loginFailure(request);
    const tokens = await tokenResponse.json() as TokenResponse;
    if (!tokens.access_token || !tokens.refresh_token) return loginFailure(request);

    const session: TempoSession = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in ?? 300) * 1000,
    };
    const sealed = sealSession(session);
    if (sealed.length > 3800) return loginFailure(request);

    const response = NextResponse.redirect(new URL("/select-context", request.url));
    response.cookies.set(sessionCookieName(), sealed, sessionCookieOptions());
    response.cookies.delete("tempo_oauth_state");
    response.cookies.delete("tempo_oauth_verifier");
    return response;
  } catch {
    return loginFailure(request);
  }
}
