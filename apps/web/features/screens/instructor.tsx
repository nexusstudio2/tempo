"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav, type NavItem } from "@/components/ui/bottom-nav";
import { DemoFrame, FeatureList, PageHeading, RowList, type Row } from "@/features/screens/common";

const INSTRUCTOR_NAV: NavItem[] = [
  { label: "Hoy", icon: "▣", href: "/instructor/today" }, { label: "Clases", icon: "♫", href: "/instructor/classes" },
  { label: "Alumnos", icon: "☺", href: "/instructor/students" }, { label: "Horario", icon: "▤", href: "/instructor/schedule" },
];
const INSTRUCTOR_STUDENTS: Row[] = [
  { title: "Valeria Soto", detail: "Salsa Nivel 1 · 92% asistencia · Mejoró el giro doble. Practicar tiempos.", status: "Activa", tone: "ok" },
  { title: "Jorge Ibarra", detail: "Salsa Nivel 1 · 85% asistencia", status: "Activa", tone: "ok" },
  { title: "Camila Ruiz", detail: "Salsa Nivel 1 · 78% asistencia · Quiere pasar a Nivel 2.", status: "Por vencer", tone: "warn" },
  { title: "Héctor Mena", detail: "Salsa Nivel 1 · 60% asistencia", status: "Vencida", tone: "danger" },
  { title: "Daniela Vega", detail: "Salsa Nivel 1 · 96% asistencia · Candidata a la presentación de diciembre.", status: "Activa", tone: "ok" },
  { title: "Iván Cortés", detail: "Bachata Intermedio · 88% asistencia", status: "Activa", tone: "ok" },
];
const INSTRUCTOR_SCHEDULE: { day: string; classes: { time: string; name: string; room: string }[] }[] = [
  { day: "Lunes", classes: [{ time: "18:00", name: "Salsa Nivel 1", room: "Salón A" }, { time: "19:30", name: "Bachata Intermedio", room: "Salón A" }] },
  { day: "Martes", classes: [{ time: "16:30", name: "Salsa Nivel 2", room: "Salón B" }] },
  { day: "Miércoles", classes: [{ time: "18:00", name: "Salsa Nivel 1", room: "Salón A" }, { time: "19:30", name: "Bachata Intermedio", room: "Salón A" }] },
  { day: "Jueves", classes: [{ time: "16:30", name: "Salsa Nivel 2", room: "Salón B" }] },
  { day: "Sábado", classes: [{ time: "10:00", name: "Ritmos Kids", room: "Salón A" }] },
];
const INSTRUCTOR_GROUPS: Row[] = [
  { title: "Salsa Nivel 1", detail: "Lun y mié 18:00 · 14 alumnos" },
  { title: "Salsa Nivel 2", detail: "Mar y jue 16:30 · 14 alumnos" },
  { title: "Bachata Intermedio", detail: "Lun y mié 19:30 · 12 alumnos" },
  { title: "Ritmos Kids", detail: "Sáb 10:00 · 9 alumnos" },
];
const INSTRUCTOR_CLASSES: Row[] = [
  { title: "Salsa Nivel 2", detail: "16:30 · Salón B · 14/16 lugares · Salsa · Nivel 2", status: "Terminada", tone: "ok" },
  { title: "Salsa Nivel 1", detail: "18:00 · Salón A · 14/16 lugares · Salsa · Nivel 1", status: "Próxima", tone: "warn" },
  { title: "Bachata Intermedio", detail: "19:30 · Salón A · 12/12 · 2 en espera", status: "Próxima", tone: "warn" },
];
export function InstructorPage({ section = "today" }: { section?: string }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const data = section === "classes" ? { title: "Clases y grupos", subtitle: "Los grupos que tienes asignados", rows: INSTRUCTOR_GROUPS } : section === "students" ? { title: "Alumnos", subtitle: "Solo los de tus grupos", rows: INSTRUCTOR_STUDENTS } : section === "schedule" ? { title: "Horario", subtitle: "Tus clases de la semana", rows: [] as Row[] } : null;
  const rows = useMemo(() => data?.rows.filter((row) => `${row.title} ${row.detail}`.toLowerCase().includes(search.toLowerCase())) ?? [], [data, search]);
  return <DemoFrame title="Academia Dance · Instructor" nav={INSTRUCTOR_NAV}>
    {data ? <><PageHeading title={data.title} subtitle={data.subtitle}/>{section === "students" && <><input aria-label="Buscar alumno" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar alumno" className="mb-3 h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-surface px-4"/><p className="mb-3 text-sm text-muted">Ves si la membresía está al corriente. Los pagos los gestiona recepción.</p></>}{section === "schedule" ? <>{INSTRUCTOR_SCHEDULE.map((day) => <section key={day.day} className="mb-4"><h2 className="mb-2 font-display text-lg font-semibold">{day.day}</h2><Card className="divide-y divide-line">{day.classes.map((classItem) => <div key={`${classItem.time}-${classItem.name}`} className="flex items-center gap-3 py-3"><span className="grid h-10 w-12 place-items-center rounded-xl bg-brand-soft text-xs font-semibold text-brand">{classItem.time}</span><span><b className="block">{classItem.name}</b><small className="text-muted">{classItem.room}</small></span></div>)}</Card></section>)}<Button variant="secondary" className="w-full" onClick={() => setNotice("Solicitud enviada al gerente (demostración).")}>Solicitar cambio de horario</Button></> : <RowList rows={rows} onSelect={section === "students" || section === "classes" ? setSelected : undefined}/>}</> : <>
      <PageHeading title="Hola, Mariana" subtitle="Tu jornada de hoy"/>
      <Card className="border-brand bg-brand text-white"><small> Siguiente clase · en 1 h 20 min</small><h2 className="mt-2 font-display text-2xl font-semibold">Salsa Nivel 1</h2><p className="mt-1">18:00 · Salón A · 14 de 16 lugares</p><Button variant="secondary" className="mt-4" onClick={() => setSelected({ title: "Pasar lista · Salsa Nivel 1", detail: "Marca la asistencia de tus alumnos." })}>Pasar lista</Button></Card>
      <div className="mt-3 grid grid-cols-3 gap-2">{[["Clases hoy", "3"], ["Alumnos hoy", "40"], ["Asistencia semanal", "87%"]].map(([label, value]) => <Card key={label}><small className="text-muted">{label}</small><b className="mt-1 block text-xl">{value}</b></Card>)}</div>
    <div className="mt-5 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Clases de hoy</h2><Link href="/instructor/classes" className="text-sm font-semibold text-brand">Ver clases</Link></div><div className="mt-3"><RowList rows={INSTRUCTOR_CLASSES} onSelect={(row) => setSelected({ ...row, detail: row.detail })}/></div>
    </>}
    {notice && <p role="status" className="mt-3 rounded-2xl bg-ok-soft p-3 text-ok">{notice}</p>}
    <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? "Detalle"}>
      <p className="mb-3 text-muted">{selected?.detail}</p>{section === "students" && selected ? <><Card><p className="text-sm text-muted">Estado de membresía</p><b>{selected.status}</b><label className="mt-3 grid gap-1 text-sm">Nivel actual<select defaultValue="Nivel 1" className="h-11 rounded-xl border border-line bg-surface px-3"><option>Principiante</option><option>Nivel 1</option><option>Intermedio</option><option>Nivel 2</option></select></label><label className="mt-3 grid gap-1 text-sm">Nota para seguimiento<textarea value={studentNotes[selected.title] ?? selected.detail.split(" · ").slice(2).join(" · ")} onChange={(event) => setStudentNotes({ ...studentNotes, [selected.title]: event.target.value })} rows={3} className="rounded-xl border border-line bg-surface p-3" placeholder="Anota avances o puntos a practicar"/></label></Card><div className="mt-3 grid gap-2"><Button onClick={() => { setNotice("La nota quedó guardada en esta sesión de demostración."); setSelected(null); }}>Guardar seguimiento</Button><Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button></div></> : <>{INSTRUCTOR_STUDENTS.slice(0, 5).map((student) => <div key={student.title} className="flex items-center justify-between border-b border-line py-3"><span><b className="block">{student.title}</b><small className="text-muted">{student.status}{student.tone === "danger" ? " · avisa a recepción" : student.tone === "warn" ? " · vence en 2 días" : ""}</small></span><span className="flex gap-1"><button type="button" aria-label={`${student.title}: vino`} aria-pressed={attendance[student.title] === "vino"} onClick={() => setAttendance({ ...attendance, [student.title]: attendance[student.title] === "vino" ? "" : "vino" })} className="rounded-lg border border-line px-2 py-1 aria-pressed:bg-ok-soft">Vino</button><button type="button" aria-label={`${student.title}: faltó`} aria-pressed={attendance[student.title] === "faltó"} onClick={() => setAttendance({ ...attendance, [student.title]: attendance[student.title] === "faltó" ? "" : "faltó" })} className="rounded-lg border border-line px-2 py-1 aria-pressed:bg-danger-soft">Faltó</button></span></div>)}<p className="mt-3 text-sm text-muted">{Object.values(attendance).filter((value) => value === "vino").length} presentes · {Object.values(attendance).filter((value) => value === "faltó").length} faltas · {INSTRUCTOR_STUDENTS.length - Object.keys(attendance).length} sin marcar</p><div className="mt-4 grid gap-2"><Button variant="secondary" onClick={() => setNotice("El escáner de QR requiere cámara y validación del servicio.")}>Escanear QR de un alumno</Button><Button onClick={() => { setNotice("La lista quedó guardada en esta sesión de demostración."); setSelected(null); }}>Guardar lista</Button><Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button></div></>}
    </BottomSheet>
  </DemoFrame>;
}

