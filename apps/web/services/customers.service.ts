import { apiFetch } from "@/lib/api-client";
import { env } from "@/lib/env";
import {
  attendancePageSchema,
  customerPageSchema,
  customerSchema,
  membershipPageSchema,
  paymentPageSchema,
  type AttendancePage,
  type Customer,
  type CustomerCreate,
  type CustomerPage,
  type ListCustomersParams,
  type MembershipPage,
  type PaymentPage,
} from "@/features/customers/types";
import {
  mockCreateCustomer,
  mockDeactivateCustomer,
  mockGetCustomer,
  mockListAttendance,
  mockListCustomers,
  mockListMemberships,
  mockListPayments,
} from "./customers.mock";

function query(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function listCustomers(p: ListCustomersParams = {}): Promise<CustomerPage> {
  if (env.useMocks) return mockListCustomers(p);
  return apiFetch(`/customers${query({ ...p })}`, customerPageSchema);
}

export function getCustomer(id: string): Promise<Customer> {
  if (env.useMocks) return mockGetCustomer(id);
  return apiFetch(`/customers/${id}`, customerSchema);
}

/** `idempotencyKey` evita crear dos veces al cliente si la persona toca el botón dos veces o se reintenta. */
export function createCustomer(body: CustomerCreate, idempotencyKey: string): Promise<Customer> {
  if (env.useMocks) return mockCreateCustomer(body);
  return apiFetch("/customers", customerSchema, { method: "POST", body, idempotencyKey });
}

export async function deactivateCustomer(id: string): Promise<void> {
  if (env.useMocks) return mockDeactivateCustomer(id);
  await fetchNoContent(`/customers/${id}`);
}

export function listCustomerMemberships(id: string): Promise<MembershipPage> {
  if (env.useMocks) return mockListMemberships(id);
  return apiFetch(`/customers/${id}/memberships`, membershipPageSchema);
}

export function listCustomerPayments(id: string): Promise<PaymentPage> {
  if (env.useMocks) return mockListPayments(id);
  return apiFetch(`/customers/${id}/payments`, paymentPageSchema);
}

export function listCustomerAttendance(id: string): Promise<AttendancePage> {
  if (env.useMocks) return mockListAttendance(id);
  return apiFetch(`/customers/${id}/attendance`, attendancePageSchema);
}

// DELETE responde 204 sin cuerpo, así que no pasa por apiFetch (que valida un JSON).
async function fetchNoContent(path: string): Promise<void> {
  const { ApiError } = await import("@/lib/api-client");
  const correlationId = crypto.randomUUID();
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "X-Correlation-Id": correlationId },
  });
  if (!res.ok) {
    let payload: { code?: string; message?: string } | null = null;
    try {
      payload = await res.json();
    } catch {
      /* sin cuerpo */
    }
    throw new ApiError(res.status, payload?.code ?? "unknown", payload?.message ?? res.statusText, correlationId);
  }
}
