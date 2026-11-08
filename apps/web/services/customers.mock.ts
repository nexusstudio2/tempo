import { ApiError } from "@/lib/api-client";
import { mockBranches } from "./branches.mock";
import type {
  AttendancePage,
  Customer,
  CustomerCreate,
  CustomerPage,
  ListCustomersParams,
  MembershipPage,
  MembershipStatus,
  PaymentPage,
} from "@/features/customers/types";

const FIRST = ["Ana", "Luis", "Marcela", "Diego", "Paola", "Rafael", "Valeria", "Jorge", "Camila", "Héctor", "Daniela", "Iván"];
const LAST = ["Torres", "Herrera", "Ortiz", "Salas", "Mena", "Cruz", "Soto", "Ibarra", "Ruiz", "Vega", "Cortés", "Lara"];
const MEMBERSHIPS: Array<MembershipStatus | null> = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "PENDING", "EXPIRED", "SUSPENDED", null];
const ascii = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const day = 86_400_000;

function seed(): Customer[] {
  const base = Date.UTC(2025, 5, 1);
  return Array.from({ length: 36 }, (_, i) => {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 5 + 2) % LAST.length];
    const ms = MEMBERSHIPS[i % MEMBERSHIPS.length];
    const inactive = i % 11 === 10;
    return {
      id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      fullName: `${first} ${last}`,
      email: `${ascii(first)}.${ascii(last)}${i + 1}@correo.com`,
      phone: `55 ${String(1000 + i * 37).padStart(4, "0")} ${String(2000 + i * 13).padStart(4, "0")}`,
      status: inactive ? "INACTIVE" : ms ? "ACTIVE" : "INVITED",
      branchId: mockBranches[i % mockBranches.length].id,
      membershipStatus: ms,
      membershipEndsAt: ms ? new Date(base + (i + 300) * day).toISOString() : null,
      createdAt: new Date(base + i * day).toISOString(),
    } satisfies Customer;
  });
}

let store: Customer[] = seed();
export const resetCustomers = () => {
  store = seed();
};
const fail = (status: number, code: string, message: string) => new ApiError(status, code, message, crypto.randomUUID());
const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));

export async function mockListCustomers(p: ListCustomersParams = {}): Promise<CustomerPage> {
  await wait();
  const q = p.q ? ascii(p.q) : "";
  let rows = store.filter(
    (c) =>
      (!q || ascii(`${c.fullName} ${c.email ?? ""} ${c.phone ?? ""}`).includes(q)) &&
      (!p.status || c.status === p.status) &&
      (!p.membershipStatus || c.membershipStatus === p.membershipStatus) &&
      (!p.branchId || c.branchId === p.branchId),
  );
  const sort = p.sort ?? "-createdAt";
  const key = sort.replace("-", "") as "createdAt" | "fullName";
  const dir = sort.startsWith("-") ? -1 : 1;
  rows = [...rows].sort((a, b) => a[key].localeCompare(b[key]) * dir);
  const limit = Math.min(Math.max(p.limit ?? 25, 1), 100);
  const start = p.cursor ? Number(atob(p.cursor)) : 0;
  if (!Number.isInteger(start) || start < 0) throw fail(400, "invalid_cursor", "El cursor no es válido.");
  const end = start + limit;
  return { items: rows.slice(start, end), nextCursor: end < rows.length ? btoa(String(end)) : null };
}

export async function mockGetCustomer(id: string): Promise<Customer> {
  await wait(80);
  const c = store.find((x) => x.id === id);
  if (!c) throw fail(404, "customer_not_found", "El cliente no existe.");
  return c;
}

export async function mockCreateCustomer(body: CustomerCreate): Promise<Customer> {
  await wait(300);
  if (!body.fullName?.trim()) throw fail(400, "validation_error", "El nombre es obligatorio.");
  const email = body.email?.trim().toLowerCase();
  if (email && store.some((c) => c.email?.toLowerCase() === email)) {
    throw fail(409, "customer_email_taken", "Ya existe un cliente con ese correo.");
  }
  const created: Customer = {
    id: crypto.randomUUID(),
    fullName: body.fullName.trim(),
    email: email ?? null,
    phone: body.phone?.trim() || null,
    status: body.sendInvitation !== false && email ? "INVITED" : "ACTIVE",
    branchId: body.branchId ?? null,
    membershipStatus: null,
    membershipEndsAt: null,
    createdAt: new Date().toISOString(),
  };
  store = [created, ...store];
  return created;
}

export async function mockDeactivateCustomer(id: string): Promise<void> {
  await wait(200);
  const i = store.findIndex((c) => c.id === id);
  if (i < 0) throw fail(404, "customer_not_found", "El cliente no existe.");
  store = store.map((c, n) => (n === i ? { ...c, status: "INACTIVE" } : c));
}

export async function mockListMemberships(id: string): Promise<MembershipPage> {
  const c = await mockGetCustomer(id);
  if (!c.membershipStatus) return { items: [], nextCursor: null };
  return {
    items: [{ id: `${id}-m1`, planName: "Mensual Pro", status: c.membershipStatus, startsAt: new Date(Date.UTC(2025, 9, 18)).toISOString(), endsAt: c.membershipEndsAt ?? null, remainingCredits: null }],
    nextCursor: null,
  };
}

export async function mockListPayments(id: string): Promise<PaymentPage> {
  const c = await mockGetCustomer(id);
  if (!c.membershipStatus) return { items: [], nextCursor: null };
  return {
    items: [
      { id: `${id}-p1`, concept: "Mensual Pro", amount: { amount: 89000, currency: "MXN" }, status: "APPROVED", method: "CARD", createdAt: new Date(Date.UTC(2025, 9, 18)).toISOString() },
      { id: `${id}-p2`, concept: "Mensual Pro", amount: { amount: 89000, currency: "MXN" }, status: "APPROVED", method: "CASH", createdAt: new Date(Date.UTC(2025, 8, 18)).toISOString() },
    ],
    nextCursor: null,
  };
}

export async function mockListAttendance(id: string): Promise<AttendancePage> {
  const c = await mockGetCustomer(id);
  const branchId = c.branchId ?? mockBranches[0].id;
  return {
    items: [
      { id: `${id}-a1`, checkedInAt: new Date(Date.UTC(2025, 10, 5, 13, 2)).toISOString(), branchId, method: "QR", result: "ACCEPTED" },
      { id: `${id}-a2`, checkedInAt: new Date(Date.UTC(2025, 10, 4, 0, 10)).toISOString(), branchId, method: "QR", result: "ACCEPTED" },
    ],
    nextCursor: null,
  };
}
