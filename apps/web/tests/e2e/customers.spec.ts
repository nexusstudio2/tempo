import { expect, test, type Page } from "@playwright/test";

async function enterAsOwner(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill("carlos@correo.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("cualquiera");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByRole("button", { name: /Gimnasio Titan\s+Propietario/ }).click();
  await expect(page).toHaveURL(/\/manage\/dashboard/);
}

test("el propietario registra un cliente y lo ve en la lista", async ({ page }) => {
  await enterAsOwner(page);
  await page.getByRole("link", { name: "Clientes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();

  await page.getByRole("button", { name: "Nuevo cliente" }).click();
  await page.getByLabel("Nombre completo").fill("Valentina Prueba");
  await page.getByLabel("Correo electrónico").fill("valentina.prueba@correo.com");
  await page.getByRole("button", { name: "Registrar cliente" }).click();

  await expect(page.getByRole("status")).toContainText("Valentina Prueba");
  await expect(page.getByRole("button", { name: /Valentina Prueba/ })).toBeVisible();
});

test("pide un correo si se quiere enviar la invitación", async ({ page }) => {
  await enterAsOwner(page);
  await page.getByRole("link", { name: "Clientes", exact: true }).click();
  await page.getByRole("button", { name: "Nuevo cliente" }).click();
  await page.getByLabel("Nombre completo").fill("Sin Correo");
  await page.getByRole("button", { name: "Registrar cliente" }).click();
  await expect(page.getByText("Para enviar la invitación necesitas un correo.")).toBeVisible();
});

test("la búsqueda filtra la lista", async ({ page }) => {
  await enterAsOwner(page);
  await page.getByRole("link", { name: "Clientes", exact: true }).click();
  await page.getByLabel("Buscar cliente").fill("hector");
  await expect(page.getByRole("button", { name: /Héctor/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Ana [A-Z]/ })).toHaveCount(0);
});
