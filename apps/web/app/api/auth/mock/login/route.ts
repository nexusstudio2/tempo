import { NextRequest, NextResponse } from "next/server";
import { contextsForMockUser, findMockUser, MOCK_SESSION_COOKIE, mockSessionCookieOptions, sealMockSession } from "@/lib/server/mock-auth";

export const runtime = "nodejs";

function hasAllowedOrigin(request: NextRequest): boolean {
  const originHeader = request.headers.get("origin");
  if (!originHeader) return true;

  try {
    const origin = new URL(originHeader);
    if (origin.origin === new URL(request.url).origin) return true;

    // A reverse proxy can terminate HTTPS and forward the request to Next over HTTP.
    // In that case, validate against the public origin forwarded by the proxy.
    const forwardedHost = (
      request.headers.get("x-forwarded-host") ?? request.headers.get("host")
    )?.split(",")[0]?.trim();
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    return Boolean(
      forwardedHost &&
      forwardedProto &&
      (forwardedProto === "http" || forwardedProto === "https") &&
      origin.host === forwardedHost &&
      origin.protocol === `${forwardedProto}:`,
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!hasAllowedOrigin(request)) {
    return NextResponse.json({ message: "Origen no permitido." }, { status: 403 });
  }
  try {
    const body = await request.json() as { email?: unknown; password?: unknown };
    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ message: "Correo o contraseña incorrectos." }, { status: 401 });
    }
    const user = findMockUser(body.email, body.password);
    if (!user) return NextResponse.json({ message: "Correo o contraseña incorrectos." }, { status: 401 });

    const contexts = contextsForMockUser(user.email);
    const activeContextId = contexts.length === 1 ? contexts[0].id : null;
    const response = NextResponse.json({ contexts });
    response.cookies.set(MOCK_SESSION_COOKIE, sealMockSession({ email: user.email, activeContextId, expiresAt: Date.now() + 8 * 60 * 60 * 1000 }), mockSessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ message: "No pudimos validar el acceso." }, { status: 400 });
  }
}
