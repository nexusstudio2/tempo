import { notFound } from "next/navigation";
import { BusinessSection } from "@/features/screens/demo-pages";

const SECTIONS: Record<string, string> = {
  payments: "Pagos",
  attendance: "Asistencia",
  memberships: "Membresías",
  access: "Accesos",
  reservations: "Reservas",
  team: "Equipo",
  branches: "Sucursales",
  announcements: "Anuncios",
  "custom-fields": "Campos personalizados",
  reports: "Reportes",
  settings: "Ajustes",
};

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = SECTIONS[section];
  if (!title) notFound();
  return <BusinessSection section={section} />;
}
