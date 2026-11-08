"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { routeForRole } from "@/features/contexts/routes";
import { roleLabels, type TempoContext } from "@/features/contexts/types";
import { getContexts, switchContext } from "@/services/auth.service";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function SelectContextPage() {
  const [error, setError] = useState<string | null>(null);
  const autoSelecting = useRef(false);
  const { data, isLoading, isError } = useQuery({ queryKey: ["contexts"], queryFn: getContexts });

  const choose = useCallback(async (ctx: TempoContext) => {
    setError(null);
    try {
      // El backend valida la pertenencia; la interfaz solo navega después.
      const active = await switchContext(ctx.id);
      window.location.replace(routeForRole(active.role));
    } catch {
      autoSelecting.current = false;
      setError("No pudimos abrir ese espacio. Inténtalo de nuevo.");
    }
  }, []);

  useEffect(() => {
    if (data?.length === 1 && !autoSelecting.current) {
      autoSelecting.current = true;
      void choose(data[0]);
    }
  }, [data, choose]);

  return (
    <AuthShell>
      <h1 className="mb-2 font-display text-[30px] font-semibold leading-tight tracking-tight">¿Dónde quieres entrar?</h1>
      <p className="mb-6 text-muted">
        Tu cuenta tiene más de un espacio. Puedes cambiar de uno a otro sin volver a iniciar sesión.
      </p>
      {isLoading && <p className="text-muted">Cargando tus espacios…</p>}
      {isError && <p role="alert" className="text-danger">No pudimos cargar tus espacios.</p>}
      {error && <p role="alert" className="mb-3 text-danger">{error}</p>}
      <ul className="grid gap-2.5">
        {data?.map((ctx) => (
          <li key={ctx.id}>
            <button
              type="button"
              onClick={() => choose(ctx)}
              className="flex min-h-[68px] w-full items-center gap-3.5 rounded-2xl border-[1.5px] border-line bg-surface p-3.5 text-left hover:border-brand"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft font-display text-lg font-semibold text-brand">
                {initials(ctx.tenantName)}
              </span>
              <span>
                <b className="block font-semibold">
                  {ctx.tenantName}
                  {ctx.branchName ? ` · ${ctx.branchName}` : ""}
                </b>
                <small className="text-muted">{roleLabels[ctx.role]}</small>
              </span>
              <span aria-hidden="true" className="ml-auto text-xl text-muted">›</span>
            </button>
          </li>
        ))}
      </ul>
    </AuthShell>
  );
}
