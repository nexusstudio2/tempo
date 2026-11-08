import { notFound } from "next/navigation";
import { InstructorPage } from "@/features/screens/instructor";

const SECTIONS = ["classes", "students", "schedule"];

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!SECTIONS.includes(section)) notFound();
  return <InstructorPage section={section} />;
}
