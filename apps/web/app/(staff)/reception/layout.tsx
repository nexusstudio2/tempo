import { requireRole } from "@/lib/server/route-guard";

export default async function ReceptionLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["RECEPTIONIST"]);
  return children;
}
