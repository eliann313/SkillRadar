import { describe, it, expect } from "vitest";
import { CAREER_PATHS, MAX_CAREER_PATH_LENGTH, normalizeCareerPath, resolveCareerPathLabel } from "./career-paths";

describe("career-paths", () => {
    it("incluye caminos IT y no-IT (sociología, educación, etc.)", () => {
        const values = new Set(CAREER_PATHS.map((p) => p.value));
        for (const expected of [
            "ciencia-datos",
            "machine-learning",
            "programacion",
            "ingenieria-software",
            "arquitectura-software",
            "sociologia",
            "educacion",
            "marketing-digital",
        ]) {
            expect(values.has(expected)).toBe(true);
        }
    });

    it("normaliza input libre (trim, colapsa espacios, tope de longitud)", () => {
        expect(normalizeCareerPath("  Sociología  ")).toBe("Sociología");
        expect(normalizeCareerPath("ciencia   de    datos")).toBe("ciencia de datos");
        expect(normalizeCareerPath("x")).toBeNull();
        expect(normalizeCareerPath("  ")).toBeNull();
        expect(normalizeCareerPath(123)).toBeNull();
        expect(normalizeCareerPath("a".repeat(MAX_CAREER_PATH_LENGTH + 50))?.length).toBe(MAX_CAREER_PATH_LENGTH);
    });

    it("resuelve etiquetas por locale o devuelve el texto libre", () => {
        expect(resolveCareerPathLabel("sociologia", "es")).toBe("Sociología");
        expect(resolveCareerPathLabel("sociologia", "en")).toBe("Sociology");
        expect(resolveCareerPathLabel("Mi camino inventado", "es")).toBe("Mi camino inventado");
    });
});
