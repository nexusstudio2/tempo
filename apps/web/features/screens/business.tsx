"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav, type NavItem } from "@/components/ui/bottom-nav";
import { DemoFrame, FeatureList, PageHeading, RowList, type Row } from "@/features/screens/common";

const BUSINESS_NAV: NavItem[] = [
  { label: "Inicio", icon: "⌂", href: "/manage/dashboard" },
  { label: "Clientes", icon: "☺", href: "/manage/customers" },
  { label: "Pagos", icon: "$", href: "/manage/payments" },
  { label: "Asistencia", icon: "✓", href: "/manage/attendance" },
  { label: "Más", icon: "≡", href: "/manage/memberships" },
];

const BUSINESS_SECTIONS: Record<string, { title: string; subtitle: string; rows: Row[] }> = {
  dashboard: { title: "Resumen del negocio", subtitle: "Gimnasio Titan · Estado de hoy", rows: [] },
  customers: { title: "Clientes", subtitle: "1,240 activos · 86 inactivos", rows: [
    { title: "Ana Torres", detail: "Mensual Pro · Vence 18 nov · Centro", status: "Activa", tone: "ok" },
    { title: "Luis Herrera", detail: "Mensual · Vence 06 nov · Centro", status: "Por vencer", tone: "warn" },
    { title: "Marcela Ortiz", detail: "Paquete 10 clases · 7 créditos · Polanco", status: "Activa", tone: "ok" },
    { title: "Diego Salas", detail: "Mensual · Venció 25 oct · Centro", status: "Vencida", tone: "danger" },
    { title: "Paola Mena", detail: "Trimestral · Vence 20 ene · Sur", status: "Activa", tone: "ok" },
    { title: "Rafael Cruz", detail: "Mensual · Pago por confirmar · Polanco", status: "Pendiente", tone: "warn" },
  ] },
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
  return <DemoFrame title="Gimnasio Titan · Propietario" nav={BUSINESS_NAV} includeNav={false} includeHeader={false}>
    <div>
    <PageHeading title="Hola, Carlos" subtitle="Gimnasio Titan · hoy es 5 de noviembre"/>
    <div className="grid gap-2 sm:grid-cols-2"><Link href="/manage/customers" className="rounded-2xl border border-warn bg-warn-soft p-3 text-sm text-warn">⚠ 14 membresías vencen esta semana <b className="ml-1">Ver →</b></Link><Link href="/manage/access" className="rounded-2xl border border-danger bg-danger-soft p-3 text-sm text-danger">⚠ 1 dispositivo de acceso sin conexión <b className="ml-1">Ver →</b></Link></div>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><Button onClick={() => setNotice("Registrar cliente: el guardado requiere el servicio de clientes.")}>Registrar cliente</Button><Button variant="secondary" onClick={() => setNotice("Registrar pago: el guardado requiere el servicio de pagos.")}>Registrar pago</Button><Link href="/manage/attendance" className="flex min-h-[52px] items-center justify-center rounded-[14px] border border-line bg-surface px-3 text-center text-sm font-semibold">Ver asistencia</Link><Link href="/manage/reports" className="flex min-h-[52px] items-center justify-center rounded-[14px] border border-line bg-surface px-3 text-center text-sm font-semibold">Reportes</Link></div>
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">{stats.map(([label, value, note]) => <Card key={label}><small className="text-muted">{label}</small><strong className="mt-1 block font-display text-2xl">{value}</strong><small className="text-muted">{note}</small></Card>)}</div>
    {notice && <p role="status" className="mt-3 rounded-2xl bg-ok-soft px-3.5 py-3 text-ok">{notice}</p>}
    <div className="mt-4 grid gap-3 lg:grid-cols-2"><Card><h2 className="font-display text-lg font-semibold">Asistencia de la semana</h2><div className="mt-4 flex h-36 items-end gap-2">{[["L",70],["M",82],["X",76],["J",88],["V",60],["S",35],["Hoy",78]].map(([day, height]) => <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><span className="w-full rounded-t-md bg-brand" style={{ height: `${height}%` }}/><small className="text-muted">{day}</small></div>)}</div></Card><Card><div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Clases de hoy</h2><Link href="/manage/reservations" className="text-sm font-semibold text-brand">Ver todas</Link></div><RowList rows={BUSINESS_SECTIONS.reservations.rows} onSelect={(row) => setNotice(`${row.title}: ${row.detail}`)}/></Card></div>
    <div className="mt-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Actividad reciente</h2><Link className="text-sm font-semibold text-brand" href="/manage/customers">Ver clientes</Link></div>
    <div className="mt-3"><RowList rows={rows} onSelect={(row) => setNotice(`${row.title}: ${row.detail}`)}/></div>
    <Card className="mt-4"><h2 className="font-semibold">Pagos que requieren atención</h2><p className="mt-1 text-sm text-muted">9 pagos pendientes por un total de $12,300.</p><Link className="mt-3 inline-block font-semibold text-brand" href="/manage/payments">Revisar pagos →</Link></Card>
    </div>
  </DemoFrame>;
}

export function BusinessSection({ section }: { section: string }) {
  const data = BUSINESS_SECTIONS[section];
  if (!data) return null;
  return <DemoFrame title="Gimnasio Titan · Propietario" nav={BUSINESS_NAV} includeNav={false} includeHeader={false}>
    <BusinessSectionContent section={section} data={data}/>
  </DemoFrame>;
}

function BusinessSectionContent({ section, data }: { section: string; data: { title: string; subtitle: string; rows: Row[] } }) {
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [branch, setBranch] = useState("Todas");
  const [switches, setSwitches] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Row | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const filtered = data.rows.filter((row) =>
    (section !== "customers" || filter === "Todos" || row.status === filter) &&
    `${row.title} ${row.detail}`.toLowerCase().includes(search.toLowerCase()),
  );
  const actions: Record<string, string> = {
    customers: "Registrar cliente", memberships: "Crear plan", payments: "Registrar pago", attendance: "Registro manual",
    reservations: "Crear clase", team: "Invitar a alguien", branches: "Agregar sucursal", announcements: "Nuevo anuncio",
    "custom-fields": "Agregar campo", reports: "Exportar reporte", settings: "Guardar ajustes", access: "Agregar dispositivo",
  };
  const filters = ["Todos", "Activa", "Por vencer", "Vencida", "Pendiente"];
  const actionTitle = actions[section] ?? "Acción";
  if (section === "dashboard") {
    return <>
      <PageHeading title="Hola, Carlos" subtitle="Gimnasio Titan · Resumen del negocio" />
      <label className="mb-3 flex items-center gap-2 text-sm">Sucursal<select value={branch} onChange={(event) => setBranch(event.target.value)} className="h-10 flex-1 rounded-xl border border-line bg-surface px-3"><option>Todas</option><option>Centro</option><option>Polanco</option><option>Sur</option></select></label>
      <div className="mb-3 flex flex-wrap gap-2">{[["Clientes activos", "1,240"], ["Ingresos del mes", "$284,500"], ["Asistencias hoy", "312"], ["Pagos pendientes", "$12,300"]].map(([label, value]) => <Card key={label} className="min-w-36 flex-1"><small className="text-muted">{label}</small><strong className="mt-1 block font-display text-xl">{value}</strong></Card>)}</div>
      <Card><h2 className="font-semibold">Asistencia de la semana</h2><div className="mt-4 flex h-28 items-end gap-2">{[["L",70],["M",82],["X",76],["J",88],["V",60],["S",35],["Hoy",78]].map(([day, height]) => <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><span className="w-full rounded-t-md bg-brand" style={{ height: `${height}%` }} /><small className="text-muted">{day}</small></div>)}</div></Card>
      <div className="mt-4 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Clases de hoy</h2><Link className="text-sm font-semibold text-brand" href="/manage/reservations">Ver todas</Link></div><div className="mt-3"><RowList rows={BUSINESS_SECTIONS.reservations.rows} onSelect={setSelected}/></div>
      <div className="mt-4 grid grid-cols-2 gap-2"><Button variant="secondary" onClick={() => setNotice("El registro de clientes requiere conexión al servicio.")}>Registrar cliente</Button><Button variant="secondary" onClick={() => setNotice("El registro de pagos requiere conexión al servicio.")}>Registrar pago</Button><Link href="/manage/attendance" className="flex min-h-[52px] items-center justify-center rounded-[14px] border border-line bg-surface px-3 text-center font-semibold">Ver asistencia</Link><Link href="/manage/reports" className="flex min-h-[52px] items-center justify-center rounded-[14px] border border-line bg-surface px-3 text-center font-semibold">Reportes</Link></div>
      {notice && <p role="status" className="mt-3 rounded-2xl bg-brand-soft p-3 text-sm text-brand">{notice}</p>}
      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Detalle de clase"}><p className="text-muted">{selected?.detail}</p><div className="mt-4 grid gap-2"><Button onClick={() => { setNotice("La lista de asistentes estará disponible al conectar el servicio."); setSelected(null); }}>Ver inscritos</Button><Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button></div></BottomSheet>
    </>;
  }
  return <>
    <PageHeading title={data.title} subtitle={data.subtitle}/>
    {section === "customers" && <>
      <input aria-label="Buscar cliente" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre" className="mb-3 h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-surface px-4" />
      <div className="mb-3 flex flex-wrap gap-2">{filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className="min-h-9 rounded-full border border-line bg-surface px-3 text-sm aria-pressed:border-brand aria-pressed:bg-brand-soft aria-pressed:text-brand">{item}</button>)}</div>
    </>}
    {section === "payments" && <><label className="mb-3 flex items-center gap-2 text-sm">Sucursal<select value={branch} onChange={(event) => setBranch(event.target.value)} className="h-11 flex-1 rounded-[14px] border border-line bg-surface px-3"><option>Todas</option><option>Centro</option><option>Polanco</option><option>Sur</option></select></label><div className="mb-3 grid grid-cols-2 gap-2"><Card><small className="text-muted">Cobrado en noviembre</small><b className="mt-1 block text-xl">$284,500</b></Card><Card><small className="text-muted">Por cobrar</small><b className="mt-1 block text-xl">$12,300</b></Card></div><div className="mb-3 flex gap-2"><Button className="flex-1" onClick={() => setActionOpen(true)}>Registrar pago</Button><Button variant="secondary" onClick={() => setNotice("La exportación usará el reporte de pagos cuando esté conectado el servicio.")}>Exportar</Button></div></>}
    {["attendance", "access", "reservations"].includes(section) && <label className="mb-3 flex items-center gap-2 text-sm">Sucursal<select value={branch} onChange={(event) => setBranch(event.target.value)} className="h-11 flex-1 rounded-[14px] border border-line bg-surface px-3"><option>Todas</option><option>Centro</option><option>Polanco</option><option>Sur</option></select></label>}
    {section === "attendance" && <div className="mb-3 grid grid-cols-2 gap-2"><Button onClick={() => setNotice("El escáner requiere habilitar cámara y validar el QR con el servicio.")}>Escanear QR</Button><Button variant="secondary" onClick={() => setActionOpen(true)}>Registro manual</Button></div>}
    {section === "reservations" && <Button className="mb-3 w-full" onClick={() => setActionOpen(true)}>Crear clase</Button>}
    {section === "access" && <><Card className="mb-3"><h2 className="font-semibold">Métodos habilitados</h2>{[["Código QR", "Incluido en todos los planes"], ["Huella", "Requiere lector compatible"], ["Reconocimiento facial", "Requiere cámara compatible"], ["Tarjeta o llavero", "Lector NFC o RFID"], ["Código numérico", "Cliente escribe su código"]].map(([name, hint], index) => <label key={name} className="flex min-h-12 items-center justify-between gap-2 border-b border-line text-sm last:border-0"><span>{name}<small className="block text-muted">{hint}</small></span><input type="checkbox" checked={switches[name] ?? index < 4} onChange={(event) => setSwitches({ ...switches, [name]: event.target.checked })}/></label>)}</Card><div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Dispositivos</h2><span className="text-sm text-muted">5 de 6</span></div><p className="mb-3 text-sm text-muted">El plan Pro permite hasta 6 dispositivos. Recepción puede probarlos; la eliminación requiere permiso de propietario.</p></>}
    {(section === "announcements" || section === "settings") && <Card className="mb-3">{(section === "announcements" ? ["Confirmación de reserva", "Recordatorio de clase", "Aviso de vencimiento", "Confirmación de pago", "Cambio de horario"] : ["Datos del negocio", "Zona horaria", "Color del portal", "Cancelar reserva hasta 2 horas antes", "Lista de espera", "Recordatorios de vencimiento"]).map((name) => <label key={name} className="flex min-h-12 items-center justify-between gap-2 border-b border-line text-sm last:border-0"><span>{name}{section === "settings" && <small className="block text-muted">{name === "Datos del negocio" ? "Gimnasio Titan" : name === "Zona horaria" ? "Ciudad de México (UTC−6)" : name === "Color del portal" ? "Violeta Tempo" : "Configurable por el negocio"}</small>}</span><input type="checkbox" checked={switches[name] ?? (!name.startsWith("Cambio") && !name.startsWith("Recordatorios de vencimiento"))} onChange={(event) => setSwitches({ ...switches, [name]: event.target.checked })} /></label>)}</Card>}
    {section === "access" && <Card className="mb-3">{["Validar membresía activa", "Pedir consentimiento biométrico"].map((name) => <label key={name} className="flex min-h-12 items-center justify-between border-b border-line text-sm last:border-0">{name}<input type="checkbox" checked={switches[name] ?? true} onChange={(event) => setSwitches({ ...switches, [name]: event.target.checked })} /></label>)}</Card>}
    {["customers", "memberships", "team", "branches", "announcements", "custom-fields", "reports", "settings", "access"].includes(section) && <Button variant={section === "customers" ? "primary" : "secondary"} className="mb-3 w-full" onClick={() => setActionOpen(true)}>{actionTitle}</Button>}
    <FeatureList rows={filtered} onSelect={setSelected}/>
    {section === "branches" && <div className="mt-3 grid gap-2">{[["Centro",84],["Polanco",62],["Sur",45]].map(([name, occupancy]) => <Card key={name}><div className="flex justify-between text-sm"><b>{name}</b><span>{occupancy}% de ocupación</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-soft"><span className="block h-full rounded-full bg-brand" style={{ width: `${occupancy}%` }}/></div></Card>)}</div>}
    {section === "reports" && <div className="mt-3 grid gap-2 sm:grid-cols-2">{["Renovaciones", "Ocupación de clases"].map((name) => <button key={name} type="button" onClick={() => setNotice(`El reporte “${name}” estará disponible al conectar analítica.`)} className="rounded-2xl border border-line bg-surface p-3 text-left font-semibold">{name}<small className="mt-1 block text-muted">Últimos 30 días · Abrir reporte →</small></button>)}</div>}
    {notice && <p role="status" className="mt-3 rounded-2xl bg-brand-soft p-3 text-sm text-brand">{notice}</p>}
    <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Detalle"}><p className="text-muted">{selected?.detail}</p><div className="mt-4 grid gap-2"><Button onClick={() => { setNotice(`Consultaste ${selected?.title}.`); setSelected(null); }}>Ver detalle</Button><Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button></div></BottomSheet>
    <BottomSheet open={actionOpen} onClose={() => setActionOpen(false)} title={actionTitle}>
      <p className="mb-3 text-sm text-muted">Completa los datos. El envío se habilitará al conectar el servicio del negocio.</p>
      <form onSubmit={(event) => { event.preventDefault(); setActionOpen(false); setNotice(`${actionTitle}: formulario preparado; falta conectar el servicio para guardar.`); }} className="grid gap-3">
        {(section === "customers" || section === "team") && <label className="grid gap-1 text-sm">{section === "customers" ? "Nombre completo" : "Correo electrónico"}<input required type={section === "team" ? "email" : "text"} placeholder={section === "customers" ? "Nombre y apellido" : "persona@correo.com"} className="h-12 rounded-[14px] border border-line bg-surface px-3"/></label>}
        {(section === "customers" || section === "team") && <label className="grid gap-1 text-sm">{section === "customers" ? "Correo electrónico" : "Rol"}<input required type={section === "customers" ? "email" : "text"} placeholder={section === "customers" ? "cliente@correo.com" : "Gerente, recepción o instructor"} className="h-12 rounded-[14px] border border-line bg-surface px-3"/></label>}
        {(section === "customers" || section === "memberships") && <label className="grid gap-1 text-sm">{section === "customers" ? "Membresía" : "Nombre del plan"}<select className="h-12 rounded-[14px] border border-line bg-surface px-3"><option>Mensual</option><option>Mensual Pro</option><option>Trimestral</option><option>Paquete 10 clases</option></select></label>}
        {(section === "payments" || section === "memberships" || section === "reservations") && <label className="grid gap-1 text-sm">{section === "reservations" ? "Nombre de la clase" : "Monto (MXN)"}<input required placeholder={section === "reservations" ? "Yoga" : "650"} className="h-12 rounded-[14px] border border-line bg-surface px-3"/></label>}
        {section === "payments" && <label className="grid gap-1 text-sm">Método<select className="h-12 rounded-[14px] border border-line bg-surface px-3"><option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option></select></label>}
        {section === "announcements" && <label className="grid gap-1 text-sm">Mensaje<textarea required rows={3} className="rounded-[14px] border border-line bg-surface p-3"/></label>}
        <Button type="submit">Continuar</Button>
      </form>
    </BottomSheet>
  </>;
}

