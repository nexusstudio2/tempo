"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav, type NavItem } from "@/components/ui/bottom-nav";
import { DemoFrame, FeatureList, PageHeading, RowList, type Row } from "@/features/screens/common";

const RECEPTION_NAV: NavItem[] = [
  { label: "Recepción", icon: "▣", href: "/reception/home" }, { label: "Clientes", icon: "☺", href: "/reception/customers" },
  { label: "Pagos", icon: "$", href: "/reception/payments" }, { label: "Asistencia", icon: "✓", href: "/reception/attendance" },
  { label: "Accesos", icon: "⚙", href: "/reception/access" },
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
const RECEPTION_DEVICES: Row[] = [
  { title: "Lector de QR", detail: "Cámara de recepción · Centro · Hace 2 min", status: "En línea", tone: "ok" },
  { title: "Lector de huellas", detail: "ZKTeco · Puerta principal · Hace 5 min", status: "En línea", tone: "ok" },
  { title: "Reconocimiento facial", detail: "Hikvision · Torniquete · Desde las 06:40", status: "Sin conexión", tone: "danger" },
  { title: "Lector de tarjetas", detail: "RFID 13.56 MHz · Vestidores · Sin probar", status: "Sin probar", tone: "warn" },
];
const RECEPTION_METHODS = ["Código QR", "Huella", "Rostro", "Tarjeta", "Código"];
const RECEPTION_ACCESS_STATES = [true, true, true, true, false];

export function ReceptionPage({ section = "reception" }: { section?: string }) {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("Código QR");
  const [methodEnabled, setMethodEnabled] = useState<boolean[]>(RECEPTION_ACCESS_STATES);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [manualCustomer, setManualCustomer] = useState<Row | null>(null);
  const [accessResult, setAccessResult] = useState(false);
  const [switches, setSwitches] = useState<Record<string, boolean>>({ "Validar membresía activa": true, "Evitar entradas repetidas": true, "Permitir registro manual": true });
  const data = RECEPTION_PAGES[section];
  const title = data?.title ?? "Recepción";
  const rows = useMemo(() => (section === "access" ? RECEPTION_DEVICES : data?.rows ?? []).filter((row) => `${row.title} ${row.detail}`.toLowerCase().includes(search.toLowerCase())), [data, search, section]);
  const methods = RECEPTION_METHODS;
  return <DemoFrame title="Gimnasio Titan · Centro · Recepción" nav={RECEPTION_NAV}>
    {data ? <><PageHeading title={title} subtitle={data.subtitle}/>{section === "customers" && <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar cliente" placeholder="Buscar por nombre" className="mb-3 h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-surface px-4"/>}{section === "payments" && <><Button className="mb-3 w-full" onClick={() => setPaymentOpen(true)}>Registrar pago</Button><p className="mb-3 text-sm text-muted">Los reembolsos los autoriza un gerente o el propietario.</p></>}{section === "access" && <p className="mb-3 text-sm text-muted">Todos los métodos validan la membresía en el servidor y registran la asistencia igual que el QR.</p>}{section === "attendance" && <div className="mb-3 grid grid-cols-2 gap-2"><Card><small className="text-muted">Entradas hoy</small><b className="mt-1 block text-xl">3</b></Card><Card><small className="text-muted">Rechazadas</small><b className="mt-1 block text-xl">1</b></Card></div>}<RowList rows={rows} onSelect={section === "customers" || section === "access" ? setSelected : undefined}/>{section === "access" && <><Button variant="secondary" className="mt-3 w-full" onClick={() => setDeviceOpen(true)}>Agregar dispositivo</Button><Card className="mt-3"><h2 className="mb-2 font-semibold">Reglas de validación</h2>{Object.entries(switches).map(([label, enabled]) => <label key={label} className="flex min-h-12 items-center justify-between border-b border-line text-sm last:border-0">{label}<input type="checkbox" checked={enabled} onChange={(event) => setSwitches({ ...switches, [label]: event.target.checked })}/></label>)}</Card></>}</> : <>
      <PageHeading title="Recepción" subtitle="Sucursal Centro · Control de entrada"/>
      <Card><p className="font-semibold">Método de acceso</p><div role="radiogroup" aria-label="Método de acceso" className="mt-3 flex flex-wrap gap-2">{methods.map((m, index) => <button key={m} type="button" role="radio" aria-checked={method === m} disabled={!methodEnabled[index]} onClick={() => setMethod(m)} className="min-h-10 rounded-full border border-line bg-surface px-3 text-sm disabled:opacity-40 aria-checked:border-brand aria-checked:bg-brand-soft aria-checked:text-brand">{m}</button>)}</div>{method === "Código" ? <div className="mt-4"><label htmlFor="access-code" className="mb-1 block text-sm font-medium">Código del cliente</label><input id="access-code" inputMode="numeric" placeholder="Escribe el código" className="h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-surface px-4"/><Button className="mt-2" onClick={() => setAccessResult(true)}>Validar código</Button></div> : <button type="button" onClick={() => { setManualCustomer(null); setAccessResult(true); }} className="mt-4 grid min-h-48 w-full place-items-center rounded-2xl border-2 border-dashed border-brand bg-brand-soft p-4 text-center"><span><b aria-hidden="true" className="block font-display text-4xl">{method === "Código QR" ? "▦" : method === "Huella" ? "☝" : method === "Rostro" ? "☺" : "▭"}</b><b className="mt-2 block">{method === "Código QR" ? "Escanear QR del cliente" : `Iniciar ${method}`}</b><small className="text-muted">La lectura del dispositivo se habilitará al conectar el servicio.</small></span></button>}
        <div className="mt-3 grid grid-cols-2 gap-2"><Button variant="secondary" onClick={() => setManualOpen(true)}>Registro manual</Button><Link href="/reception/customers" className="flex min-h-[52px] items-center justify-center rounded-[14px] border border-line bg-surface px-3 text-center font-semibold">Buscar cliente</Link></div>
      </Card>
      {notice && <p role="status" className="mt-3 rounded-2xl bg-brand-soft p-3 text-sm text-brand">{notice}</p>}
      <Card className="mt-3 border-danger bg-danger-soft"><b className="text-danger">Dispositivo sin conexión</b><p className="mt-1 text-sm text-danger">Reconocimiento facial · Torniquete · Desde las 06:40</p><Link href="/reception/access" className="mt-2 inline-block font-semibold text-brand">Revisar equipo →</Link></Card><div className="mt-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Entradas recientes</h2><Link href="/reception/attendance" className="text-sm font-semibold text-brand">Ver todas</Link></div><div className="mt-3"><RowList rows={RECEPTION_PAGES.attendance.rows.slice(0,3)}/></div>
    </>}
    {notice && data && <p role="status" className="mt-3 rounded-2xl bg-brand-soft p-3 text-sm text-brand">{notice}</p>}
    <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Detalle"}><p className="text-muted">{selected?.detail}</p><div className="mt-4 grid gap-2"><Button onClick={() => { setNotice(section === "customers" ? `La entrada de ${selected?.title} requiere validación del servidor.` : "La prueba del dispositivo requiere conexión con el servicio."); setSelected(null); }}> {section === "customers" ? "Registrar entrada" : "Probar conexión"}</Button>{section === "customers" && <Button variant="secondary" onClick={() => { setNotice("El cobro de renovación estará disponible al conectar pagos."); setSelected(null); }}>Cobrar renovación</Button>}<Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button></div></BottomSheet>
    <BottomSheet open={manualOpen} onClose={() => setManualOpen(false)} title="Registro manual"><p className="mb-3 text-muted">Busca y selecciona al cliente para revisar su membresía.</p><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente" aria-label="Buscar cliente" className="mb-3 h-12 w-full rounded-[14px] border border-line bg-surface px-3"/><div className="grid gap-2">{RECEPTION_PAGES.customers.rows.filter((row) => row.title.toLowerCase().includes(search.toLowerCase())).map((row) => <button key={row.title} type="button" onClick={() => { setManualCustomer(row); setManualOpen(false); setAccessResult(true); }} className="flex min-h-14 items-center justify-between rounded-xl border border-line bg-surface px-3 text-left"><span><b className="block">{row.title}</b><small className="text-muted">{row.detail}</small></span><span className="text-muted">›</span></button>)}</div></BottomSheet>
    <BottomSheet open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Registrar pago"><p className="mb-3 text-sm text-muted">El pago se mostrará como una vista previa; su registro real requiere el servicio de pagos.</p><form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); setPaymentOpen(false); setNotice("Pago preparado. La persistencia requiere conectar el servicio de pagos."); }}><label className="grid gap-1 text-sm">Cliente<select required className="h-12 rounded-xl border border-line bg-surface px-3"><option value="">Selecciona un cliente</option>{RECEPTION_PAGES.customers.rows.map((row) => <option key={row.title}>{row.title}</option>)}</select></label><label className="grid gap-1 text-sm">Concepto<input required defaultValue="Mensualidad" className="h-12 rounded-xl border border-line bg-surface px-3"/></label><label className="grid gap-1 text-sm">Monto (MXN)<input required type="number" min="1" placeholder="650" className="h-12 rounded-xl border border-line bg-surface px-3"/></label><label className="grid gap-1 text-sm">Método<select className="h-12 rounded-xl border border-line bg-surface px-3"><option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option></select></label><Button type="submit">Continuar</Button></form></BottomSheet>
    <BottomSheet open={deviceOpen} onClose={() => setDeviceOpen(false)} title="Agregar dispositivo"><form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); setDeviceOpen(false); setNotice("Dispositivo preparado. Su alta requiere permisos del administrador y conexión del servicio."); }}><label className="grid gap-1 text-sm">Nombre<input required placeholder="Lector de QR" className="h-12 rounded-xl border border-line bg-surface px-3"/></label><label className="grid gap-1 text-sm">Tipo<select className="h-12 rounded-xl border border-line bg-surface px-3"><option>Cámara / QR</option><option>Huella</option><option>Reconocimiento facial</option><option>Tarjeta RFID</option></select></label><label className="grid gap-1 text-sm">Ubicación<input required placeholder="Puerta principal" className="h-12 rounded-xl border border-line bg-surface px-3"/></label><Button type="submit">Preparar dispositivo</Button></form></BottomSheet>
    <BottomSheet open={accessResult} onClose={() => setAccessResult(false)} title="Vista previa del acceso"><div className="py-4 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ok-soft text-3xl text-ok">✓</span><h3 className="mt-3 font-display text-xl font-semibold">Acceso permitido</h3><b className="mt-2 block">{manualCustomer?.title ?? "Ana Torres"}</b><p className="mt-1 text-sm text-muted">{manualCustomer?.detail ?? "Mensual Pro · Activa"} · Método: {manualCustomer ? "Manual" : method}</p><p className="mt-2 text-sm text-muted">Esta respuesta es una vista previa. El registro real requiere validar y guardar desde el servicio.</p></div><Button onClick={() => setAccessResult(false)}>Cerrar vista previa</Button></BottomSheet>
  </DemoFrame>;
}

