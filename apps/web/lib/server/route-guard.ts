import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { contextSchema, type Role, type TempoContext } from "@/features/contexts/types";
import { routeForRole } from "@/features/contexts/routes";
import { activeContextForMockSession, MOCK_SESSION_COOKIE, openMockSession } from "@/lib/server/mock-auth";
import { openSession, sessionCookieName } from "@/lib/server/auth-session";

export async function requireAuthenticated() {
  const cookieStore = await cookies();
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    if (!openMockSession(cookieStore.get(MOCK_SESSION_COOKIE)?.value)) redirect("/login");
    return;
  }
  if (!openSession(cookieStore.get(sessionCookieName())?.value)) redirect("/login");
}

async function activeContext(): Promise<TempoContext | null> {
  const cookieStore = await cookies();
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    const session = openMockSession(cookieStore.get(MOCK_SESSION_COOKIE)?.value);
    return session ? activeContextForMockSession(session) : null;
  }

  const session = openSession(cookieStore.get(sessionCookieName())?.value);
  if (!session) return null;
  try {
    const apiOrigin = process.env.API_PROXY_TARGET ?? "http://localhost:8080";
    const response = await fetch(new URL("/api/v1/contexts/active", apiOrigin), {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return null;
    return contextSchema.parse(await response.json());
  } catch {
    return null;
  }
}

export async function requireRole(allowedRoles: Role[]) {
  await requireAuthenticated();
  const context = await activeContext();
  if (!context) redirect("/select-context");
  if (!allowedRoles.includes(context.role)) redirect(routeForRole(context.role));
}
