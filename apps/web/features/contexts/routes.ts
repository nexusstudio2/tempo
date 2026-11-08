import type { Role } from "./types";

/** Pantalla de inicio de cada rol. Es solo navegación: los permisos reales los valida el backend. */
export function routeForRole(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "BUSINESS_OWNER":
    case "BUSINESS_ADMIN":
    case "MANAGER":
      return "/manage/dashboard";
    case "RECEPTIONIST":
      return "/reception/home";
    case "INSTRUCTOR":
      return "/instructor/today";
    case "CUSTOMER":
      return "/me/home";
  }
}
