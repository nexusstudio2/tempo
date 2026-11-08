"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { AuthShell } from "@/components/layout/auth-shell";
import { login } from "@/services/auth.service";
import { env } from "@/lib/env";
import { routeForRole } from "@/features/contexts/routes";

const schema = z.object({
  email: z.string().email("Escribe un correo válido, por ejemplo nombre@correo.com."),
  password: z.string().min(1, "Escribe tu contraseña."),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  return <Suspense fallback={<AuthShell><p className="text-muted">Cargando…</p></AuthShell>}><LoginContent /></Suspense>;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    searchParams.has("error") ? "No fue posible iniciar sesión. Inténtalo de nuevo o contacta a soporte." : null,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setFormError(null);
    try {
      const contexts = await login(values.email, values.password);
      if (!contexts) return;
      if (contexts.length === 1) {
        setIsNavigating(true);
        router.replace(routeForRole(contexts[0].role));
      } else if (contexts.length > 1) {
        setIsNavigating(true);
        router.replace("/select-context");
      } else {
        setFormError("Esta cuenta no tiene espacios asignados. Contacta a Koaliado.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message.trim() : "";
      setFormError(message || "Correo o contraseña incorrectos. Inténtalo de nuevo.");
    }
  }

  return (
    <AuthShell>
      <h1 className="mb-2 font-display text-[30px] font-semibold leading-tight tracking-tight">Inicia sesión</h1>
      <p className="mb-6 text-muted">Un solo acceso para administradores, personal y clientes.</p>

      {env.useMocks ? <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field
          label="Correo electrónico"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="nombre@correo.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="relative">
          <Field
            label="Contraseña"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-1.5 top-[30px] h-11 px-3 font-medium text-brand"
          >
            {show ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <div className="-mt-1 mb-5 text-right">
          <Link href="/forgot-password" className="py-2 text-sm font-medium text-brand">
            Olvidé mi contraseña
          </Link>
        </div>
        {formError && (
          <p role="alert" className="mb-3 text-sm text-danger">
            {formError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting || isNavigating} className="min-h-[54px]">
          {isNavigating ? "Abriendo tu espacio…" : isSubmitting ? "Verificando…" : "Entrar"}
        </Button>
      </form> : <>
        {formError && <p role="alert" className="mb-3 text-sm text-danger">{formError}</p>}
        <Link href="/api/auth/login" className="flex min-h-[54px] items-center justify-center rounded-xl bg-brand px-4 font-semibold text-white">
          Continuar con Koaliado
        </Link>
      </>}
      <p className="mt-6 text-center text-[13px] text-muted">
        ¿Aún no tienes acceso? Tu establecimiento te enviará una invitación por correo.
      </p>
      <Link href="/accept-invitation" className="mt-2 flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface text-sm font-semibold">
        Ya tengo una invitación
      </Link>
    </AuthShell>
  );
}
