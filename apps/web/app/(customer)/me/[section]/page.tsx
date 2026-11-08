import { notFound } from "next/navigation";
import { CustomerPage } from "@/features/screens/demo-pages";

const SECTIONS = ["reservations", "qr", "payments", "profile"];

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!SECTIONS.includes(section)) notFound();
  return <CustomerPage section={section} />;
}
