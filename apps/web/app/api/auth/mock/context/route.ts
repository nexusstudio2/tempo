import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  contextsForMockUser,
  MOCK_SESSION_COOKIE,
  mockSessionCookieOptions,
  openMockSession,
  sealMockSession,
} from "@/lib/server/mock-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Origen no permitido." }, { status: 403 });
  }
  const session = openMockSession((await cookies()).get(MOCK_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ message: "Inicia sesión para abrir un espacio." }, { status: 401 });
  try {
    const body = await request.json() as { contextId?: unknown };
    if (typeof body.contextId !== "string") return NextResponse.json({ message: "El espacio no es válido." }, { status: 400 });
    const context = contextsForMockUser(session.email).find((candidate) => candidate.id === body.contextId);
    if (!context) return NextResponse.json({ message: "No tienes acceso a ese espacio." }, { status: 403 });

    const response = NextResponse.json(context);
    response.cookies.set(MOCK_SESSION_COOKIE, sealMockSession({ ...session, activeContextId: context.id }), mockSessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ message: "No pudimos cambiar de espacio." }, { status: 400 });
  }
}
