import { notFound } from "next/navigation";
import { AdminPage } from "@/features/screens/demo-pages";

const SECTIONS: Record<string, string> = {
  establishments: "establishments", plans: "plans", subscriptions: "subscriptions",
  implementations: "implementations", support: "support", audit: "audit",
};

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!SECTIONS[section]) notFound();
  return <AdminPage section={SECTIONS[section]} />;
}
