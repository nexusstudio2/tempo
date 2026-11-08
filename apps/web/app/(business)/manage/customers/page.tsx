"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { useBranchFilter } from "@/features/branches/branch-filter";
import { CustomerFormSheet } from "@/features/customers/customer-form-sheet";
import { CustomerSheet } from "@/features/customers/customer-sheet";
import { customerBadge, formatDate, initials } from "@/features/customers/labels";
import type { Customer, MembershipStatus } from "@/features/customers/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { listBranches } from "@/services/branches.service";
import { listCustomers } from "@/services/customers.service";

const CHIPS: Array<{ label: string; value: MembershipStatus | null }> = [
  { label: "Todos", value: null },
  { label: "Activa", value: "ACTIVE" },
  { label: "Pendiente", value: "PENDING" },
  { label: "Vencida", value: "EXPIRED" },
  { label: "Suspendida", value: "SUSPENDED" },
];

export default function CustomersPage() {
  const { branchId } = useBranchFilter();
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim());
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: listBranches });
  const query = useInfiniteQuery({
    queryKey: ["customers", { q, membershipStatus, branchId }],
    queryFn: ({ pageParam }) =>
      listCustomers({
        q: q || undefined,
        membershipStatus: membershipStatus ?? undefined,
        branchId: branchId ?? undefined,
        sort: "-createdAt",
        limit: 20,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div>
      <h1 className="mb-1 mt-3 font-display text-[26px] font-semibold tracking-tight">Clientes</h1>
      <p className="mb-4 text-muted">Consulta y registra a las personas de tu negocio.</p>

      <div className="mb-3 flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, correo o teléfono"
          aria-label="Buscar cliente"
          className="h-[52px] min-w-0 flex-1 rounded-[14px] border-[1.5px] border-line bg-surface px-4 text-base"
        />
        <Button full={false} onClick={() => setCreating(true)}>
          Nuevo cliente
        </Button>
      </div>

      <div className="mb-3 flex gap-1.5 overflow-x-auto" role="group" aria-label="Filtrar por membresía">
        {CHIPS.map((c) => (
          <button
            key={c.label}
            type="button"
            aria-pressed={membershipStatus === c.value}
            onClick={() => setMembershipStatus(c.value)}
            className="min-h-10 shrink-0 rounded-full border border-line bg-surface px-3.5 text-sm aria-pressed:border-brand aria-pressed:bg-brand-soft aria-pressed:font-semibold aria-pressed:text-brand"
          >
            {c.label}
          </button>
        ))}
      </div>

      {notice && (
        <p role="status" className="mb-3 rounded-2xl bg-ok-soft px-3.5 py-3 font-medium text-ok">
          {notice}
        </p>
      )}

      {query.isLoading && <p className="text-muted">Cargando clientes…</p>}
      {query.isError && (
        <div role="alert" className="grid gap-2">
          <p className="text-danger">No pudimos cargar los clientes.</p>
          <Button variant="secondary" full={false} onClick={() => query.refetch()}>
            Reintentar
          </Button>
        </div>
      )}
      {query.isSuccess && items.length === 0 && (
        <p className="text-muted">No hay clientes con esos filtros. Cambia la búsqueda o registra uno nuevo.</p>
      )}

      <ul className="grid gap-2.5">
        {items.map((c) => {
          const badge = customerBadge(c);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelected(c)}
                className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 text-left"
              >
                <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-brand-soft font-display font-semibold text-brand">
                  {initials(c.fullName)}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate font-semibold">{c.fullName}</b>
                  <small className="text-muted">
                    {c.membershipEndsAt ? `Vence ${formatDate(c.membershipEndsAt)}` : (c.email ?? "Sin correo")}
                  </small>
                </span>
                <StatusPill tone={badge.tone}>{badge.label}</StatusPill>
              </button>
            </li>
          );
        })}
      </ul>

      {query.hasNextPage && (
        <Button variant="secondary" className="mt-4" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
          {query.isFetchingNextPage ? "Cargando…" : "Cargar más"}
        </Button>
      )}

      <CustomerSheet
        customer={selected}
        branches={branches}
        onClose={() => setSelected(null)}
        onDone={(m) => {
          setSelected(null);
          setNotice(m);
        }}
      />
      <CustomerFormSheet
        open={creating}
        branches={branches}
        onClose={() => setCreating(false)}
        onDone={(m) => {
          setCreating(false);
          setNotice(m);
        }}
      />
    </div>
  );
}
