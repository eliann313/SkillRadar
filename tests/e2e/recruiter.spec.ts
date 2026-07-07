import { test, expect } from "@playwright/test";

test.describe("Recruiter E2E Flow", () => {
    test("should login as recruiter, create a draft job posting, and publish it", async ({ page }) => {
        // 1. Ir a login
        await page.goto("/login");

        // 2. Hacer clic en "Recruiter Demo"
        const recruiterDemoButton = page.getByRole("button", { name: "Recruiter Demo" });
        await expect(recruiterDemoButton).toBeVisible();
        await recruiterDemoButton.click();

        // 3. Verificar redirección a Dashboard
        await page.waitForURL("/dashboard");
        await expect(page.getByText("Simulación Activa")).toBeVisible();

        // 4. Navegar a Job Postings
        await page.goto("/dashboard/recruiter/postings");
        await page.waitForURL("/dashboard/recruiter/postings");

        // 5. Abrir formulario de creación de oferta
        const createButton = page.getByRole("button", { name: "Crear Oferta" }).first();
        await expect(createButton).toBeVisible();
        await createButton.click();

        // 6. Rellenar campos del formulario
        await page.getByPlaceholder("Ej: Senior Frontend Developer").fill("Staff Frontend Engineer");
        await page.getByPlaceholder("Ej: Acme Corp").fill("SkillRadar Labs");
        await page.getByPlaceholder("Ej: Buenos Aires, Argentina").fill("San Francisco, CA");
        await page.getByPlaceholder("Ej: senior, semi-senior, junior").fill("Senior");

        // Agregar Habilidad requerida
        const skillInput = page.getByPlaceholder("Escribe y presiona Enter o ,");
        await skillInput.fill("React");
        await skillInput.press("Enter");

        // Rellenar descripción
        await page
            .getByPlaceholder("Detalla los requerimientos, responsabilidades y lo que ofrece el puesto...")
            .fill(
                "Buscamos un Staff Frontend Engineer con experiencia en desarrollo de productos utilizando TypeScript, React y Next.js.",
            );

        // 7. Guardar la oferta
        const saveButton = page.getByRole("button", { name: "Guardar Oferta" });
        await expect(saveButton).toBeVisible();
        await saveButton.click();

        // 8. Esperar a que se guarde el borrador y cerrarlo o confirmar que figura en la tabla
        // Debe de cerrarse el modal y listarse el borrador
        await expect(page.getByText("Staff Frontend Engineer")).toBeVisible({ timeout: 10000 });

        // 9. Publicar la oferta
        // El botón tiene el título "Publicar oferta"
        const publishButton = page.locator('button[title="Publicar oferta"]').first();
        await expect(publishButton).toBeVisible();
        await publishButton.click();

        // 10. Confirmar que la oferta está en estado publicado (el botón de publicar ya no debe ser visible o cambia de estado)
        await expect(publishButton).not.toBeVisible({ timeout: 10000 });
    });
});
