"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/auth.service";
import { Card } from "@/components/ui/card";
import { type NavItem } from "@/components/ui/bottom-nav";
import { DemoFrame, PageHeading, RowList, type Row } from "@/features/screens/common";

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
    { title: "Historial de asistencia", detail: "24 visitas este año", status: "Ver", tone: "ok" },
    { title: "Información del establecimiento", detail: "Horarios, sucursales y contacto", status: "Ver", tone: "ok" },
  ] },
};
const CUSTOMER_CLASSES = [
  { title: "Spinning", day: "Hoy", time: "18:00", coach: "Coach Iván", capacity: 20, reserved: 18 },
  { title: "Funcional", day: "Hoy", time: "19:00", coach: "Coach Sara", capacity: 20, reserved: 20 },
  { title: "Yoga", day: "Mañana", time: "07:30", coach: "Coach Mía", capacity: 15, reserved: 9 },
  { title: "Boxeo", day: "Mañana", time: "18:30", coach: "Coach Leo", capacity: 16, reserved: 12 },
  { title: "Spinning", day: "Sábado", time: "09:00", coach: "Coach Iván", capacity: 20, reserved: 14 },
];

function CustomerNotifications() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const items = [
    ["Tu membresía vence el 18 de noviembre", "Renueva con tiempo para no perder acceso · Hoy"],
    ["Cambio de horario: Yoga de mañana", "Ahora es a las 07:30 · Ayer"],
    ["Pago aprobado", "Mensual Pro · $890 · 18 oct"],
  ];
  return <>
    <button type="button" aria-label={unread ? "Notificaciones, 2 sin leer" : "Notificaciones"} onClick={() => { setOpen(true); setUnread(false); }} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-lg">
      <span aria-hidden="true">🔔</span>{unread && <span aria-hidden="true" className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand"/>}
    </button>
    <BottomSheet open={open} onClose={() => setOpen(false)} title="Notificaciones">
      <ul className="grid gap-2">{items.map(([title, detail]) => <li key={title}><div className="rounded-2xl border border-line bg-surface px-3.5 py-3"><b className="block">{title}</b><small className="text-muted">{detail}</small></div></li>)}</ul>
      <Button variant="secondary" className="mt-3 w-full" onClick={() => setOpen(false)}>Cerrar</Button>
    </BottomSheet>
  </>;
}

export function CustomerPage({ section = "home" }: { section?: string }) {
  const [selected, setSelected] = useState<Row | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reservationTab, setReservationTab] = useState<"available" | "mine">("available");
  const [reserved, setReserved] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({ "Recordatorios de clase": true, "Avisos de vencimiento": true, "Notificaciones push": false });
  const [qrSeed, setQrSeed] = useState(1);
  const [qrSeconds, setQrSeconds] = useState(60);
  const data = CUSTOMER_PAGES[section];
  const selectedClass = selected && CUSTOMER_CLASSES.find((entry) => entry.title === selected.title && selected.detail.includes(entry.time));
  const selectedReservationKey = selectedClass ? selectedClass.title + selectedClass.day + selectedClass.time : "";
  const selectedIsReserved = selectedReservationKey ? reserved.includes(selectedReservationKey) : false;
  useEffect(() => {
    if (section !== "qr") return;
    const interval = window.setInterval(() => {
      setQrSeconds((seconds) => {
        if (seconds <= 1) {
          setQrSeed((seed) => seed + 1);
          return 60;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [section]);
  return <DemoFrame title="Gimnasio Titan · Cliente" nav={CUSTOMER_NAV} headerAddon={<CustomerNotifications />}>
    {section === "qr" ? <><PageHeading title="Mi código QR" subtitle="Muéstralo en recepción para entrar"/><Card className="mx-auto grid max-w-sm justify-items-center py-8"><div aria-label="Código QR visual de demostración" className="grid h-52 w-52 grid-cols-11 gap-0.5 rounded-lg bg-white p-2">{Array.from({ length: 121 }, (_, i) => <span key={`${qrSeed}-${i}`} className={((i * 7 + Math.floor(i / 3) + qrSeed * 5) % 7 < 3 || (i % 11 < 4 && (Math.floor(i / 11) < 4 || Math.floor(i / 11) > 6))) ? "bg-neutral-900" : "bg-white"}/>)}</div><b className="mt-4">Ana Torres</b><small className="text-muted">Mensual Pro · activa</small><div className="mt-4 w-full"><div className="h-1.5 overflow-hidden rounded-full bg-brand-soft"><span className="block h-full bg-brand transition-all" style={{ width: `${(qrSeconds / 60) * 100}%` }}/></div><small className="mt-1 block text-center text-muted">Se renueva en {qrSeconds} s</small></div><Button className="mt-4" variant="secondary" onClick={() => setNotice("Para escanear el QR del establecimiento, conecta la cámara y el validador de acceso.")}>Escanear QR del establecimiento</Button></Card><p className="mx-auto mt-3 max-w-sm text-center text-sm text-muted">Código visual de demostración; el acceso real debe validarse en el servicio del gimnasio.</p></> : section === "reservations" ? <>
      <PageHeading title="Reservas" subtitle="Cancela hasta 2 horas antes sin penalización"/>
      <div className="mb-4 grid grid-cols-2 rounded-2xl border border-line bg-surface p-1">{([["available", "Clases disponibles"], ["mine", "Mis reservas"]] as const).map(([key, label]) => <button key={key} type="button" aria-pressed={reservationTab === key} onClick={() => setReservationTab(key)} className="min-h-10 rounded-xl px-2 text-sm font-medium aria-pressed:bg-brand-soft aria-pressed:text-brand">{label}</button>)}</div>
      {(reservationTab === "available" ? ["Hoy", "Mañana", "Sábado"] : ["Mis próximas reservas"]).map((day) => { const classes = CUSTOMER_CLASSES.filter((item) => reservationTab === "mine" ? reserved.includes(item.title + item.day + item.time) : item.day === day); return <section key={day} className="mb-4"><h2 className="mb-2 font-display text-lg font-semibold">{day}</h2><div className="grid gap-2">{classes.length ? classes.map((item) => { const key = item.title + item.day + item.time; const isReserved = reserved.includes(key); return <button key={key} type="button" onClick={() => setSelected({ title: item.title, detail: `${item.day} · ${item.time} · ${item.coach} · ${item.reserved} de ${item.capacity} lugares${isReserved ? " · Reservada" : ""}` })} className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-surface px-3 text-left"><span className="grid h-10 w-12 place-items-center rounded-xl bg-brand-soft text-xs font-semibold text-brand">{item.time}</span><span className="min-w-0 flex-1"><b className="block">{item.title}</b><small className="text-muted">{item.day} · {item.coach}</small></span><span className="text-xs text-muted">{isReserved ? "Reservada" : item.reserved >= item.capacity ? "Lleno" : `${item.capacity - item.reserved} lugares`}</span></button>; }) : <p className="text-sm text-muted">Aún no tienes reservas. Elige una clase en Clases disponibles.</p>}</div></section>; })}
    </> : data ? <><PageHeading title={data.title} subtitle={data.subtitle}/><RowList rows={data.rows} onSelect={setSelected}/>{section === "profile" && <><Card className="mt-4 px-4 py-1">{[["Recordatorios de clase", "1 hora antes"], ["Avisos de vencimiento", "3 días antes"], ["Notificaciones push", "En este dispositivo"]].map(([label, detail]) => <label key={label} className="flex min-h-14 items-center justify-between gap-2 border-b border-line text-sm last:border-0"><span>{label}<small className="block text-muted">{detail}</small></span><input type="checkbox" checked={notifications[label]} onChange={(event) => setNotifications({ ...notifications, [label]: event.target.checked })}/></label>)}</Card><Button variant="secondary" className="mt-3 w-full" onClick={() => { void logout().catch(() => setNotice("No se pudo cerrar la sesión. Inténtalo de nuevo.")); }}>Cerrar sesión</Button></>}</> : <>
      <PageHeading title="Hola, Ana" subtitle="Qué bueno verte hoy"/>
      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-line bg-surface p-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft font-semibold text-brand">GT</span><span><b className="block">Gimnasio Titan</b><small className="text-muted">Sucursal Centro · abierto hasta las 22:00</small></span></div>
      <Card className="border-brand bg-brand text-white"><small>Tu membresía</small><h2 className="mt-1 font-display text-2xl font-semibold">Mensual Pro</h2><p className="mt-1">Activa · Vence el 18 de noviembre</p><div className="mt-4 flex gap-2"><Link href="/me/qr" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-white px-4 font-semibold text-brand">Mostrar mi QR</Link><Link href="/me/reservations" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/50 px-3 text-center font-semibold text-white">Reservar clase</Link></div></Card>
      <div className="mt-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Próximas clases</h2><Link href="/me/reservations" className="text-sm font-semibold text-brand">Ver reservas</Link></div><div className="mt-3"><RowList rows={CUSTOMER_PAGES.reservations.rows.slice(0,3)} onSelect={setSelected}/></div>
      <Card className="mt-4"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft font-display text-xl font-semibold text-brand">7</span><div><h2 className="font-semibold">días seguidos</h2><small className="text-muted">Meta del mes: 9 de 12 visitas</small></div></div><div className="mt-3 flex gap-2" aria-label="Últimos siete días">{["L","M","X","J","V","S","D"].map((day) => <span key={day} className="grid h-8 flex-1 place-items-center rounded-full bg-ok-soft text-xs font-semibold text-ok">✓</span>)}</div></Card>
      <h2 className="mb-2 mt-5 font-display text-xl font-semibold">Anuncios</h2><div className="grid gap-2"><Card><b>Cerrado el 20 de noviembre</b><small className="mt-1 block text-muted">Por mantenimiento, abrimos el 21 a las 6:00.</small></Card><Card><b>Nueva clase de boxeo</b><small className="mt-1 block text-muted">Martes y jueves 18:30. Ya puedes reservar.</small></Card></div>
      <Card className="mt-4"><h2 className="font-semibold">Actividad reciente</h2><p className="mt-1 text-sm text-muted">Hoy 07:02 · Entrada en Centro · QR</p><p className="text-sm text-muted">Pago aprobado · Mensual Pro · $890</p></Card>
    </>}
    {notice && <p role="status" className="mt-3 rounded-2xl bg-ok-soft p-3 text-ok">{notice}</p>}
    <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Detalle"}>
      <p className="text-muted">{selected?.detail}</p>
      {section === "profile" && selected?.title === "Historial de asistencia" && <div className="mt-3 grid gap-2">{[["Hoy · 07:02", "Entrada en Centro · QR"], ["Ayer · 18:10", "Entrada en Centro · QR"], ["Lun · 07:15", "Entrada en Polanco · Manual"]].map(([date, detail]) => <div key={date} className="rounded-xl border border-line bg-surface p-3"><b className="block">{date}</b><small className="text-muted">{detail}</small></div>)}</div>}
      {section === "profile" && selected?.title === "Información del establecimiento" && <div className="mt-3 grid gap-2">{[["Centro", "Av. Juárez 120"], ["Polanco", "Horacio 410"], ["Sur", "Insurgentes 3000"], ["Horario", "Lun a vie 6:00–22:00 · Sáb 8:00–14:00"]].map(([label, detail]) => <div key={label} className="flex justify-between gap-3 border-b border-line py-2"><span className="text-muted">{label}</span><b className="text-right">{detail}</b></div>)}</div>}
      {section === "payments" && <p className="mt-3 text-sm text-muted">Comprobante interno de Tempo, no es una factura fiscal (CFDI).</p>}
      <div className="mt-4 grid gap-2">
        {section === "reservations" && selectedClass && <Button onClick={() => { setReserved(selectedIsReserved ? reserved.filter((value) => value !== selectedReservationKey) : [...reserved, selectedReservationKey]); setNotice(selectedIsReserved ? "Reserva cancelada en esta demostración." : selectedClass.reserved >= selectedClass.capacity ? "Te agregamos a la lista de espera de demostración." : "Reserva registrada en esta demostración."); setSelected(null); }}>{selectedIsReserved ? "Cancelar reserva" : selectedClass.reserved >= selectedClass.capacity ? "Unirme a lista de espera" : "Reservar lugar"}</Button>}
        {section === "payments" && <Button variant="secondary" onClick={() => setNotice("La descarga del comprobante estará disponible al conectar pagos.")}>Descargar comprobante</Button>}
        <Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button>
      </div>
    </BottomSheet>
  </DemoFrame>;
}
