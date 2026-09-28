import { describe, it, expect } from "vitest";
import {
    stripPIIForLLM,
    redactPIIFromModelOutput,
    buildAnonymousId,
    escapeHtml,
    escapeXml,
    isSafeInternalLink,
    safeParseJson,
} from "./pii";

describe("lib/pii — Doble Ciego y PII", () => {
    describe("stripPIIForLLM", () => {
        it("retorna vacío con input vacío", () => {
            expect(stripPIIForLLM("")).toBe("");
        });

        it("redacta emails y elimina la línea de encabezado que los contiene", () => {
            const out = stripPIIForLLM("Juan Pérez juan@example.com\nDesarrollador React");
            expect(out).not.toContain("juan@example.com");
            expect(out).toContain("Desarrollador React");
        });

        it("redacta teléfonos de 7+ dígitos y conserva secuencias cortas", () => {
            // Ojo: líneas <120 chars con PII se dropean como encabezado; se usa línea larga
            const longLine = `Tel: +54 11 1234 5678 ${"x".repeat(120)}`;
            expect(stripPIIForLLM(longLine)).toContain("[PHONE_REDACTED]");
            expect(stripPIIForLLM("nivel 5 y 3 años")).not.toContain("[PHONE_REDACTED]");
        });

        it("marca links de github/linkedin como perfil y el resto como URL", () => {
            const pad = "x".repeat(120);
            expect(stripPIIForLLM(`https://github.com/juan ${pad}`)).toContain("[PROFILE_LINK_REDACTED]");
            expect(stripPIIForLLM(`https://linkedin.com/in/juan ${pad}`)).toContain("[PROFILE_LINK_REDACTED]");
            expect(stripPIIForLLM(`https://example.com/cv.pdf ${pad}`)).toContain("[URL_REDACTED]");
        });

        it("respeta maxChars", () => {
            const long = "a".repeat(7000);
            expect(stripPIIForLLM(long, 100).length).toBeLessThanOrEqual(100);
        });
    });

    describe("redactPIIFromModelOutput", () => {
        it("retorna vacío con input vacío", () => {
            expect(redactPIIFromModelOutput("")).toBe("");
        });

        it("redacta email, teléfono y url del output del modelo", () => {
            const out = redactPIIFromModelOutput("Contactar a ana@mail.com al 555-1234 https://x.com");
            expect(out).toContain("[redactado]");
            expect(out).toContain("[enlace redactado]");
            expect(out).not.toContain("ana@mail.com");
        });
    });

    describe("buildAnonymousId", () => {
        it("genera DEV-XXXXXX estable por scope", () => {
            const a = buildAnonymousId("user-1", "talent-pool");
            const b = buildAnonymousId("user-1", "talent-pool");
            expect(a).toBe(b);
            expect(a).toMatch(/^DEV-[0-9A-F]{6}$/);
        });

        it("varía entre scopes y entre candidatos", () => {
            expect(buildAnonymousId("user-1", "a")).not.toBe(buildAnonymousId("user-1", "b"));
            expect(buildAnonymousId("user-1", "a")).not.toBe(buildAnonymousId("user-2", "a"));
        });

        it("no expone el id original", () => {
            expect(buildAnonymousId("user-1", "a")).not.toContain("user-1");
        });
    });

    describe("escapeHtml / escapeXml", () => {
        it("escapa los 5 caracteres especiales", () => {
            expect(escapeHtml(`<a href="x">&'y'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#x27;y&#x27;&lt;/a&gt;");
        });

        it("escapeXml delega en escapeHtml", () => {
            expect(escapeXml("<b>")).toBe("&lt;b&gt;");
        });

        it("retorna vacío con input vacío", () => {
            expect(escapeHtml("")).toBe("");
        });
    });

    describe("isSafeInternalLink", () => {
        it("acepta rutas internas allowlisteadas", () => {
            expect(isSafeInternalLink("/dashboard/jobs")).toBe(true);
            expect(isSafeInternalLink("/u/juan")).toBe(true);
            expect(isSafeInternalLink("/login")).toBe(true);
        });

        it("rechaza URLs externas y vacío", () => {
            expect(isSafeInternalLink("https://evil.com")).toBe(false);
            expect(isSafeInternalLink("")).toBe(false);
        });
    });

    describe("safeParseJson", () => {
        it("parsea JSON válido", () => {
            expect(safeParseJson<{ a: number }>('{"a":1}', null)).toEqual({ a: 1 });
        });

        it("devuelve el objeto tal cual si ya es objeto", () => {
            const obj = { a: 1 };
            expect(safeParseJson(obj, null)).toBe(obj);
        });

        it("devuelve fallback con null/undefined/no-string/JSON corrupto", () => {
            expect(safeParseJson(null, "fb")).toBe("fb");
            expect(safeParseJson(undefined, "fb")).toBe("fb");
            expect(safeParseJson(42, "fb")).toBe("fb");
            expect(safeParseJson("{corrupto", "fb")).toBe("fb");
        });
    });
});
