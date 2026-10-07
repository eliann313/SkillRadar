import { test, expect } from "@playwright/test";

test.describe("Recruiter E2E Flow", () => {
    test("guest recruiter ve preview de solo lectura sin verificación", async ({ page }) => {
        // 1. Ir a login
        await page.goto("/login");

        // 2. Hacer clic en "Recruiter Demo"
        const recruiterDemoButton = page.getByRole("button", { name: "Recruiter Demo" });
        await expect(recruiterDemoButton).toBeVisible();
        await recruiterDemoButton.click();

        // 3. Verificar redirección a Dashboard
        await page.waitForURL("**/dashboard");
        await expect(page.getByTestId("guest-mode-banner")).toBeVisible();

        // 4. El guest NO ve gate de verificación: ve preview mock de solo lectura
        await expect(page.getByTestId("guest-recruiter-preview")).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(/Verificación de cuenta recruiter|Recruiter account verification/)).toHaveCount(0);

        // 5. El preview muestra perfiles anonimizados ficticios (doble ciego)
        await expect(page.getByText("DEV-9B1C27")).toBeVisible({ timeout: 10000 });

        // 6. CTA a registro visible
        await expect(page.getByRole("link", { name: /Crear cuenta gratis|Create free account/ })).toBeVisible();
    });
});
