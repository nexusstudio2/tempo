"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function AcceptInvitationPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Usa al menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError(null);
    setAccepted(true);
  }

  return <AuthShell>
    <h1 className="mb-2 font-display text-[30px] font-semibold leading-tight tracking-tight">{accepted ? "Invitación lista" : "Acepta tu invitación"}</h1>
    {accepted ? <><p role="status" className="mb-6 text-muted">La invitación quedó validada en esta vista de demostración. Para crear la cuenta y asignar permisos, falta conectar el servicio de invitaciones.</p><Link href="/login" className="flex min-h-[54px] items-center justify-center rounded-[14px] bg-brand px-4 font-semibold text-white">Volver al inicio de sesión</Link></> : <>
      <p className="mb-5 text-muted"><b>Gimnasio Titan</b> te invitó como Cliente. La invitación caduca el 12 de noviembre.</p>
      <form onSubmit={submit} noValidate>
        <Field label="Crea tu contraseña" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={password} onChange={(event) => setPassword(event.target.value)} />
        <Field label="Repite tu contraseña" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} error={error ?? undefined} />
        <Button type="submit" className="min-h-[54px]">Crear contraseña y entrar</Button>
      </form>
      <Link href="/login" className="mt-3 flex min-h-12 items-center justify-center rounded-[14px] border border-line bg-surface font-semibold">Volver</Link>
    </>}
  </AuthShell>;
}
