import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  cognitoClientAuth,
  cognitoConfig,
  openSession,
  sessionCookieName,
} from "@/lib/server/auth-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ code: "forbidden", message: "Origen no permitido." }, { status: 403 });
  }

  const cookieStore = await cookies();
  const session = openSession(cookieStore.get(sessionCookieName())?.value);
  let logoutUrl: URL | null = null;
  try {
    const { domain, clientId, logoutUri } = cognitoConfig();
    logoutUrl = new URL("/logout", domain);
    logoutUrl.search = new URLSearchParams({ client_id: clientId, logout_uri: logoutUri }).toString();
  } catch {
    // También se permite limpiar la cookie local si se rota o retira la configuración.
  }

  if (session) {
    try {
      const { domain, clientId } = cognitoConfig();
      const form = new URLSearchParams({ token: session.refreshToken, client_id: clientId });
      await fetch(new URL("/oauth2/revoke", domain), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", ...cognitoClientAuth() },
        body: form,
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      // Se limpia la sesión local aunque Cognito no esté disponible.
    }
  }

  const response = logoutUrl
    ? NextResponse.redirect(logoutUrl, { status: 303 })
    : NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  response.cookies.set(sessionCookieName(), "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
