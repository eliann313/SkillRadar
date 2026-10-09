import { test, expect } from "@playwright/test";

/**
 * Career path elegible + board multi-rubro (guest dev, mocks sin DB).
 * - El panel genera recomendaciones sobre el camino elegido (no-IT incluido).
 * - El Job Board expone filtro por rubro.
 */
test.describe("Career Path E2E Flow", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/login");
        const devDemoButton = page.getByRole("button", { name: "Dev Demo" });
        await expect(devDemoButton).toBeVisible();
        await devDemoButton.click();
        await page.waitForURL("**/dashboard");
    });

    test("genera recomendaciones sobre un camino no-IT (sociología)", async ({ page }) => {
        await page.goto("/dashboard/progress");
        const select = page.getByTestId("career-path-select");
        await expect(select).toBeVisible({ timeout: 15000 });
        await select.selectOption("sociologia");
        await page.getByTestId("career-path-generate").click();
        // Mock guest sensible al camino: usa el valor crudo (independiente del locale)
        await expect(page.getByText("Fundamentos de sociologia")).toBeVisible({ timeout: 15000 });
    });

    test("el job board expone filtro por rubro", async ({ page }) => {
        await page.goto("/dashboard/jobs");
        const fieldFilter = page.getByTestId("job-field-filter");
        await expect(fieldFilter).toBeVisible({ timeout: 15000 });
        await fieldFilter.selectOption("business");
        // El filtro aplica sin romper la página (con o sin ofertas)
        await expect(fieldFilter).toHaveValue("business");
    });
});
