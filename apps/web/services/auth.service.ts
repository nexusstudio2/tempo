import { z } from "zod";
import { apiFetch } from "@/lib/api-client";
import { env } from "@/lib/env";
import { notifySessionChanged } from "@/lib/session-events";
import { contextSchema, type TempoContext } from "@/features/contexts/types";

export async function login(email: string, password: string): Promise<TempoContext[] | null> {
  if (env.useMocks) {
    const response = await fetch("/api/auth/mock/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "same-origin",
    });
    const result = await response.json() as { contexts?: unknown; message?: string };
    if (!response.ok) throw new Error(result.message ?? "Correo o contraseña incorrectos.");
    const contexts = z.array(contextSchema).parse(result.contexts);
    notifySessionChanged();
    return contexts;
  }
  // Real: Cognito (Authorization Code + PKCE) detrás de un BFF. Sin tokens en el navegador.
  // Navegación completa a un endpoint del backend (BFF), no a una página de Next.js.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/api/auth/login");
  return null;
}

export async function logout(): Promise<void> {
  if (env.useMocks) {
    const response = await fetch("/api/auth/mock/logout", { method: "POST", credentials: "same-origin" });
    if (!response.ok) throw new Error("No se pudo cerrar la sesión.");
    notifySessionChanged();
    window.location.reload();
    return;
  }
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/auth/logout";
  document.body.append(form);
  form.submit();
}

export async function getContexts(): Promise<TempoContext[]> {
  if (env.useMocks) {
    const response = await fetch("/api/auth/mock/session", { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) throw new Error("La sesión demo terminó. Inicia sesión de nuevo.");
    const result = await response.json() as { contexts?: unknown };
    return z.array(contextSchema).parse(result.contexts);
  }
  return apiFetch("/contexts", z.array(contextSchema));
}

export async function switchContext(contextId: string): Promise<TempoContext> {
  if (env.useMocks) {
    const response = await fetch("/api/auth/mock/context", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contextId }),
    });
    const result = await response.json() as { message?: string };
    if (!response.ok) throw new Error(result.message ?? "No tienes acceso a ese espacio.");
    const context = contextSchema.parse(result);
    notifySessionChanged();
    return context;
  }
  // El backend valida la pertenencia y fija el contexto activo (spec 5.3).
  return apiFetch("/contexts/switch", contextSchema, { method: "POST", body: { contextId } });
}

export async function getActiveContext(): Promise<TempoContext> {
  if (env.useMocks) {
    const response = await fetch("/api/auth/mock/session", { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) throw new Error("La sesión demo terminó. Inicia sesión de nuevo.");
    const result = await response.json() as { activeContext?: unknown };
    return contextSchema.parse(result.activeContext);
  }
  return apiFetch("/contexts/active", contextSchema);
}
