import type { ZodType } from "zod";
import { env } from "./env";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public correlationId: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Options = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Para operaciones críticas (pagos, reservas): evita duplicar el efecto al reintentar. */
  idempotencyKey?: string;
};

/**
 * Llama a /api/v1 con cookies de sesión (HttpOnly), Correlation ID y validación de la respuesta.
 * El frontend nunca confirma por sí solo un pago ni un permiso: la fuente de verdad es el backend.
 */
export async function apiFetch<T>(path: string, schema: ZodType<T>, options: Options = {}): Promise<T> {
  const { body, idempotencyKey, headers, ...rest } = options;
  const correlationId = crypto.randomUUID();
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Correlation-Id": correlationId,
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    let payload: { code?: string; message?: string } | null = null;
    try {
      payload = await res.json();
    } catch {
      /* respuesta sin cuerpo */
    }
    throw new ApiError(res.status, payload?.code ?? "unknown", payload?.message ?? res.statusText, correlationId);
  }
  return schema.parse(await res.json());
}
