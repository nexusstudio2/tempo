import { ManageShell } from "@/components/layout/manage-shell";

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return <ManageShell>{children}</ManageShell>;
}
