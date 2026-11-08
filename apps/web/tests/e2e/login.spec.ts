import { expect, test } from "@playwright/test";

test("login y cambio al panel del propietario", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill("carlos@correo.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("cualquiera");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "¿Dónde quieres entrar?" })).toBeVisible();
  await page.getByRole("button", { name: /Gimnasio Titan\s+Propietario/ }).click();
  await expect(page).toHaveURL(/\/manage\/dashboard/);
});

test("muestra errores de validación", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Escribe un correo válido")).toBeVisible();
});
