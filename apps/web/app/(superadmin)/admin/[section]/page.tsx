import { notFound } from "next/navigation";
import { AdminPage } from "@/features/screens/superadmin";

const SECTIONS: Record<string, string> = {
  establishments: "establishments", plans: "plans", subscriptions: "subscriptions",
  implementations: "implementations", support: "support", audit: "audit",
  "saas-payments": "saas-payments", promotions: "promotions", configuration: "configuration",
};

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!SECTIONS[section]) notFound();
  return <AdminPage section={SECTIONS[section]} />;
}
