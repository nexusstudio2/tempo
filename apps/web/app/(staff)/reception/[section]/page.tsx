import { notFound } from "next/navigation";
import { ReceptionPage } from "@/features/screens/reception";

const SECTIONS = ["customers", "payments", "attendance", "access"];

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!SECTIONS.includes(section)) notFound();
  return <ReceptionPage section={section} />;
}
