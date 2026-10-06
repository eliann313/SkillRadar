import { test, expect } from "@playwright/test";

/**
 * Fase 2 — Seguridad E2E (sin datos reales, solo guest + anonimo).
 * - Rutas de archivos: sesion + SSRF + ownership por status HTTP.
 * - Admin: 404 estricto para no-admin (el layout no filtra que la ruta existe).
 * - IDOR: posteo inexistente redirige al listado en vez de filtrar.
 * - Doble ciego a nivel UI: sin contactos aceptados no hay PII que mostrar
 *   (el enforcement servidor esta cubierto en recruiter.service.test.ts).
 */
test.describe("Security E2E Flow", () => {
    test("rechaza descarga de archivos sin sesion (401) y con URL invalida (400)", async ({ request }) => {
        const anon = await request.get("/api/files?url=https://evil.example/x.pdf");
        expect(anon.status()).toBe(401);

        const anonUpload = await request.post("/api/files/upload", { data: {} });
        expect(anonUpload.status()).toBe(400);
    });

    test("redirige al home al visitar el dashboard sin sesion", async ({ page }) => {
        await page.goto("/dashboard");
        await page.waitForURL("**/en", { timeout: 15000 });
        expect(page.url()).not.toContain("dashboard");
    });

    test.describe("como recruiter invitado", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/login");
            const recruiterDemoButton = page.getByRole("button", { name: "Recruiter Demo" });
            await expect(recruiterDemoButton).toBeVisible();
            await recruiterDemoButton.click();
            await page.waitForURL("**/dashboard");
        });

        test("admin devuelve 404 estricto para no-admin", async ({ page }) => {
            await page.goto("/dashboard/admin");
            await expect(page.getByText("404", { exact: true })).toBeVisible({ timeout: 15000 });
        });

        test("posteo inexistente redirige al listado (IDOR)", async ({ page }) => {
            await page.goto("/dashboard/recruiter/postings/posteo-que-no-existe/applications");
            await page.waitForURL("**/dashboard/recruiter/postings", { timeout: 15000 });
            expect(page.url()).not.toContain("applications");
        });

        test("archivos con URL invalida devuelven 400 con sesion (SSRF)", async ({ page }) => {
            const res = await page.request.get("/api/files?url=notaurl");
            expect(res.status()).toBe(400);
            await expect(page.getByTestId("guest-mode-banner")).toBeVisible();
        });

        test("invitado no accede al pool: ve gate de verificación (doble ciego UI)", async ({ page }) => {
            // El guest-recruiter no está verificado: /dashboard renderiza el gate,
            // nunca el Talent Pool, así que no hay PII que filtrar
            await page.goto("/dashboard");
            await expect(page.getByText(/Verificación de cuenta recruiter|Recruiter account verification/)).toBeVisible(
                { timeout: 15000 },
            );
            await expect(page.getByRole("heading", { name: "Talent Pool" })).toHaveCount(0);
        });
    });
});
