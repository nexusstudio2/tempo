"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav, type NavItem } from "@/components/ui/bottom-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogoMark } from "@/components/ui/logo";

type Row = { title: string; detail: string; status?: string; tone?: "ok" | "warn" | "danger" };

const pillClass = { ok: "bg-ok-soft text-ok", warn: "bg-warn-soft text-warn", danger: "bg-danger-soft text-danger" };

function Status({ row }: { row: Row }) {
  if (!row.status) return null;
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${pillClass[row.tone ?? "ok"]}`}>{row.status}</span>;
}

function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return <><h1 className="mb-1 mt-3 font-display text-[26px] font-semibold tracking-tight">{title}</h1><p className="mb-4 text-muted">{subtitle}</p></>;
}

function RowList({ rows, onSelect }: { rows: Row[]; onSelect?: (row: Row) => void }) {
  return <ul className="grid gap-2.5">{rows.map((row, i) => <li key={`${row.title}-${i}`}>
    {onSelect ? <button type="button" onClick={() => onSelect(row)} className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 text-left">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft font-semibold text-brand">{row.title.slice(0, 2).toUpperCase()}</span>
      <span className="min-w-0 flex-1"><b className="block truncate">{row.title}</b><small className="text-muted">{row.detail}</small></span><Status row={row}/><span aria-hidden="true" className="text-xl text-muted">›</span>
    </button> : <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft font-semibold text-brand">{row.title.slice(0, 2).toUpperCase()}</span>
      <span className="min-w-0 flex-1"><b className="block truncate">{row.title}</b><small className="text-muted">{row.detail}</small></span><Status row={row}/>
    </div>}
  </li>)}</ul>;
}

function DemoFrame({ title, children, nav }: { title: string; children: React.ReactNode; nav: NavItem[] }) {
  return <div className="min-h-screen bg-bg text-ink">
    <header className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-line bg-bg px-4 py-2.5">
      <LogoMark className="h-[34px] w-[34px]"/><span className="font-display text-[22px] font-semibold">tempo</span>
      <span className="ml-auto truncate text-sm text-muted">{title}</span><ThemeToggle/>
    </header>
    <main className="mx-auto max-w-[1100px] px-4 pb-28 pt-2">{children}</main>
    <BottomNav items={nav}/>
  </div>;
}

const BUSINESS_NAV: NavItem[] = [
  { label: "Inicio", icon: "⌂", href: "/manage/dashboard" },
  { label: "Clientes", icon: "☺", href: "/manage/customers" },
  { label: "Pagos", icon: "$", href: "/manage/payments" },
  { label: "Asistencia", icon: "✓", href: "/manage/attendance" },
  { label: "Más", icon: "≡", href: "/manage/memberships" },
];

const BUSINESS_SECTIONS: Record<string, { title: string; subtitle: string; rows: Row[] }> = {
  payments: { title: "Pagos", subtitle: "Cobros y movimientos del negocio", rows: [
    { title: "Ana Torres", detail: "Mensual Pro · $890 · hoy 09:12", status: "Aprobado", tone: "ok" },
    { title: "Rafael Cruz", detail: "Mensual · $650 · hoy 08:40", status: "Pendiente", tone: "warn" },
    { title: "Paola Mena", detail: "Trimestral · $1,700 · ayer", status: "Aprobado", tone: "ok" },
    { title: "Luis Herrera", detail: "Mensual · $650 · ayer", status: "Rechazado", tone: "danger" },
  ] },
  attendance: { title: "Asistencia", subtitle: "Entradas registradas hoy", rows: [
    { title: "Ana Torres", detail: "07:02 · Centro · QR", status: "Registrada", tone: "ok" },
    { title: "Diego Salas", detail: "07:15 · Centro · Membresía vencida", status: "Revisar", tone: "danger" },
    { title: "Paola Mena", detail: "07:40 · Sur · QR", status: "Registrada", tone: "ok" },
    { title: "Marcela Ortiz", detail: "08:05 · Polanco · Manual", status: "Registrada", tone: "ok" },
  ] },
  memberships: { title: "Membresías", subtitle: "Planes y membresías de tus clientes", rows: [
    { title: "Mensual", detail: "$650 · Acceso ilimitado · 412 activas", status: "Activa", tone: "ok" },
    { title: "Mensual Pro", detail: "$890 · Acceso + clases grupales · 388 activas", status: "Activa", tone: "ok" },
    { title: "Trimestral", detail: "$1,700 · Acceso ilimitado · 190 activas", status: "Activa", tone: "ok" },
    { title: "Paquete 10 clases", detail: "$600 · Vigencia 60 días · 96 activas", status: "Activa", tone: "ok" },
  ] },
  access: { title: "Accesos", subtitle: "Dispositivos registrados por sucursal", rows: [
    { title: "Lector de QR", detail: "Cámara de recepción · Centro · Hace 2 min", status: "En línea", tone: "ok" },
    { title: "Lector de huellas", detail: "Puerta principal · Centro · Hace 5 min", status: "En línea", tone: "ok" },
    { title: "Reconocimiento facial", detail: "Torniquete · Centro · Desde 06:40", status: "Sin conexión", tone: "danger" },
    { title: "Lector de tarjetas", detail: "Vestidores · Polanco · Nunca probado", status: "Sin probar", tone: "warn" },
  ] },
  reservations: { title: "Reservas", subtitle: "Clases y lugares reservados", rows: [
    { title: "Spinning · 18:00", detail: "Hoy · Coach Iván · 18 de 20 lugares", status: "2 lugares", tone: "warn" },
    { title: "Funcional · 19:00", detail: "Hoy · Coach Sara · 20 de 20 lugares", status: "Completa", tone: "danger" },
    { title: "Yoga · 07:30", detail: "Mañana · Coach Mía · 9 de 15 lugares", status: "Disponible", tone: "ok" },
  ] },
  team: { title: "Equipo", subtitle: "Personas que trabajan en el negocio", rows: [
    { title: "Mariana López", detail: "Propietaria · Todas las sucursales", status: "Activo", tone: "ok" },
    { title: "Carlos Pérez", detail: "Gerente · Centro", status: "Activo", tone: "ok" },
    { title: "Andrea Ruiz", detail: "Recepción · Centro", status: "Activo", tone: "ok" },
    { title: "Iván Torres", detail: "Instructor · Centro", status: "Activo", tone: "ok" },
  ] },
  branches: { title: "Sucursales", subtitle: "Ubicaciones del negocio", rows: [
    { title: "Centro", detail: "CDMX · 520 clientes", status: "Activa", tone: "ok" },
    { title: "Polanco", detail: "CDMX · 410 clientes", status: "Activa", tone: "ok" },
    { title: "Sur", detail: "CDMX · 310 clientes", status: "Activa", tone: "ok" },
  ] },
  announcements: { title: "Anuncios", subtitle: "Mensajes para tus clientes", rows: [
    { title: "Horario de noviembre", detail: "Publicado · 1 nov · Todos los clientes", status: "Publicado", tone: "ok" },
    { title: "Mantenimiento de regaderas", detail: "Programado · 10 nov · Sucursal Centro", status: "Programado", tone: "warn" },
  ] },
  "custom-fields": { title: "Campos personalizados", subtitle: "Datos adicionales del perfil del cliente", rows: [
    { title: "Contacto de emergencia", detail: "Texto · Visible para gerencia y recepción", status: "Activo", tone: "ok" },
    { title: "Objetivo de entrenamiento", detail: "Lista · Visible para instructores", status: "Activo", tone: "ok" },
  ] },
  reports: { title: "Reportes", subtitle: "Indicadores del último periodo de 30 días", rows: [
    { title: "Clientes registrados y activos", detail: "1,240 clientes activos · +36 este mes" },
    { title: "Membresías vigentes y vencidas", detail: "1,086 vigentes · 54 vencidas" },
    { title: "Ingresos y pagos pendientes", detail: "$284,500 cobrados · $12,300 pendientes" },
    { title: "Asistencia por sucursal", detail: "Centro 4,210 · Polanco 2,940 · Sur 2,186" },
  ] },
  settings: { title: "Ajustes", subtitle: "Preferencias del negocio", rows: [
    { title: "Datos del negocio", detail: "Nombre, giro y datos de contacto" },
    { title: "Sucursales y horarios", detail: "Horarios de atención y días festivos" },
    { title: "Notificaciones", detail: "Avisos de pagos, reservas y asistencia" },
    { title: "Permisos del equipo", detail: "Acceso por rol y sucursal" },
  ] },
};

export function BusinessDashboard() {
  const [notice, setNotice] = useState<string | null>(null);
  const stats = [["Clientes activos", "1,240", "+36 este mes"], ["Ingresos del mes", "$284,500", "+6%"], ["Asistencias hoy", "312", "Pico 18:00"], ["Pagos pendientes", "$12,300", "9 clientes"]];
  const rows: Row[] = [
    { title: "Ana Torres", detail: "Mensual Pro · Vence 18 nov · Centro", status: "Activa", tone: "ok" },
    { title: "Luis Herrera", detail: "Mensual · Vence 06 nov · Centro", status: "Por vencer", tone: "warn" },
    { title: "Marcela Ortiz", detail: "Paquete 10 clases · 7 créditos · Polanco", status: "Activa", tone: "ok" },
  ];
  return <div>
    <PageHeading title="Resumen del negocio" subtitle="Gimnasio Titan · Estado de hoy"/>
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">{stats.map(([label, value, note]) => <Card key={label}><small className="text-muted">{label}</small><strong className="mt-1 block font-display text-2xl">{value}</strong><small className="text-muted">{note}</small></Card>)}</div>
    {notice && <p role="status" className="mt-3 rounded-2xl bg-ok-soft px-3.5 py-3 text-ok">{notice}</p>}
    <div className="mt-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Actividad reciente</h2><Link className="text-sm font-semibold text-brand" href="/manage/customers">Ver clientes</Link></div>
    <div className="mt-3"><RowList rows={rows} onSelect={(row) => setNotice(`${row.title}: ${row.detail}`)}/></div>
    <Card className="mt-4"><h2 className="font-semibold">Pagos que requieren atención</h2><p className="mt-1 text-sm text-muted">9 pagos pendientes por un total de $12,300.</p><Link className="mt-3 inline-block font-semibold text-brand" href="/manage/payments">Revisar pagos →</Link></Card>
  </div>;
}

export function BusinessSection({ section }: { section: string }) {
  const data = BUSINESS_SECTIONS[section];
  if (!data) return null;
  return <><PageHeading title={data.title} subtitle={data.subtitle}/><RowList rows={data.rows}/></>;
}

const ADMIN_SECTIONS: Record<string, { title: string; subtitle: string; rows: Row[] }> = {
  establishments: { title: "Establecimientos", subtitle: "24 negocios en la plataforma", rows: [
    { title: "Gimnasio Titan", detail: "Gimnasio · Pro · CDMX · 3 sucursales · 1,240 clientes", status: "Activa", tone: "ok" },
    { title: "Academia Dance", detail: "Baile · Básico · Guadalajara · 310 clientes", status: "Activa", tone: "ok" },
    { title: "Flow Yoga Studio", detail: "Yoga · Básico · Monterrey · 95 clientes", status: "Pago rechazado", tone: "warn" },
    { title: "Dojo Kaizen", detail: "Artes marciales · Pro · Puebla · 420 clientes", status: "Activa", tone: "ok" },
    { title: "Aqua Kids", detail: "Natación · Básico · Querétaro · 60 clientes", status: "En prueba", tone: "warn" },
  ] },
  plans: { title: "Planes comerciales", subtitle: "Planes disponibles para establecimientos", rows: [
    { title: "Básico · $590 MXN", detail: "1 sucursal · 300 clientes · Reservas y QR", status: "Disponible", tone: "ok" },
    { title: "Pro · $1,490 MXN", detail: "5 sucursales · 2,000 clientes · Todos los módulos", status: "Disponible", tone: "ok" },
    { title: "Anual Pro · $14,900 MXN", detail: "5 sucursales · 2,000 clientes · 2 meses gratis", status: "Disponible", tone: "ok" },
  ] },
  subscriptions: { title: "Suscripciones", subtitle: "Cobros de Libiter a establecimientos", rows: [
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
    { title: "Cambio de plan", detail: "Gimnasio Titan · hoy 10:14 · Superadministrador" },
    { title: "Acceso de soporte", detail: "Academia Dance · ayer 16:32 · Superadministrador" },
    { title: "Cuenta suspendida", detail: "Box Central · 03 nov 09:08 · Sistema" },
  ] },
};
const ADMIN_NAV: NavItem[] = [
  { label: "Resumen", icon: "⌂", href: "/admin/dashboard" },
  { label: "Negocios", icon: "▦", href: "/admin/establishments" },
  { label: "Planes", icon: "◧", href: "/admin/plans" },
  { label: "Soporte", icon: "?", href: "/admin/support" },
  { label: "Más", icon: "≡", href: "/admin/subscriptions" },
];

export function AdminPage({ section = "overview" }: { section?: string }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const detail = ADMIN_SECTIONS[section];
  const filtered = useMemo(() => detail?.rows.filter((row) => `${row.title} ${row.detail}`.toLowerCase().includes(query.toLowerCase())) ?? [], [detail, query]);
  return <DemoFrame title="Libiter · Superadministrador" nav={ADMIN_NAV}>
    {section === "overview" ? <>
      <PageHeading title="Resumen global" subtitle="Estado de Tempo hoy"/>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">{[["Establecimientos", "24", "+3 este mes"], ["Clientes", "8,420", "+6%"], ["Ingresos del mes", "$31,860", "Pagos recibidos"], ["Incidencias abiertas", "2", "Requieren atención"]].map(([l,v,n]) => <Card key={l}><small className="text-muted">{l}</small><b className="mt-1 block font-display text-2xl">{v}</b><small className="text-muted">{n}</small></Card>)}</div>
      <Card className="mt-4"><h2 className="font-semibold">Atención requerida</h2><p className="mt-1 text-sm text-muted">Hay 2 cuentas con pago pendiente y 1 incidencia de prioridad alta.</p><div className="mt-3 flex flex-wrap gap-2"><Link className="font-semibold text-brand" href="/admin/subscriptions">Revisar suscripciones →</Link><Link className="font-semibold text-brand" href="/admin/support">Ver soporte →</Link></div></Card>
      <div className="mt-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Establecimientos recientes</h2><Link href="/admin/establishments" className="text-sm font-semibold text-brand">Ver todos</Link></div>
      <div className="mt-3"><RowList rows={ADMIN_SECTIONS.establishments.rows.slice(0,3)} onSelect={setSelected}/></div>
    </> : <>
      <PageHeading title={detail?.title ?? "Resumen global"} subtitle={detail?.subtitle ?? "Estado de Tempo hoy"}/>
      {(section === "establishments" || section === "support") && <input aria-label="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar" className="mb-3 h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-surface px-4"/>}
      <RowList rows={filtered} onSelect={setSelected}/>
      {section === "audit" && <Card className="mt-4"><h2 className="font-semibold">Registro protegido</h2><p className="mt-1 text-sm text-muted">Las acciones administrativas sensibles se registran para revisión.</p></Card>}
    </>}
    {notice && <p role="status" className="mt-3 rounded-2xl bg-ok-soft p-3 text-ok">{notice}</p>}
    <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Detalle"}>
      <p className="text-muted">{selected?.detail}</p><div className="mt-4 grid gap-2"><Button onClick={() => { setNotice(`Detalle consultado: ${selected?.title}`); setSelected(null); }}>Ver registro</Button><Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button></div>
    </BottomSheet>
  </DemoFrame>;
}

const RECEPTION_NAV: NavItem[] = [
  { label: "Recepción", icon: "▣", href: "/reception/home" }, { label: "Clientes", icon: "☺", href: "/reception/customers" },
  { label: "Pagos", icon: "$", href: "/reception/payments" }, { label: "Asistencia", icon: "✓", href: "/reception/attendance" }, { label: "Accesos", icon: "⚙", href: "/reception/access" },
];
const RECEPTION_PAGES: Record<string, { title: string; subtitle: string; rows: Row[] }> = {
  customers: { title: "Clientes", subtitle: "Consulta y validación de membresías", rows: [
    { title: "Ana Torres", detail: "Mensual Pro · Vence 18 nov", status: "Activa", tone: "ok" }, { title: "Luis Herrera", detail: "Mensual · Vence 06 nov", status: "Por vencer", tone: "warn" },
    { title: "Diego Salas", detail: "Mensual · Venció 25 oct", status: "Vencida", tone: "danger" }, { title: "Rafael Cruz", detail: "Mensual · Pago por confirmar", status: "Pendiente", tone: "warn" },
  ] },
  payments: { title: "Pagos", subtitle: "Cobros autorizados para recepción", rows: [
    { title: "Ana Torres", detail: "Mensual Pro · $890 · Tarjeta · 09:12", status: "Registrado", tone: "ok" }, { title: "Rafael Cruz", detail: "Mensual · $650 · Transferencia · 08:40", status: "Registrado", tone: "ok" },
    { title: "Paola Mena", detail: "Trimestral · $1,700 · Efectivo · ayer", status: "Registrado", tone: "ok" },
  ] },
  attendance: { title: "Asistencia", subtitle: "Entradas de hoy en Centro", rows: [
    { title: "Marcela Ortiz", detail: "08:05 · Manual", status: "Entró", tone: "ok" }, { title: "Paola Mena", detail: "07:40 · Huella", status: "Entró", tone: "ok" },
    { title: "Diego Salas", detail: "07:15 · Membresía vencida", status: "Rechazada", tone: "danger" }, { title: "Ana Torres", detail: "07:02 · Tarjeta", status: "Entró", tone: "ok" },
  ] },
  access: { title: "Accesos", subtitle: "Equipos de entrada de la sucursal Centro", rows: [
    { title: "Lector de QR", detail: "Cámara de recepción · Hace 2 min", status: "En línea", tone: "ok" }, { title: "Lector de huellas", detail: "Puerta principal · Hace 5 min", status: "En línea", tone: "ok" },
    { title: "Reconocimiento facial", detail: "Torniquete · Desde las 06:40", status: "Sin conexión", tone: "danger" },
  ] },
};

export function ReceptionPage({ section = "reception" }: { section?: string }) {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("Código QR");
  const [notice, setNotice] = useState<string | null>(null);
  const data = RECEPTION_PAGES[section];
  const title = data?.title ?? "Recepción";
  const rows = useMemo(() => data?.rows.filter((row) => `${row.title} ${row.detail}`.toLowerCase().includes(search.toLowerCase())) ?? [], [data, search]);
  return <DemoFrame title="Gimnasio Titan · Centro" nav={RECEPTION_NAV}>
    {data ? <><PageHeading title={title} subtitle={data.subtitle}/>{section === "customers" && <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar cliente" placeholder="Buscar por nombre" className="mb-3 h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-surface px-4"/>}<RowList rows={rows}/></> : <>
      <PageHeading title="Recepción" subtitle="Sucursal Centro · Control de entrada"/>
      <Card><p className="font-semibold">Método de acceso</p><div className="mt-3 flex flex-wrap gap-2">{["Código QR", "Huella", "Rostro", "Tarjeta"].map((m) => <button key={m} type="button" onClick={() => setMethod(m)} aria-pressed={method === m} className="min-h-10 rounded-full border border-line bg-surface px-3 text-sm aria-pressed:border-brand aria-pressed:bg-brand-soft aria-pressed:text-brand">{m}</button>)}</div><button type="button" onClick={() => setNotice(`Listo para validar con ${method}. Conecta el dispositivo o registra la entrada manualmente.`)} className="mt-4 grid min-h-40 w-full place-items-center rounded-2xl border-2 border-dashed border-brand bg-brand-soft p-4 text-center"><span><b className="block font-display text-xl">▣</b><b className="mt-2 block">Iniciar {method}</b><small className="text-muted">La validación de acceso requiere conexión con el servicio.</small></span></button>
        <div className="mt-3 grid grid-cols-2 gap-2"><Button variant="secondary" onClick={() => setNotice("Para registrar una entrada, busca al cliente en Clientes y valida su membresía.")}>Registro manual</Button><Link href="/reception/customers" className="flex min-h-[52px] items-center justify-center rounded-[14px] border border-line bg-surface px-3 text-center font-semibold">Buscar cliente</Link></div>
      </Card>
      {notice && <p role="status" className="mt-3 rounded-2xl bg-brand-soft p-3 text-sm text-brand">{notice}</p>}
      <div className="mt-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Entradas recientes</h2><Link href="/reception/attendance" className="text-sm font-semibold text-brand">Ver todas</Link></div><div className="mt-3"><RowList rows={RECEPTION_PAGES.attendance.rows.slice(0,3)}/></div>
    </>}
  </DemoFrame>;
}

const INSTRUCTOR_NAV: NavItem[] = [
  { label: "Hoy", icon: "▣", href: "/instructor/today" }, { label: "Clases", icon: "♫", href: "/instructor/classes" },
  { label: "Alumnos", icon: "☺", href: "/instructor/students" }, { label: "Horario", icon: "▤", href: "/instructor/schedule" },
];
const CLASSES: Row[] = [
  { title: "Salsa Nivel 2", detail: "16:30 · Salón B · 14/16 lugares", status: "Terminada", tone: "ok" },
  { title: "Salsa Nivel 1", detail: "18:00 · Salón A · 14/16 lugares", status: "Próxima", tone: "warn" },
  { title: "Bachata Intermedio", detail: "19:30 · Salón A · 12/12 · 2 en espera", status: "Próxima", tone: "warn" },
];
const STUDENTS: Row[] = [
  { title: "Valeria Soto", detail: "Salsa Nivel 1 · 92% asistencia", status: "Activa", tone: "ok" }, { title: "Jorge Ibarra", detail: "Salsa Nivel 1 · 85% asistencia", status: "Activa", tone: "ok" },
  { title: "Camila Ruiz", detail: "Salsa Nivel 1 · 78% asistencia", status: "Por vencer", tone: "warn" }, { title: "Héctor Mena", detail: "Salsa Nivel 1 · 60% asistencia", status: "Vencida", tone: "danger" },
  { title: "Daniela Vega", detail: "Salsa Nivel 1 · 96% asistencia", status: "Activa", tone: "ok" },
];
const SCHEDULE: Row[] = [
  { title: "Lunes", detail: "18:00 Salsa Nivel 1 · Salón A · 19:30 Bachata Intermedio · Salón A" }, { title: "Martes", detail: "16:30 Salsa Nivel 2 · Salón B" },
  { title: "Miércoles", detail: "18:00 Salsa Nivel 1 · Salón A · 19:30 Bachata Intermedio · Salón A" }, { title: "Jueves", detail: "16:30 Salsa Nivel 2 · Salón B" }, { title: "Sábado", detail: "10:00 Ritmos Kids · Salón A" },
];
export function InstructorPage({ section = "today" }: { section?: string }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const data = section === "classes" ? { title: "Clases y grupos", subtitle: "Grupos asignados", rows: CLASSES } : section === "students" ? { title: "Alumnos", subtitle: "Alumnos de tus grupos", rows: STUDENTS } : section === "schedule" ? { title: "Horario", subtitle: "Tus clases de la semana", rows: SCHEDULE } : null;
  const rows = useMemo(() => data?.rows.filter((row) => `${row.title} ${row.detail}`.toLowerCase().includes(search.toLowerCase())) ?? [], [data, search]);
  return <DemoFrame title="Academia Dance · Instructor" nav={INSTRUCTOR_NAV}>
    {data ? <><PageHeading title={data.title} subtitle={data.subtitle}/>{section === "students" && <input aria-label="Buscar alumno" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar alumno" className="mb-3 h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-surface px-4"/>}<RowList rows={rows} onSelect={section === "students" ? setSelected : undefined}/>{section === "schedule" && <Button variant="secondary" className="mt-4" onClick={() => setNotice("Prepara tu solicitud de cambio de horario para el gerente.")}>Solicitar cambio de horario</Button>}</> : <>
      <PageHeading title="Hola, Mariana" subtitle="Jueves · Tu jornada de hoy"/>
      <Card className="border-brand bg-brand text-white"><small> Siguiente clase · en 1 h 20 min</small><h2 className="mt-2 font-display text-2xl font-semibold">Salsa Nivel 1</h2><p className="mt-1">18:00 · Salón A · 14 de 16 lugares</p><Button variant="secondary" className="mt-4" onClick={() => setSelected({ title: "Pasar lista · Salsa Nivel 1", detail: "Marca la asistencia de tus alumnos." })}>Pasar lista</Button></Card>
      <div className="mt-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Clases de hoy</h2><Link href="/instructor/classes" className="text-sm font-semibold text-brand">Ver clases</Link></div><div className="mt-3"><RowList rows={CLASSES}/></div>
    </>}
    {notice && <p role="status" className="mt-3 rounded-2xl bg-ok-soft p-3 text-ok">{notice}</p>}
    <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Detalle"}>
      <p className="mb-3 text-muted">{selected?.detail}</p>{STUDENTS.slice(0,5).map((student) => <div key={student.title} className="flex items-center justify-between border-b border-line py-3"><span><b className="block">{student.title}</b><small className="text-muted">{student.status}</small></span><span className="flex gap-1"><button type="button" aria-label={`${student.title}: vino`} aria-pressed={attendance[student.title] === "vino"} onClick={() => setAttendance({ ...attendance, [student.title]: attendance[student.title] === "vino" ? "" : "vino" })} className="rounded-lg border border-line px-2 py-1 aria-pressed:bg-ok-soft">Vino</button><button type="button" aria-label={`${student.title}: faltó`} aria-pressed={attendance[student.title] === "faltó"} onClick={() => setAttendance({ ...attendance, [student.title]: attendance[student.title] === "faltó" ? "" : "faltó" })} className="rounded-lg border border-line px-2 py-1 aria-pressed:bg-danger-soft">Faltó</button></span></div>)}
      <div className="mt-4 grid gap-2"><Button onClick={() => { setNotice("La lista quedó guardada en esta sesión de demostración."); setSelected(null); }}>Guardar lista</Button><Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button></div>
    </BottomSheet>
  </DemoFrame>;
}

const CUSTOMER_NAV: NavItem[] = [
  { label: "Inicio", icon: "⌂", href: "/me/home" }, { label: "Reservas", icon: "▦", href: "/me/reservations" },
  { label: "Mi QR", icon: "▣", href: "/me/qr" }, { label: "Pagos", icon: "$", href: "/me/payments" }, { label: "Perfil", icon: "☺", href: "/me/profile" },
];
const CUSTOMER_PAGES: Record<string, { title: string; subtitle: string; rows: Row[] }> = {
  reservations: { title: "Reservas", subtitle: "Tus próximas clases", rows: [
    { title: "Spinning", detail: "Hoy · 18:00 · Coach Iván · 18 de 20 lugares", status: "Disponible", tone: "ok" }, { title: "Funcional", detail: "Hoy · 19:00 · Coach Sara · 20 de 20 lugares", status: "Completa", tone: "warn" },
    { title: "Yoga", detail: "Mañana · 07:30 · Coach Mía · 9 de 15 lugares", status: "Disponible", tone: "ok" }, { title: "Boxeo", detail: "Mañana · 18:30 · Coach Leo · 12 de 16 lugares", status: "Disponible", tone: "ok" },
  ] },
  payments: { title: "Pagos", subtitle: "Historial de pagos · importes en MXN", rows: [
    { title: "Mensual Pro · $890", detail: "18 oct · Tarjeta", status: "Aprobado", tone: "ok" }, { title: "Mensual Pro · $890", detail: "18 sep · Tarjeta", status: "Aprobado", tone: "ok" },
    { title: "Mensual Pro · $890", detail: "18 ago · Tarjeta", status: "Reembolsado", tone: "warn" }, { title: "Mensual Pro · $890", detail: "18 jul · Efectivo", status: "Aprobado", tone: "ok" },
  ] },
  profile: { title: "Perfil", subtitle: "Tu cuenta en Gimnasio Titan", rows: [
    { title: "Valeria Soto", detail: "valeria@example.com · Cliente", status: "Activo", tone: "ok" }, { title: "Membresía", detail: "Mensual Pro · Vence el 18 de noviembre", status: "Activa", tone: "ok" },
    { title: "Sucursal", detail: "Gimnasio Titan · Centro" },
  ] },
};
export function CustomerPage({ section = "home" }: { section?: string }) {
  const [selected, setSelected] = useState<Row | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const data = CUSTOMER_PAGES[section];
  return <DemoFrame title="Gimnasio Titan · Cliente" nav={CUSTOMER_NAV}>
    {section === "qr" ? <><PageHeading title="Mi QR" subtitle="Muestra este código al entrar al gimnasio"/><Card className="mx-auto grid max-w-sm justify-items-center py-10"><div aria-label="Código QR de demostración" className="grid h-52 w-52 grid-cols-9 gap-1 rounded-lg bg-white p-3">{Array.from({ length: 81 }, (_, i) => <span key={i} className={(i * 7 + Math.floor(i / 3)) % 5 < 2 ? "bg-neutral-900" : "bg-white"}/>)}</div><b className="mt-4">Valeria Soto</b><small className="text-muted">Mensual Pro · Membresía activa</small></Card><p className="mx-auto mt-3 max-w-sm text-center text-sm text-muted">Código visual de demostración; el acceso real debe validarse en el servicio del gimnasio.</p></> : data ? <><PageHeading title={data.title} subtitle={data.subtitle}/>{section === "reservations" && <p className="mb-3 text-sm text-muted">Elige una clase para consultar disponibilidad y estado.</p>}<RowList rows={data.rows} onSelect={setSelected}/></> : <>
      <PageHeading title="Hola, Valeria" subtitle="Gimnasio Titan · Centro"/>
      <Card className="border-brand bg-brand text-white"><small>Tu membresía</small><h2 className="mt-1 font-display text-2xl font-semibold">Mensual Pro</h2><p className="mt-1">Activa · Vence el 18 de noviembre</p><Link href="/me/qr" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-4 font-semibold text-brand">Mostrar mi QR</Link></Card>
      <div className="mt-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Próximas clases</h2><Link href="/me/reservations" className="text-sm font-semibold text-brand">Ver reservas</Link></div><div className="mt-3"><RowList rows={CUSTOMER_PAGES.reservations.rows.slice(0,3)} onSelect={setSelected}/></div>
      <Card className="mt-4"><h2 className="font-semibold">Actividad reciente</h2><p className="mt-1 text-sm text-muted">Hoy 07:02 · Entrada en Centro · QR</p><p className="text-sm text-muted">Pago aprobado · Mensual Pro · $890</p></Card>
    </>}
    {notice && <p role="status" className="mt-3 rounded-2xl bg-ok-soft p-3 text-ok">{notice}</p>}
    <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Detalle"}><p className="text-muted">{selected?.detail}</p><div className="mt-4 grid gap-2"><Button onClick={() => { setNotice(`Consultaste: ${selected?.title}. La confirmación final requiere conexión con el servicio.`); setSelected(null); }}>Continuar</Button><Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button></div></BottomSheet>
  </DemoFrame>;
}
