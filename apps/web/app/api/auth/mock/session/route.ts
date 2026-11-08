import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { activeContextForMockSession, contextsForMockUser, MOCK_SESSION_COOKIE, openMockSession } from "@/lib/server/mock-auth";

export const runtime = "nodejs";

export async function GET() {
  const session = openMockSession((await cookies()).get(MOCK_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ message: "La sesión demo no es válida." }, { status: 401 });
  return NextResponse.json({ contexts: contextsForMockUser(session.email), activeContext: activeContextForMockSession(session) });
}
