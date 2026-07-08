/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { auditLinkedinProfileAction } from "./actions";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AIService } from "@/lib/ai";

vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/ai", () => ({
    AIService: {
        generateStructuredObject: vi.fn(),
    },
}));

describe("Linkedin Audit Actions", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("debe retornar error si no hay sesión activa", async () => {
        vi.mocked(auth).mockResolvedValue(null as any);

        const result = await auditLinkedinProfileAction("Mi perfil");

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain("No autorizado");
        }
    });

    it("debe retornar error si el texto del perfil está vacío", async () => {
        const mockSession = {
            user: { id: "user-123" },
        };
        vi.mocked(auth).mockResolvedValue(mockSession as any);

        const result = await auditLinkedinProfileAction("   ");

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain("no puede estar vacío");
        }
    });

    it("debe retornar éxito y los datos estructurados generados por el servicio de IA", async () => {
        const mockSession = {
            user: { id: "user-123" },
        };
        vi.mocked(auth).mockResolvedValue(mockSession as any);

        vi.spyOn(db.user, "findUnique").mockResolvedValue({
            id: "user-123",
            geminiApiKey: "encrypted-key",
            groqApiKey: null,
            openrouterApiKey: null,
            openaiApiKey: null,
            anthropicApiKey: null,
            defaultAiProvider: "gemini",
            defaultAiModel: "gemini-2.5-flash",
        } as any);

        const mockAuditResult = {
            seoScore: 90,
            headlineScore: 85,
            aboutScore: 95,
            experienceScore: 90,
            suggestions: [
                {
                    section: "Headline",
                    score: 85,
                    feedback: "Buen trabajo.",
                    improvedExample: "Ejemplo de Headline",
                },
            ],
            checklist: [
                {
                    item: "Titular optimizado",
                    status: true,
                    impact: "Alto",
                },
            ],
        };

        vi.mocked(AIService.generateStructuredObject).mockResolvedValue(mockAuditResult);

        const result = await auditLinkedinProfileAction("Mi perfil completo");

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.seoScore).toBe(90);
            expect(result.data.suggestions[0].section).toBe("Headline");
        }
    });

    it("debe retornar simulación offline (mock) en caso de que falle el servicio de IA", async () => {
        const mockSession = {
            user: { id: "user-123" },
        };
        vi.mocked(auth).mockResolvedValue(mockSession as any);
        vi.spyOn(db.user, "findUnique").mockResolvedValue(null);

        vi.mocked(AIService.generateStructuredObject).mockRejectedValue(new Error("AI Service Error"));

        const result = await auditLinkedinProfileAction("Mi perfil");

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.seoScore).toBe(72); // El score del mock fallback
            expect(result.data.suggestions).toHaveLength(2);
        }
    });
});
