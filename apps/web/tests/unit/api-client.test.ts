import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api-client";

afterEach(() => vi.restoreAllMocks());

describe("apiFetch", () => {
  it("envía Correlation ID e Idempotency-Key y valida la respuesta", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const data = await apiFetch("/x", z.object({ ok: z.boolean() }), { method: "POST", body: {}, idempotencyKey: "k1" });
    expect(data.ok).toBe(true);
    const headers = (spy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["X-Correlation-Id"]).toBeTruthy();
    expect(headers["Idempotency-Key"]).toBe("k1");
  });

  it("convierte un error HTTP en ApiError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "forbidden", message: "Sin permiso" }), { status: 403 }),
    );
    await expect(apiFetch("/x", z.object({}))).rejects.toMatchObject({ status: 403, code: "forbidden" });
    await expect(apiFetch("/x", z.object({}))).rejects.toBeInstanceOf(ApiError);
  });
});
