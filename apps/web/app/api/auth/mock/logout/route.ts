import { NextRequest, NextResponse } from "next/server";
import { MOCK_SESSION_COOKIE, mockSessionCookieOptions } from "@/lib/server/mock-auth";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Origen no permitido." }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(MOCK_SESSION_COOKIE, "", mockSessionCookieOptions(0));
  return response;
}
