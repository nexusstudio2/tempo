import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routeForRole } from "@/features/contexts/routes";
import { activeContextForMockSession, contextsForMockUser, MOCK_SESSION_COOKIE, openMockSession } from "@/lib/server/mock-auth";
import { requireAuthenticated } from "@/lib/server/route-guard";

export default async function SelectContextLayout({ children }: { children: React.ReactNode }) {
  await requireAuthenticated();
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    const session = openMockSession((await cookies()).get(MOCK_SESSION_COOKIE)?.value);
    if (session) {
      const contexts = contextsForMockUser(session.email);
      if (contexts.length === 1) {
        const active = activeContextForMockSession(session);
        if (active) redirect(routeForRole(active.role));
        redirect("/api/auth/mock/continue");
      }
    }
  }
  return children;
}
