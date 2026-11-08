import { requireRole } from "@/lib/server/route-guard";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["INSTRUCTOR"]);
  return children;
}
