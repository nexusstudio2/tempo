"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { ApiError } from "@/lib/api-client";
import type { Branch } from "@/services/branches.service";
import { createCustomer } from "@/services/customers.service";
import type { CustomerCreate } from "./types";

const schema = z
  .object({
    fullName: z.string().trim().min(1, "Escribe el nombre completo.").max(150, "Usa máximo 150 caracteres."),
    email: z.string().trim().email("Escribe un correo válido, por ejemplo nombre@correo.com.").or(z.literal("")),
    phone: z.string().trim().max(30, "Usa máximo 30 caracteres."),
    branchId: z.string(),
    sendInvitation: z.boolean(),
  })
  .refine((v) => !v.sendInvitation || v.email !== "", { path: ["email"], message: "Para enviar la invitación necesitas un correo." });
type Values = z.infer<typeof schema>;

const empty: Values = { fullName: "", email: "", phone: "", branchId: "", sendInvitation: true };

type Props = { open: boolean; branches: Branch[]; onClose: () => void; onDone: (message: string) => void };

export function CustomerFormSheet({ open, branches, onClose, onDone }: Props) {
  const qc = useQueryClient();
  const attempt = useRef(crypto.randomUUID()); // misma clave si se reintenta el mismo envío
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) reset(empty);
  }, [open, reset]);

  const create = useMutation({
    mutationFn: (values: Values) => {
      const body: CustomerCreate = {
        fullName: values.fullName,
        sendInvitation: values.sendInvitation,
        ...(values.email ? { email: values.email } : {}),
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.branchId ? { branchId: values.branchId } : {}),
      };
      return createCustomer(body, attempt.current);
    },
    onSuccess: async (c) => {
      attempt.current = crypto.randomUUID();
      await qc.invalidateQueries({ queryKey: ["customers"] });
      onDone(`${c.fullName} quedó registrado${c.status === "INVITED" ? " y se envió la invitación" : ""}.`);
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 409) {
        setError("email", { message: "Ya existe un cliente con ese correo." });
      }
    },
  });

  const generic = create.isError && !(create.error instanceof ApiError && create.error.status === 409);

  return (
    <BottomSheet open={open} onClose={onClose} title="Nuevo cliente">
      <p className="mb-4 text-muted">Si agregas su correo, le enviaremos una invitación para entrar a su portal.</p>
      <form onSubmit={handleSubmit((v) => create.mutate(v))} noValidate>
        <Field label="Nombre completo" autoComplete="off" error={errors.fullName?.message} {...register("fullName")} />
        <Field label="Correo electrónico" type="email" inputMode="email" autoComplete="off" error={errors.email?.message} {...register("email")} />
        <Field label="Teléfono" type="tel" inputMode="tel" autoComplete="off" error={errors.phone?.message} {...register("phone")} />
        {branches.length > 0 && (
          <SelectField label="Sucursal" {...register("branchId")}>
            <option value="">Sin sucursal</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </SelectField>
        )}
        <label className="mb-5 flex min-h-11 items-center gap-2.5">
          <input type="checkbox" className="h-5 w-5 accent-[var(--br)]" {...register("sendInvitation")} />
          Enviar invitación al portal
        </label>
        {generic && (
          <p role="alert" className="mb-3 text-sm text-danger">
            No pudimos registrar al cliente. Inténtalo de nuevo.
          </p>
        )}
        <div className="grid gap-2">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Registrando…" : "Registrar cliente"}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
