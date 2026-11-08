"use client";

import Link from "next/link";
import { BottomNav, type NavItem } from "@/components/ui/bottom-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogoMark } from "@/components/ui/logo";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type Row = { title: string; detail: string; status?: string; tone?: "ok" | "warn" | "danger" };

const pillClass = { ok: "bg-ok-soft text-ok", warn: "bg-warn-soft text-warn", danger: "bg-danger-soft text-danger" };

function Status({ row }: { row: Row }) {
  if (!row.status) return null;
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${pillClass[row.tone ?? "ok"]}`}>{row.status}</span>;
}

export function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return <><h1 className="mb-1 mt-3 font-display text-[26px] font-semibold tracking-tight">{title}</h1><p className="mb-4 text-muted">{subtitle}</p></>;
}

export function RowList({ rows, onSelect }: { rows: Row[]; onSelect?: (row: Row) => void }) {
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

export function DemoFrame({ title, children, nav, contextHref = "/select-context", includeNav = true, includeHeader = true, headerAddon }: { title: string; children: React.ReactNode; nav: NavItem[]; contextHref?: string; includeNav?: boolean; includeHeader?: boolean; headerAddon?: React.ReactNode }) {
  return <div className="min-h-screen bg-bg text-ink">
    {includeHeader && <header className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-line bg-bg px-4 py-2.5">
      <LogoMark className="h-[34px] w-[34px]"/><span className="font-display text-[22px] font-semibold">tempo</span>
      <Link href={contextHref} aria-label="Cambiar de espacio" className="ml-auto truncate text-sm text-muted">{title}</Link>{headerAddon}<ThemeToggle/>
    </header>}
    <main className="mx-auto max-w-[1100px] px-4 pb-28 pt-2">{children}</main>
    {includeNav && <BottomNav items={nav}/>}
  </div>;
}

export function FeatureList({ rows, onSelect }: { rows: Row[]; onSelect?: (row: Row) => void }) {
  if (rows.length === 0) return <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">No hay resultados para este filtro.</p>;
  return <RowList rows={rows} onSelect={onSelect}/>;
}

