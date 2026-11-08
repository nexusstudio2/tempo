import type { Customer, MembershipStatus } from "./types";

export type Tone = "ok" | "warn" | "danger" | "neutral";

const membership: Record<MembershipStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Activa", tone: "ok" },
  PENDING: { label: "Pendiente", tone: "neutral" },
  EXPIRED: { label: "Vencida", tone: "danger" },
  SUSPENDED: { label: "Suspendida", tone: "warn" },
  CANCELLED: { label: "Cancelada", tone: "neutral" },
};

/** Etiqueta que se muestra en la lista: la baja manda sobre el estado de la membresía. */
export function customerBadge(c: Pick<Customer, "status" | "membershipStatus">): { label: string; tone: Tone } {
  if (c.status === "INACTIVE") return { label: "Baja", tone: "danger" };
  if (!c.membershipStatus) return { label: c.status === "INVITED" ? "Invitado" : "Sin membresía", tone: "neutral" };
  return membership[c.membershipStatus];
}

export const membershipLabel = (s: MembershipStatus) => membership[s];

export function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(amount / 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}
