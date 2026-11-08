"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function Page() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Escribe un correo válido, por ejemplo nombre@correo.com.");
      return;
    }
    setError(null);
    setSent(true);
  }
  return <AuthShell>
    <h1 className="mb-2 font-display text-[30px] font-semibold leading-tight tracking-tight">{sent ? "Revisa tu correo" : "Recupera tu contraseña"}</h1>
    {sent ? <><p role="status" className="mb-6 text-muted">La vista de confirmación está lista. Para enviar el enlace real y controlar su vencimiento, falta conectar el servicio de recuperación de Koaliado.</p><Link href="/login" className="flex min-h-[54px] items-center justify-center rounded-[14px] bg-brand px-4 font-semibold text-white">Volver a iniciar sesión</Link></> : <>
      <p className="mb-6 text-muted">Te enviaremos un enlace que caduca en 30 minutos.</p>
      <form onSubmit={submit} noValidate><Field label="Correo electrónico" type="email" autoComplete="email" inputMode="email" placeholder="nombre@correo.com" value={email} onChange={(event) => setEmail(event.target.value)} error={error ?? undefined}/><Button type="submit" className="mt-2 min-h-[54px]">Enviar enlace</Button></form>
      <Link href="/login" className="mt-3 flex min-h-12 items-center justify-center rounded-[14px] border border-line bg-surface font-semibold">Volver a iniciar sesión</Link>
    </>}
  </AuthShell>;
}
