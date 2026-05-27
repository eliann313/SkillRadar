import { describe, expect, it } from "vitest";
import { CVAnalysisAIService } from "./ai-service";

describe("CVAnalysisAIService - Mock/Simulación Offline", () => {
    it("debe generar un análisis simulado coherente para perfiles junior", async () => {
        const cvText = "Soy John Doe, Junior React Developer recién graduado. Sé algo de javascript.";

        // Al no estar configurada la clave en test (o mockeada), entra en modo simulación
        const analysis = await CVAnalysisAIService.analyze(cvText);

        expect(analysis).toBeDefined();
        expect(analysis.estimatedSeniority).toBe("junior");
        expect(analysis.atsScore).toBeLessThan(75);
        expect(analysis.keywords).toContain("React");
        expect(analysis.keywords).toContain("Javascript");
    });

    it("debe detectar y clasificar perfiles senior con puntuaciones superiores", async () => {
        const cvText =
            "Soy Jane Smith, Senior Solutions Architect con experiencia liderando equipos en AWS, Docker, React, Node y Typescript.";

        const analysis = await CVAnalysisAIService.analyze(cvText);

        expect(analysis).toBeDefined();
        expect(analysis.estimatedSeniority).toBe("senior");
        expect(analysis.atsScore).toBeGreaterThan(80);
        expect(analysis.keywords).toContain("React");
        expect(analysis.keywords).toContain("Docker");
        expect(analysis.keywords).toContain("Aws");
        expect(analysis.keywords).toContain("Typescript");
    });

    it("debe detectar problemas de formato si falta información de contacto", async () => {
        const cvText = "React developer. No hay email ni telefono aquí.";
        const analysis = await CVAnalysisAIService.analyze(cvText);

        expect(analysis.formatIssues.length).toBeGreaterThan(0);
        expect(analysis.formatIssues[0]).toContain("contacto");
    });
});
