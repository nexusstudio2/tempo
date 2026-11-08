import { ManageShell } from "@/components/layout/manage-shell";
import { requireRole } from "@/lib/server/route-guard";

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["BUSINESS_OWNER", "BUSINESS_ADMIN", "MANAGER"]);
  return <ManageShell>{children}</ManageShell>;
}
