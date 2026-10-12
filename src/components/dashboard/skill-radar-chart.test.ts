import { describe, expect, it } from "vitest";
import { getRadarAxisBreakdown } from "./skill-radar-chart";

describe("getRadarAxisBreakdown", () => {
    it("debe calcular puntajes base de 20 cuando no hay coincidencias", () => {
        const breakdown = getRadarAxisBreakdown([]);
        expect(breakdown).toHaveLength(5);
        for (const item of breakdown) {
            expect(item.score).toBe(20);
            expect(item.matches).toEqual([]);
        }
    });

    it("debe clasificar palabras clave correctamente por eje", () => {
        const keywords = ["React", "TypeScript", "Node.js", "Docker", "TDD"];
        const breakdown = getRadarAxisBreakdown(keywords);

        const frontend = breakdown.find((b) => b.subject === "Frontend");
        const backend = breakdown.find((b) => b.subject === "Backend");
        const devops = breakdown.find((b) => b.subject === "DevOps");
        const testing = breakdown.find((b) => b.subject === "Testing");

        expect(frontend?.matches).toContain("React");
        expect(frontend?.matches).toContain("TypeScript");
        expect(frontend?.score).toBeGreaterThan(20);

        expect(backend?.matches).toContain("Node.js");
        expect(devops?.matches).toContain("Docker");
        expect(testing?.matches).toContain("TDD");
    });

    it("debe limitar el puntaje máximo a 95 puntos", () => {
        const manyFrontendKeywords = [
            "react",
            "next.js",
            "vue",
            "angular",
            "svelte",
            "html",
            "css",
            "tailwind",
            "javascript",
            "typescript",
        ];
        const breakdown = getRadarAxisBreakdown(manyFrontendKeywords);
        const frontend = breakdown.find((b) => b.subject === "Frontend");

        expect(frontend?.score).toBeLessThanOrEqual(95);
        expect(frontend?.score).toBe(95);
    });
});
