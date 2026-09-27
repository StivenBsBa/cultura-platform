import { test, expect } from "@playwright/test";
test("registro muestra formulario", async ({ page }) => {
  await page.goto("/registro");
  await expect(page.getByRole("heading", { name: "Crea tu cuenta" })).toBeVisible();
});

test("páginas legales y de autenticación no desbordan en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const [path, heading] of [
    ["/", "Encuentra historias para vivir cerca de ti."],
    ["/acerca", "Acerca de Cultura Platform"],
    ["/privacidad", "Privacidad"],
    ["/terminos", "Términos de uso"],
    ["/login", "Bienvenido nuevamente"],
    ["/registro", "Crea tu cuenta"],
  ]) {
    const response = await page.goto(path);
    expect(response?.ok(), `${path} debe responder correctamente`).toBeTruthy();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
      `${path} no debe desbordar horizontalmente`,
    ).toBeTruthy();
  }
});

test("alias y rutas protegidas devuelven al login sin sesión", async ({ page }) => {
  for (const path of ["/dashboard", "/dashboard/eventos", "/dashboard/eventos/nuevo"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  }
});

test.skip("login, crear evento y alternar favoritos requieren base de datos seed disponible", () => {});
