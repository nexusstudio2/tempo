import { z } from "zod";
import { apiFetch } from "@/lib/api-client";
import { env } from "@/lib/env";
import { mockContexts } from "@/features/contexts/mock";
import { contextSchema, type TempoContext } from "@/features/contexts/types";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ACTIVE_KEY = "tempo.activeContextId"; // solo un id de contexto, nunca un token

export async function login(email: string, password: string): Promise<void> {
  if (env.useMocks) {
    await wait(400);
    if (!email || !password) throw new Error("Credenciales incompletas");
    return;
  }
  // Real: Cognito (Authorization Code + PKCE) detrás de un BFF. Sin tokens en el navegador.
  // Navegación completa a un endpoint del backend (BFF), no a una página de Next.js.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/api/auth/login");
}

export async function getContexts(): Promise<TempoContext[]> {
  if (env.useMocks) {
    await wait(200);
    return mockContexts;
  }
  return apiFetch("/contexts", z.array(contextSchema));
}

export async function switchContext(contextId: string): Promise<TempoContext> {
  if (env.useMocks) {
    const ctx = mockContexts.find((c) => c.id === contextId);
    if (!ctx) throw new Error("Contexto no autorizado");
    try {
      sessionStorage.setItem(ACTIVE_KEY, contextId);
    } catch {
      /* almacenamiento no disponible */
    }
    return ctx;
  }
  // El backend valida la pertenencia y fija el contexto activo (spec 5.3).
  return apiFetch("/contexts/switch", contextSchema, { method: "POST", body: { contextId } });
}

export async function getActiveContext(): Promise<TempoContext> {
  if (env.useMocks) {
    let id: string | null = null;
    try {
      id = sessionStorage.getItem(ACTIVE_KEY);
    } catch {
      /* almacenamiento no disponible */
    }
    return mockContexts.find((c) => c.id === id) ?? mockContexts[1];
  }
  return apiFetch("/contexts/active", contextSchema);
}
