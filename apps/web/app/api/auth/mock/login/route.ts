import { NextRequest, NextResponse } from "next/server";
import { contextsForMockUser, findMockUser, MOCK_SESSION_COOKIE, mockSessionCookieOptions, sealMockSession } from "@/lib/server/mock-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) {
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
