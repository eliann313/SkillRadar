import { test, expect } from "@playwright/test";

/**
 * Privacidad visible + límites del plan + explicabilidad del ATS (developer demo).
 * Deuda E2E F4.3: cubre las superficies que el feedback pidió hacer visibles.
 * Textos en ES|EN porque el locale se negocia por Accept-Language del browser.
 */
test.describe("Privacidad y límites (developer demo)", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/login");
        const devDemoButton = page.getByRole("button", { name: "Dev Demo" });
        await expect(devDemoButton).toBeVisible();
        await devDemoButton.click();
        await page.waitForURL("**/dashboard");
    });

    test("dashboard muestra tarjeta de privacidad con acceso a settings", async ({ page }) => {
        await expect(page.getByText(/Doble ciego activo|Double-blind active/)).toBeVisible({ timeout: 15000 });

        const privacyLink = page.getByRole("link", { name: /Gestionar privacidad|Manage privacy/ });
        await expect(privacyLink).toBeVisible();
        await privacyLink.click();
        await page.waitForURL("**/dashboard/settings");
    });

    test("dashboard muestra uso de límites del plan free", async ({ page }) => {
        // Fracción usado/límite del plan gratuito (CV: 0/5 para cuenta nueva)
        await expect(page.getByText("0/5").first()).toBeVisible({ timeout: 15000 });
    });

    test("el análisis de CV ofrece razonamiento con evidencia", async ({ page }) => {
        await page.goto("/dashboard/cv-analysis");
        await page.waitForURL("**/dashboard/cv-analysis");

        const pasteTextTrigger = page.getByText("Or paste your CV text");
        await expect(pasteTextTrigger).toBeVisible();
        await pasteTextTrigger.click();

        await page
            .locator("#cv-text")
            .fill(
                "Jane Doe. Semi-Senior Backend Developer. Skills: Node.js, TypeScript, PostgreSQL, Docker, GitHub Actions. Experience: 3 years building APIs with metrics and deploy pipelines.",
            );

        const analyzeButton = page.getByRole("button", { name: "Analyze with AI" });
        await analyzeButton.click();

        // Panel de explicabilidad detrás del score (mock simulado con badge offline)
        await expect(page.getByText(/Análisis offline \(sin IA\)|Offline analysis \(no AI\)/)).toBeVisible({
            timeout: 15000,
        });
        const reasoningBtn = page.getByRole("button", { name: /Ver Razonamiento|View Reasoning/ });
        await expect(reasoningBtn).toBeVisible();
        await reasoningBtn.click();
        await expect(page.getByText(/Explicabilidad del Score ATS|ATS Score Explainability/)).toBeVisible({
            timeout: 10000,
        });
    });
});
