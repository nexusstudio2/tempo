"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav, type NavItem } from "@/components/ui/bottom-nav";
import { DemoFrame, FeatureList, PageHeading, RowList, type Row } from "@/features/screens/common";

const ADMIN_SECTIONS: Record<string, { title: string; subtitle: string; rows: Row[] }> = {
  establishments: { title: "Establecimientos", subtitle: "24 negocios en la plataforma", rows: [
    { title: "Gimnasio Titan", detail: "Gimnasio · Pro · CDMX · 3 sucursales · 1,240 clientes", status: "Activa", tone: "ok" },
    { title: "Academia Dance", detail: "Baile · Básico · Guadalajara · 310 clientes", status: "Activa", tone: "ok" },
    { title: "Flow Yoga Studio", detail: "Yoga · Básico · Monterrey · 95 clientes", status: "Pago rechazado", tone: "warn" },
    { title: "Dojo Kaizen", detail: "Artes marciales · Pro · Puebla · 420 clientes", status: "Activa", tone: "ok" },
    { title: "Aqua Kids", detail: "Natación · Básico · Querétaro · 60 clientes", status: "En prueba", tone: "warn" },
  ] },
  plans: { title: "Planes comerciales", subtitle: "Los cambios aplican sin nuevo despliegue", rows: [
    { title: "Básico · $590 MXN", detail: "1 sucursal · 300 clientes · 5 empleados · 2 dispositivos · Soporte por correo · Reservas y QR", status: "Disponible", tone: "ok" },
    { title: "Pro · $1,490 MXN", detail: "5 sucursales · 2,000 clientes · 25 empleados · 6 dispositivos · Soporte prioritario · Todos los módulos", status: "Disponible", tone: "ok" },
    { title: "Anual Pro · $14,900 MXN", detail: "5 sucursales · 2,000 clientes · 25 empleados · 6 dispositivos · Soporte prioritario · 2 meses gratis", status: "Disponible", tone: "ok" },
  ] },
  subscriptions: { title: "Suscripciones", subtitle: "Cobros de Koaliado a establecimientos", rows: [
    { title: "Gimnasio Titan", detail: "Pro mensual · Renueva 15 nov", status: "Activa", tone: "ok" },
    { title: "Academia Dance", detail: "Básico mensual · Renueva 02 dic", status: "Activa", tone: "ok" },
    { title: "Flow Yoga Studio", detail: "Básico mensual · Venció 28 oct · Gracia 3 días", status: "En gracia", tone: "warn" },
    { title: "Aqua Kids", detail: "Prueba 14 días · Termina 09 nov", status: "Prueba", tone: "warn" },
  ] },
  implementations: { title: "Implementaciones", subtitle: "Altas, migraciones y capacitación", rows: [
    { title: "Dojo Kaizen", detail: "Migración de 420 clientes · Capacitación 06 nov", status: "En curso", tone: "warn" },
    { title: "Aqua Kids", detail: "Alta y 1 sucursal · Puesta en marcha 09 nov", status: "Pendiente", tone: "warn" },
    { title: "Gimnasio Titan", detail: "Alta y 3 sucursales · Entregada 20 oct", status: "Completada", tone: "ok" },
  ] },
  support: { title: "Soporte", subtitle: "Incidencias de establecimientos", rows: [
    { title: "#214 · Flow Yoga Studio", detail: "No llega el recordatorio de clase", status: "Alta", tone: "danger" },
    { title: "#213 · Gimnasio Titan", detail: "Duda sobre exportar clientes", status: "Normal", tone: "warn" },
    { title: "#211 · Academia Dance", detail: "Cambiar logo del portal", status: "Resuelto", tone: "ok" },
  ] },
  audit: { title: "Auditoría", subtitle: "Acciones administrativas sensibles", rows: [
    { title: "Nadia R. · Cambio de precio del plan Pro", detail: "Hoy 10:42 · Superadministrador" },
    { title: "Nadia R. · Cuenta suspendida: Box Central", detail: "Ayer 17:05 · Superadministrador" },
    { title: "Sistema · Pago rechazado de Flow Yoga Studio", detail: "28 oct 09:00" },
    { title: "Mario L. · Promoción de lanzamiento creada", detail: "27 oct 12:30 · Superadministrador" },
    { title: "Nadia R. · Inicio de sesión con MFA", detail: "27 oct 08:55" },
  ] },
  "saas-payments": { title: "Pagos de Koaliado", subtitle: "Cobros de Koaliado a los establecimientos", rows: [
    { title: "Gimnasio Titan", detail: "Pro mensual · $1,490 · 15 oct", status: "Aprobado", tone: "ok" },
    { title: "Academia Dance", detail: "Básico mensual · $590 · 02 nov", status: "Aprobado", tone: "ok" },
    { title: "Flow Yoga Studio", detail: "Básico mensual · $590 · 28 oct", status: "Rechazado", tone: "danger" },
    { title: "Dojo Kaizen", detail: "Implementación · $4,500 · 20 oct", status: "Aprobado", tone: "ok" },
  ] },
  promotions: { title: "Promociones", subtitle: "Descuentos y periodos de prueba", rows: [
    { title: "Lanzamiento", detail: "2 meses gratis en plan anual · hasta 30 nov", status: "Activa", tone: "ok" },
    { title: "Referidos", detail: "20% de descuento el primer mes", status: "Programada", tone: "warn" },
    { title: "Prueba de 14 días", detail: "Plan Básico sin costo", status: "Activa", tone: "ok" },
  ] },
  configuration: { title: "Configuración global", subtitle: "Reglas que aplican a Koaliado", rows: [
    { title: "Moneda", detail: "MXN" }, { title: "Periodo de gracia", detail: "3 días" },
    { title: "Prueba gratuita", detail: "14 días" }, { title: "Verificación en dos pasos", detail: "Obligatoria para superadministrador" },
    { title: "Acciones sensibles", detail: "Requieren auditoría" },
  ] },
};
const ADMIN_NAV: NavItem[] = [
  { label: "Resumen", icon: "⌂", href: "/admin/dashboard" },
  { label: "Negocios", icon: "▦", href: "/admin/establishments" },
  { label: "Planes", icon: "◧", href: "/admin/plans" },
  { label: "Soporte", icon: "?", href: "/admin/support" },
  { label: "Más", icon: "≡", href: "/admin/subscriptions" },
];

function AdminMoreNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const moreActive = !ADMIN_NAV.slice(0, 4).some((item) => item.href && pathname === item.href);
  return <>
    <BottomNav items={[...ADMIN_NAV.slice(0, 4), { label: "Más", icon: "≡", active: moreActive, onClick: () => setOpen(true) }]} />
    <BottomSheet open={open} onClose={() => setOpen(false)} title="Más secciones"><ul className="grid gap-2">{[["Suscripciones", "subscriptions"], ["Implementaciones", "implementations"], ["Auditoría", "audit"], ["Pagos de Koaliado", "saas-payments"], ["Promociones", "promotions"], ["Configuración", "configuration"]].map(([label, slug]) => <li key={slug}><Link href={`/admin/${slug}`} onClick={() => setOpen(false)} className="flex min-h-14 items-center justify-between rounded-2xl border border-line bg-surface px-3.5 font-semibold">{label}<span className="text-xl text-muted">›</span></Link></li>)}</ul></BottomSheet>
  </>;
}

export function AdminPage({ section = "overview" }: { section?: string }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const detail = ADMIN_SECTIONS[section];
  const filtered = useMemo(() => detail?.rows.filter((row) => `${row.title} ${row.detail}`.toLowerCase().includes(query.toLowerCase())) ?? [], [detail, query]);
  return <DemoFrame title="Koaliado · Superadministrador" nav={ADMIN_NAV.slice(0, 4)} includeNav={false}>
    {section === "overview" ? <>
      <PageHeading title="Resumen global" subtitle="Estado de Koaliado hoy, 5 de noviembre"/>
      <Card className="mb-3 flex items-center justify-between gap-3 border-warn bg-warn-soft"><span className="text-sm text-warn">⚠ 2 cuentas con pago pendiente</span><Link className="shrink-0 font-semibold text-brand" href="/admin/subscriptions">Revisar →</Link></Card>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">{[["Establecimientos", "24", "+3 este mes"], ["Ingreso mensual", "$31,860", "+8%"], ["Suscripciones activas", "19", "2 en riesgo"], ["Incidencias abiertas", "4", "1 prioritaria"]].map(([l,v,n]) => <Card key={l}><small className="text-muted">{l}</small><b className="mt-1 block font-display text-2xl">{v}</b><small className="text-muted">{n}</small></Card>)}</div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2"><Card><h2 className="font-display text-lg font-semibold">Ingresos de Koaliado</h2><div className="mt-4 flex h-36 items-end gap-2">{[["Jun",40],["Jul",52],["Ago",60],["Sep",72],["Oct",86],["Nov",100]].map(([month,height])=><div key={month} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><span className="w-full rounded-t-md bg-brand" style={{height:`${height}%`}}/><small className="text-muted">{month}</small></div>)}</div></Card><Card><div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Pendientes</h2><Link href="/admin/implementations" className="text-sm font-semibold text-brand">Ver todos</Link></div><RowList rows={ADMIN_SECTIONS.implementations.rows.slice(0,2)} onSelect={setSelected}/></Card></div>
      <div className="mt-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Establecimientos recientes</h2><Link href="/admin/establishments" className="text-sm font-semibold text-brand">Ver todos</Link></div>
      <div className="mt-3"><RowList rows={ADMIN_SECTIONS.establishments.rows.slice(0,3)} onSelect={setSelected}/></div>
    </> : <>
      <PageHeading title={detail?.title ?? "Resumen global"} subtitle={detail?.subtitle ?? "Estado de Koaliado hoy"}/>
      {(section === "establishments" || section === "support") && <input aria-label="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar" className="mb-3 h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-surface px-4"/>}
      {section !== "plans" && <FeatureList rows={filtered} onSelect={setSelected}/>}
      {section === "plans" && <><div className="mt-2 grid gap-3 md:grid-cols-3">{filtered.map((row) => <Card key={row.title} className="flex flex-col"><h2 className="font-display text-xl font-semibold">{row.title.split(" · ")[0]}</h2><b className="mt-2 font-display text-2xl">{row.title.split(" · ")[1]?.replace(" MXN", "")} <small className="text-sm font-normal text-muted">MXN</small></b><ul className="mt-3 flex-1 list-disc space-y-2 pl-5 text-sm text-muted">{row.detail.split(" · ").map((feature) => <li key={feature}>{feature}</li>)}</ul><Button variant="secondary" className="mt-4" onClick={() => setNotice(`La edición del plan ${row.title.split(" · ")[0]} estará disponible al conectar el servicio.`)}>Editar plan</Button></Card>)}</div><Button className="mt-3 w-full" onClick={() => setNotice("La creación de planes estará disponible al conectar el servicio de Koaliado.")}>Crear plan</Button></>}
      {section === "saas-payments" && <><div className="mb-3 grid grid-cols-2 gap-2"><Card><small className="text-muted">Cobrado en noviembre</small><b className="mt-1 block text-xl">$31,860</b></Card><Card><small className="text-muted">Rechazados</small><b className="mt-1 block text-xl">2</b></Card></div><p className="mb-3 text-sm text-muted">Estos cobros de Koaliado son independientes de los pagos que cada establecimiento recibe de sus clientes.</p></>}
      {section === "promotions" && <Button className="mt-3 w-full" onClick={() => setNotice("La creación de promociones estará disponible al conectar el servicio de Koaliado.")}>Crear promoción</Button>}
      {section === "configuration" && <Button variant="secondary" className="mt-3 w-full" onClick={() => setNotice("La configuración se habilitará al conectar el servicio de Koaliado.")}>Editar configuración</Button>}
      {section === "audit" && <Card className="mt-4"><h2 className="font-semibold">Registro protegido</h2><p className="mt-1 text-sm text-muted">Las acciones administrativas sensibles se registran para revisión.</p></Card>}
    </>}
    {notice && <p role="status" className="mt-3 rounded-2xl bg-ok-soft p-3 text-ok">{notice}</p>}
    <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Detalle"}>
      <p className="text-muted">{selected?.detail}</p><div className="mt-4 grid gap-2"><Button onClick={() => { setNotice(`Detalle consultado: ${selected?.title}`); setSelected(null); }}>Ver registro</Button><Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button></div>
    </BottomSheet>
    <AdminMoreNav />
  </DemoFrame>;
}

