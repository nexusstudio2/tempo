import { describe, expect, it } from "vitest";
import { mockContexts } from "@/features/contexts/mock";
import { contextSchema } from "@/features/contexts/types";

describe("contexto", () => {
  it("los datos simulados cumplen el esquema del contrato", () => {
    for (const ctx of mockContexts) expect(() => contextSchema.parse(ctx)).not.toThrow();
  });

  it("rechaza un rol que no existe", () => {
    expect(() => contextSchema.parse({ ...mockContexts[0], role: "ROOT" })).toThrow();
  });
});
