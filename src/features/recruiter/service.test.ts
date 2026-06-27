import { describe, it, expect } from "vitest";
import { RecruiterService } from "./service";

describe("RecruiterService — Reverse Matching & Doble Ciego", () => {
    it("debe sanitizar cadenas de texto contra XSS", () => {
        const payload = "<script>alert('xss')</script>";
        const clean = RecruiterService.sanitize(payload);
        expect(clean).not.toContain("<script>");
        expect(clean).toContain("&lt;script&gt;");
    });

    it("debe generar un matching simulado razonable basado en tecnologías en común", () => {
        const resumeText = "Desarrollador fullstack con experiencia en React, TypeScript y Node.js.";
        const jobDescription = "Buscamos un Ingeniero de Software que maneje React y TypeScript.";

        // Llamada interna a la simulación
        const match = RecruiterService.generateSimulatedPoolMatch(resumeText, jobDescription);

        expect(match.matchScore).toBeGreaterThanOrEqual(50);
        expect(match.justification).toContain("react");
        expect(match.justification).toContain("typescript");
    });
});
