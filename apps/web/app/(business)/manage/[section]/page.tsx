import { notFound } from "next/navigation";
import { BusinessDashboard, BusinessSection } from "@/features/screens/business";

const SECTIONS: Record<string, string> = {
  dashboard: "Resumen del negocio",
  customers: "Clientes",
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
  if (section === "dashboard") return <BusinessDashboardRoute />;
  return <BusinessSection section={section} />;
}

function BusinessDashboardRoute() {
  return <BusinessDashboard />;
}
