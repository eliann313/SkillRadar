import { test, expect } from "@playwright/test";

test.describe("Developer E2E Flow", () => {
    test("should login as demo developer, upload text CV, analyze it, and view resumes history", async ({ page }) => {
        // 1. Ir a la página de login
        await page.goto("/login");
        await expect(page).toHaveTitle(/SkillRadar/);

        // 2. Hacer clic en "Dev Demo" para iniciar sesión simulada
        const devDemoButton = page.getByRole("button", { name: "Dev Demo" });
        await expect(devDemoButton).toBeVisible();
        await devDemoButton.click();

        // 3. Verificar que redirige al Dashboard
        await page.waitForURL("/dashboard");
        await expect(page.getByTestId("guest-mode-banner")).toBeVisible();

        // 4. Ir a la sección de Análisis de CV
        await page.goto("/dashboard/cv-analysis");
        await page.waitForURL("/dashboard/cv-analysis");

        // 5. Expandir la entrada de texto plano del currículum
        const pasteTextTrigger = page.getByText("Or paste your CV text");
        await expect(pasteTextTrigger).toBeVisible();
        await pasteTextTrigger.click();

        // 6. Rellenar el contenido del currículum
        const cvTextarea = page.locator("#cv-text");
        await expect(cvTextarea).toBeVisible();
        await cvTextarea.fill(
            "John Doe. Senior React Developer. Skills: React, TypeScript, Next.js, Node.js, Tailwind CSS, Git. Seniority: Senior. Experience: 6 years building high-quality web applications.",
        );

        // 7. Lanzar el análisis
        const analyzeButton = page.getByRole("button", { name: "Analyze with AI" });
        await expect(analyzeButton).toBeVisible();
        await analyzeButton.click();

        // 8. Esperar la confirmación y visualización del análisis de resultados
        // En modo Guest devuelve mocks inmediatamente
        await expect(page.locator("text=ATS Score")).toBeVisible({ timeout: 10000 });

        // 9. Navegar a nuestra nueva pantalla de Gestión de CVs
        await page.goto("/dashboard/settings/resumes");
        await page.waitForURL("/dashboard/settings/resumes");

        // 10. Verificar que el CV figure y el botón de activo esté visible
        await expect(page.getByRole("heading", { name: "Gestionar Currículums" })).toBeVisible();
        await expect(page.getByText("curriculum_texto.txt")).toBeVisible();
    });
});
