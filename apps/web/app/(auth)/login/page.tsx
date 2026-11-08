"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { AuthShell } from "@/components/layout/auth-shell";
import { login } from "@/services/auth.service";

const schema = z.object({
  email: z.string().email("Escribe un correo válido, por ejemplo nombre@correo.com."),
  password: z.string().min(1, "Escribe tu contraseña."),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setFormError(null);
    try {
      await login(values.email, values.password);
      router.push("/select-context");
    } catch {
      setFormError("No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.");
    }
  }

  return (
    <AuthShell>
      <h1 className="mb-2 font-display text-[30px] font-semibold leading-tight tracking-tight">Inicia sesión</h1>
      <p className="mb-6 text-muted">Un solo acceso para administradores, personal y clientes.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
        <Button type="submit" disabled={isSubmitting} className="min-h-[54px]">
          {isSubmitting ? "Verificando…" : "Entrar"}
        </Button>
      </form>
      <p className="mt-6 text-center text-[13px] text-muted">
        ¿Aún no tienes acceso? Tu establecimiento te enviará una invitación por correo.
      </p>
    </AuthShell>
  );
}
