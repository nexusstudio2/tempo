import { z } from "zod";
import type { components } from "@/lib/api-types";

type S = components["schemas"];
export type Customer = S["Customer"];
export type CustomerCreate = S["CustomerCreate"];
export type CustomerPage = S["CustomerPage"];
export type CustomerStatus = S["CustomerStatus"];
export type MembershipStatus = S["MembershipStatus"];
export type Membership = S["Membership"];
export type MembershipPage = S["MembershipPage"];
export type Payment = S["Payment"];
export type PaymentPage = S["PaymentPage"];
export type AttendanceRecord = S["AttendanceRecord"];
export type AttendancePage = S["AttendancePage"];

// Cada `satisfies` hace que el compilador falle si el esquema deja de coincidir con el contrato.
export const membershipStatusSchema = z.enum(["ACTIVE", "PENDING", "EXPIRED", "SUSPENDED", "CANCELLED"]) satisfies z.ZodType<MembershipStatus>;

export const customerSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  status: z.enum(["INVITED", "ACTIVE", "INACTIVE"]),
  branchId: z.string().nullable().optional(),
  membershipStatus: membershipStatusSchema.nullable().optional(),
  membershipEndsAt: z.string().nullable().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
}) satisfies z.ZodType<Customer>;

const cursor = z.string().nullable();

export const customerPageSchema = z.object({ items: z.array(customerSchema), nextCursor: cursor }) satisfies z.ZodType<CustomerPage>;

export const membershipPageSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      planName: z.string(),
      status: membershipStatusSchema,
      startsAt: z.string(),
      endsAt: z.string().nullable().optional(),
      remainingCredits: z.number().nullable().optional(),
    }),
  ),
  nextCursor: cursor,
}) satisfies z.ZodType<MembershipPage>;

export const paymentPageSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      concept: z.string(),
      amount: z.object({ amount: z.number(), currency: z.string() }),
      status: z.enum(["PENDING", "PROCESSING", "APPROVED", "REJECTED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"]),
      method: z.enum(["CASH", "TRANSFER", "CARD", "PROVIDER"]),
      createdAt: z.string(),
    }),
  ),
  nextCursor: cursor,
}) satisfies z.ZodType<PaymentPage>;

export const attendancePageSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      checkedInAt: z.string(),
      branchId: z.string(),
      method: z.enum(["QR", "MANUAL", "FINGERPRINT", "FACE", "CARD"]),
      result: z.enum(["ACCEPTED", "REJECTED"]),
      rejectionReason: z.string().nullable().optional(),
    }),
  ),
  nextCursor: cursor,
}) satisfies z.ZodType<AttendancePage>;

export type ListCustomersParams = {
  q?: string;
  status?: CustomerStatus;
  membershipStatus?: MembershipStatus;
  branchId?: string;
  sort?: "createdAt" | "-createdAt" | "fullName" | "-fullName";
  limit?: number;
  cursor?: string;
};
