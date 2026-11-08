import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api-client";
import {
  mockCreateCustomer,
  mockDeactivateCustomer,
  mockGetCustomer,
  mockListCustomers,
  resetCustomers,
} from "@/services/customers.mock";
import { customerPageSchema } from "@/features/customers/types";

beforeEach(() => resetCustomers());

describe("clientes simulados (se comportan como el contrato)", () => {
  it("pagina por cursor sin repetir clientes", async () => {
    const first = await mockListCustomers({ limit: 10 });
    expect(first.items).toHaveLength(10);
    expect(first.nextCursor).not.toBeNull();
    const second = await mockListCustomers({ limit: 10, cursor: first.nextCursor! });
    const ids = new Set(first.items.map((c) => c.id));
    expect(second.items.every((c) => !ids.has(c.id))).toBe(true);
  });

  it("la última página no trae cursor", async () => {
    const all = await mockListCustomers({ limit: 100 });
    expect(all.nextCursor).toBeNull();
    expect(() => customerPageSchema.parse(all)).not.toThrow();
  });

  it("filtra por estado de membresía y busca sin acentos", async () => {
    const expired = await mockListCustomers({ membershipStatus: "EXPIRED", limit: 100 });
    expect(expired.items.length).toBeGreaterThan(0);
    expect(expired.items.every((c) => c.membershipStatus === "EXPIRED")).toBe(true);
    const found = await mockListCustomers({ q: "hector", limit: 100 });
    expect(found.items.length).toBeGreaterThan(0);
  });

  it("rechaza un correo repetido con 409", async () => {
    await mockCreateCustomer({ fullName: "Persona Uno", email: "uno@correo.com", sendInvitation: true });
    await expect(mockCreateCustomer({ fullName: "Otra Persona", email: "UNO@correo.com", sendInvitation: true })).rejects.toMatchObject({
      status: 409,
      code: "customer_email_taken",
    });
    await expect(mockCreateCustomer({ fullName: "Otra Persona", email: "uno@correo.com", sendInvitation: true })).rejects.toBeInstanceOf(ApiError);
  });

  it("un cliente nuevo con correo queda invitado y aparece primero", async () => {
    const c = await mockCreateCustomer({ fullName: "Nueva Persona", email: "nueva@correo.com", sendInvitation: true });
    expect(c.status).toBe("INVITED");
    const page = await mockListCustomers({ limit: 5 });
    expect(page.items[0].id).toBe(c.id);
  });

  it("la baja es lógica: el cliente sigue existiendo", async () => {
    const [c] = (await mockListCustomers({ limit: 1 })).items;
    await mockDeactivateCustomer(c.id);
    expect((await mockGetCustomer(c.id)).status).toBe("INACTIVE");
  });

  it("un cliente inexistente responde 404", async () => {
    await expect(mockGetCustomer("no-existe")).rejects.toMatchObject({ status: 404 });
  });
});
