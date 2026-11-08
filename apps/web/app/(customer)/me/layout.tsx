import { requireRole } from "@/lib/server/route-guard";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["CUSTOMER"]);
  return children;
}
