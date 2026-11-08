import type { components } from "@/lib/api-types";

export const mockBranches: Array<components["schemas"]["Branch"]> = [
  { id: "10000000-0000-4000-8000-000000000001", name: "Centro", address: "Av. Juárez 120", phone: null, status: "ACTIVE", createdAt: "2025-01-10T00:00:00.000Z" },
  { id: "10000000-0000-4000-8000-000000000002", name: "Polanco", address: "Horacio 410", phone: null, status: "ACTIVE", createdAt: "2025-03-02T00:00:00.000Z" },
  { id: "10000000-0000-4000-8000-000000000003", name: "Sur", address: "Insurgentes 3000", phone: null, status: "ACTIVE", createdAt: "2025-05-20T00:00:00.000Z" },
];
