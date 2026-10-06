import { test, expect } from "@playwright/test";

/**
 * Demo pública sin registro (/ + /demo): deuda E2E F4.3.
 * Sin sesión, sin DB, sin IA: solo contenido simulado.
 */
test.describe("Demo pública (sin registro)", () => {
    test("landing muestra preview con datos y enlaza a /demo", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveTitle(/SkillRadar/);

        // Preview con datos cargados (no genérico)
        await expect(page.getByText("DEV-9B1C27")).toBeVisible({ timeout: 15000 });

        const demoLink = page.getByRole("link", { name: "Abrir demo interactiva" });
        await expect(demoLink).toBeVisible();
        await demoLink.click();
        await page.waitForURL("**/demo");
    });

    test("/demo muestra tabs CV/Match/GitHub y CTA a registro", async ({ page }) => {
        await page.goto("/demo");
        await expect(page.getByRole("heading", { name: "Mira lo que SkillRadar ve en tu perfil" })).toBeVisible({
            timeout: 15000,
        });

        // Tab CV con análisis simulado
        await expect(page.getByRole("tab", { name: "Análisis ATS" })).toBeVisible();
        await expect(page.getByText("ATS Score").first()).toBeVisible();

        // Tabs navegables
        await page.getByRole("tab", { name: "Job Match" }).click();
        await expect(page.getByRole("tab", { name: "Job Match" })).toHaveAttribute("aria-selected", "true");
        await page.getByRole("tab", { name: "GitHub" }).click();
        await expect(page.getByRole("tab", { name: "GitHub" })).toHaveAttribute("aria-selected", "true");

        // CTA final lleva a registro
        const cta = page.getByRole("link", { name: "Comenzar Gratis" });
        await expect(cta).toBeVisible();
        await cta.click();
        await page.waitForURL("**/login**");
    });
});
