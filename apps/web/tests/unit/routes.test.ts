import { describe, expect, it } from "vitest";
import { routeForRole } from "@/features/contexts/routes";
import { roleSchema } from "@/features/contexts/types";

describe("routeForRole", () => {
  it("lleva a cada rol a su pantalla de inicio", () => {
    expect(routeForRole("SUPER_ADMIN")).toBe("/admin/dashboard");
    expect(routeForRole("BUSINESS_OWNER")).toBe("/manage/dashboard");
    expect(routeForRole("RECEPTIONIST")).toBe("/reception/home");
    expect(routeForRole("INSTRUCTOR")).toBe("/instructor/today");
    expect(routeForRole("CUSTOMER")).toBe("/me/home");
  });

  it("cubre todos los roles de la especificación", () => {
    for (const role of roleSchema.options) expect(routeForRole(role)).toMatch(/^\//);
  });
});
