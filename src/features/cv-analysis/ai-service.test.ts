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

    it("debe detectar y clasificar perfiles senior con puntuaciones superiores (escala 0-based)", async () => {
        const cvText =
            "Soy Jane Smith, Senior Solutions Architect con experiencia liderando equipos en AWS, Docker, React, Node y Typescript.";

        const analysis = await CVAnalysisAIService.analyze(cvText);

        expect(analysis).toBeDefined();
        expect(analysis.estimatedSeniority).toBe("senior");
        // Escala 0-based calibrada: sin contacto ni métricas no llega a 80; sí supera a un junior
        const junior = await CVAnalysisAIService.analyze(
            "Soy John Doe, Junior React Developer recién graduado. Sé algo de javascript.",
        );
        expect(analysis.atsScore).toBeGreaterThan(junior.atsScore);
        expect(analysis.keywords).toContain("React");
        expect(analysis.keywords).toContain("Docker");
        expect(analysis.keywords).toContain("Aws");
        expect(analysis.keywords).toContain("Typescript");
        // El breakdown 0-based debe cuadrar con el score y marcarse como simulado
        const b = analysis.atsBreakdown!;
        expect(b.contacto + b.secciones + b.legibilidad + b.keywordsContexto + b.cuantificacion).toBeCloseTo(
            analysis.atsScore,
            0,
        );
        expect(analysis.isSimulated).toBe(true);
        expect(analysis.atsScore).toBeLessThan(95);
    });

    it("debe detectar problemas de formato si falta información de contacto", async () => {
        const cvText = "React developer. No hay email ni telefono aquí.";
        const analysis = await CVAnalysisAIService.analyze(cvText);

        expect(analysis.formatIssues.length).toBeGreaterThan(0);
        expect(analysis.formatIssues[0]).toContain("contacto");
    });
});
