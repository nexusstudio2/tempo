"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import type { Branch } from "@/services/branches.service";
import {
  deactivateCustomer,
  listCustomerAttendance,
  listCustomerMemberships,
  listCustomerPayments,
} from "@/services/customers.service";
import { customerBadge, formatDate, formatMoney, membershipLabel } from "./labels";
import type { Customer } from "./types";

type Props = { customer: Customer | null; branches: Branch[]; onClose: () => void; onDone: (message: string) => void };

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line py-2.5">
      <span className="text-muted">{k}</span>
      <b className="text-right font-semibold">{v}</b>
    </div>
  );
}

export function CustomerSheet({ customer, branches, onClose, onDone }: Props) {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const id = customer?.id ?? "";
  const enabled = !!customer;
  const memberships = useQuery({ queryKey: ["customer", id, "memberships"], queryFn: () => listCustomerMemberships(id), enabled });
  const payments = useQuery({ queryKey: ["customer", id, "payments"], queryFn: () => listCustomerPayments(id), enabled });
  const attendance = useQuery({ queryKey: ["customer", id, "attendance"], queryFn: () => listCustomerAttendance(id), enabled });

  const deactivate = useMutation({
    mutationFn: () => deactivateCustomer(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers"] });
      setConfirm(false);
      onDone(`${customer?.fullName} se dio de baja. Su historial se conserva.`);
    },
  });

  function close() {
    setConfirm(false);
    deactivate.reset();
    onClose();
  }

  const badge = customer ? customerBadge(customer) : null;
  const branch = branches.find((b) => b.id === customer?.branchId)?.name;

  return (
    <BottomSheet open={!!customer} onClose={close} title={customer?.fullName ?? "Cliente"}>
      {customer && badge && (
        <>
          <div className="mb-1">
            <StatusPill tone={badge.tone}>{badge.label}</StatusPill>
          </div>
          <Row k="Correo" v={customer.email ?? "—"} />
          <Row k="Teléfono" v={customer.phone ?? "—"} />
          <Row k="Sucursal" v={branch ?? "—"} />
          <Row k="Alta" v={formatDate(customer.createdAt)} />

          <h3 className="mb-1 mt-5 font-display text-lg font-semibold">Membresías</h3>
          {memberships.isLoading && <p className="text-muted">Cargando…</p>}
          {memberships.data?.items.length === 0 && <p className="text-muted">Sin membresías.</p>}
          {memberships.data?.items.map((m) => (
            <Row
              key={m.id}
              k={m.planName}
              v={
                <>
                  {membershipLabel(m.status).label}
                  {m.endsAt ? ` · vence ${formatDate(m.endsAt)}` : ""}
                </>
              }
            />
          ))}

          <h3 className="mb-1 mt-5 font-display text-lg font-semibold">Pagos</h3>
          {payments.data?.items.length === 0 && <p className="text-muted">Sin pagos.</p>}
          {payments.data?.items.map((p) => (
            <Row key={p.id} k={`${p.concept} · ${formatDate(p.createdAt)}`} v={formatMoney(p.amount.amount, p.amount.currency)} />
          ))}

          <h3 className="mb-1 mt-5 font-display text-lg font-semibold">Asistencia</h3>
          {attendance.data?.items.length === 0 && <p className="text-muted">Sin asistencias.</p>}
          {attendance.data?.items.map((a) => (
            <Row key={a.id} k={formatDate(a.checkedInAt)} v={a.result === "ACCEPTED" ? "Entró" : "Rechazada"} />
          ))}

          {deactivate.isError && (
            <p role="alert" className="mt-3 text-sm text-danger">
              No pudimos dar de baja al cliente. Inténtalo de nuevo.
            </p>
          )}
          <div className="mt-5 grid gap-2">
            {customer.status !== "INACTIVE" &&
              (confirm ? (
                <>
                  <p className="text-sm text-muted">
                    Dar de baja no borra su historial, pero deja de aparecer como cliente activo.
                  </p>
                  <Button variant="danger" onClick={() => deactivate.mutate()} disabled={deactivate.isPending}>
                    {deactivate.isPending ? "Dando de baja…" : "Confirmar baja"}
                  </Button>
                </>
              ) : (
                <Button variant="danger" onClick={() => setConfirm(true)}>
                  Dar de baja
                </Button>
              ))}
            <Button variant="secondary" onClick={close}>
              Cerrar
            </Button>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
