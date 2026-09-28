import { describe, it, expect } from "vitest";
import { sanitizeText } from "./sanitize";
import { getSeniorityColor } from "./seniority";

describe("lib/sanitize — shared kernel XSS", () => {
    it("retorna vacío con input vacío", () => {
        expect(sanitizeText("")).toBe("");
    });

    it("escapa los 5 caracteres especiales", () => {
        expect(sanitizeText(`<script>alert("x")&'y'</script>`)).toBe(
            "&lt;script&gt;alert(&quot;x&quot;)&amp;&#x27;y&#x27;&lt;/script&gt;",
        );
    });

    it("deja texto plano intacto", () => {
        expect(sanitizeText("Desarrollador React Senior")).toBe("Desarrollador React Senior");
    });
});

describe("lib/seniority — colores por nivel", () => {
    it("mapea cada nivel a su clase", () => {
        expect(getSeniorityColor("junior")).toContain("indigo");
        expect(getSeniorityColor("mid")).toContain("primary");
        expect(getSeniorityColor("senior")).toContain("emerald");
        expect(getSeniorityColor("lead")).toContain("warning");
    });

    it("normaliza mayúsculas y espacios", () => {
        expect(getSeniorityColor("  SENIOR ")).toBe(getSeniorityColor("senior"));
    });

    it("devuelve fallback con nivel desconocido", () => {
        expect(getSeniorityColor("ninja")).toBe("");
        expect(getSeniorityColor("ninja", "fb")).toBe("fb");
    });
});
