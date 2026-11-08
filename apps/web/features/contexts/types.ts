import { z } from "zod";
import type { components } from "@/lib/api-types";

// Los tipos salen del contrato (contracts/openapi). Si cambia, `npm run api:types`
// regenera lib/api-types.ts y `npm run typecheck` avisa dónde hay que ajustar.
export type Role = components["schemas"]["Role"];
export type TempoContext = components["schemas"]["Context"];

export const roleSchema = z.enum([
  "SUPER_ADMIN",
  "BUSINESS_OWNER",
  "BUSINESS_ADMIN",
  "MANAGER",
  "RECEPTIONIST",
  "INSTRUCTOR",
  "CUSTOMER",
]) satisfies z.ZodType<Role>;

// `satisfies` hace que el compilador falle si este esquema deja de coincidir con el contrato.
export const contextSchema = z.object({
  id: z.string(),
  tenantName: z.string(),
  branchName: z.string().nullable(),
  role: roleSchema,
  permissions: z.array(z.string()).optional(),
}) satisfies z.ZodType<TempoContext>;

export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Superadministrador",
  BUSINESS_OWNER: "Propietario",
  BUSINESS_ADMIN: "Administrador",
  MANAGER: "Gerente",
  RECEPTIONIST: "Recepción",
  INSTRUCTOR: "Instructor",
  CUSTOMER: "Cliente",
};
