import { z } from "zod";
import { apiFetch } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { components } from "@/lib/api-types";
import { mockBranches } from "./branches.mock";

export type Branch = components["schemas"]["Branch"];

const branchPageSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      address: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]),
      createdAt: z.string(),
    }),
  ),
  nextCursor: z.string().nullable(),
}) satisfies z.ZodType<components["schemas"]["BranchPage"]>;

export async function listBranches(): Promise<Branch[]> {
  if (env.useMocks) return mockBranches;
  return (await apiFetch("/branches?limit=100", branchPageSchema)).items;
}
