import { requireRole } from "@/lib/server/route-guard";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["SUPER_ADMIN"]);
  return children;
}
