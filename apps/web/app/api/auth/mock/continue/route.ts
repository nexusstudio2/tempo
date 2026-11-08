import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { routeForRole } from "@/features/contexts/routes";
import {
  contextsForMockUser,
  MOCK_SESSION_COOKIE,
  mockSessionCookieOptions,
  openMockSession,
  sealMockSession,
} from "@/lib/server/mock-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = openMockSession((await cookies()).get(MOCK_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  const contexts = contextsForMockUser(session.email);
  if (contexts.length !== 1) return NextResponse.redirect(new URL("/select-context", request.url));

  const [context] = contexts;
  const response = NextResponse.redirect(new URL(routeForRole(context.role), request.url));
  response.cookies.set(
    MOCK_SESSION_COOKIE,
    sealMockSession({ ...session, activeContextId: context.id }),
    mockSessionCookieOptions(),
  );
  return response;
}
