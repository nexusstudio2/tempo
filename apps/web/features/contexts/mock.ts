import type { TempoContext } from "./types";

// Contextos de demostración aislados por rol/establecimiento; los ids son UUID del contrato.
export const mockContexts: TempoContext[] = [
  { id: "0b6f1a52-7c1e-4a0d-9d3b-100000000001", tenantName: "Koaliado", branchName: null, role: "SUPER_ADMIN" },
  { id: "0b6f1a52-7c1e-4a0d-9d3b-100000000002", tenantName: "Gimnasio Titan", branchName: null, role: "BUSINESS_OWNER" },
  { id: "0b6f1a52-7c1e-4a0d-9d3b-100000000003", tenantName: "Gimnasio Titan", branchName: "Centro", role: "RECEPTIONIST" },
  { id: "0b6f1a52-7c1e-4a0d-9d3b-100000000004", tenantName: "Academia Dance", branchName: null, role: "INSTRUCTOR" },
  { id: "0b6f1a52-7c1e-4a0d-9d3b-100000000005", tenantName: "Gimnasio Titan", branchName: null, role: "CUSTOMER" },
];
