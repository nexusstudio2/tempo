"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BottomNav, type NavItem } from "@/components/ui/bottom-nav";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { LogoMark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BranchFilterProvider } from "@/features/branches/branch-filter";
import { roleLabels } from "@/features/contexts/types";
import { useActiveContext } from "@/hooks/use-active-context";
import { listBranches } from "@/services/branches.service";

const MAIN = [
  { label: "Inicio", icon: "⌂", href: "/manage/dashboard" },
  { label: "Clientes", icon: "☺", href: "/manage/customers" },
  { label: "Pagos", icon: "$", href: "/manage/payments" },
  { label: "Asistencia", icon: "✓", href: "/manage/attendance" },
];

const MORE = [
  ["Membresías", "memberships"],
  ["Accesos", "access"],
  ["Reservas", "reservations"],
  ["Equipo", "team"],
  ["Sucursales", "branches"],
  ["Anuncios", "announcements"],
  ["Campos personalizados", "custom-fields"],
  ["Reportes", "reports"],
  ["Ajustes", "settings"],
] as const;

export function ManageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  const [branchId, setBranchId] = useState<string | null>(null);
  const { data: ctx } = useActiveContext();
  const { data: branches } = useQuery({ queryKey: ["branches"], queryFn: listBranches });

  const moreActive = !MAIN.some((m) => pathname.startsWith(m.href));
  const items: NavItem[] = [...MAIN, { label: "Más", icon: "≡", onClick: () => setMore(true), active: moreActive }];

  return (
    <BranchFilterProvider value={{ branchId, setBranchId }}>
      <header className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-line bg-bg px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-ink" role="img" aria-label="Tempo">
          <LogoMark className="h-[34px] w-[34px]" />
          <span aria-hidden="true" className="font-display text-[22px] font-semibold">
            tempo
          </span>
        </span>
        <Link
          href="/select-context"
          aria-label="Cambiar de espacio"
          className="ml-auto flex min-h-11 min-w-0 flex-col justify-center rounded-xl border border-line bg-surface px-2.5 text-left text-[13px] leading-tight"
        >
          <b className="truncate font-semibold">{ctx ? ctx.tenantName : "…"}</b>
          <span className="text-muted">{ctx ? roleLabels[ctx.role] : ""}</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-[1100px] px-4 pb-28 pt-2">
        {branches && branches.length > 1 && (
          <div className="mt-3 flex items-center gap-2">
            <label htmlFor="branch-filter" className="text-sm font-medium">
              Sucursal
            </label>
            <select
              id="branch-filter"
              value={branchId ?? ""}
              onChange={(e) => setBranchId(e.target.value || null)}
              className="h-11 rounded-[14px] border-[1.5px] border-line bg-surface px-3"
            >
              <option value="">Todas</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {children}
      </main>
      <BottomNav items={items} />
      <BottomSheet open={more} onClose={() => setMore(false)} title="Más secciones">
        <ul className="grid gap-2">
          {MORE.map(([label, slug]) => (
            <li key={slug}>
              <Link
                href={`/manage/${slug}`}
                onClick={() => setMore(false)}
                className="flex min-h-14 items-center justify-between rounded-2xl border border-line bg-surface px-3.5 font-semibold"
              >
                {label}
                <span aria-hidden="true" className="text-xl text-muted">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </BranchFilterProvider>
  );
}
