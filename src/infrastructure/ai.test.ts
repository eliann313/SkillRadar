/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AIService } from "./ai";

vi.mock("ai", () => ({
    generateObject: vi.fn(),
}));

const { mockEnv } = vi.hoisted(() => ({
    mockEnv: {
        GEMINI_API_KEY: "test-gemini",
        OPENROUTER_API_KEY: "test-openrouter",
    } as Record<string, string | undefined>,
}));

vi.mock("@/infrastructure/env", () => ({
    env: mockEnv,
}));

const OLD_ENV = { ...process.env };

describe("lib/ai — AIService.getModelInstance", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...OLD_ENV };
    });

    afterEach(() => {
        process.env = { ...OLD_ENV };
    });

    it("lanza error claro con proveedor desconocido", () => {
        expect(() => AIService.getModelInstance("skynet", "t-800")).toThrow("Proveedor no soportado");
    });

    it("lanza error si falta la API key (gemini sin env ni usuario)", () => {
        delete mockEnv.GEMINI_API_KEY;
        expect(() => AIService.getModelInstance("gemini", "gemini-3.8-flash")).toThrow("GEMINI_API_KEY");
        mockEnv.GEMINI_API_KEY = "test-gemini";
    });

    it("instancia cada proveedor con su env key", () => {
        // gemini/openrouter salen del env validado (@/infrastructure/env mockeado); el resto de process.env
        process.env.GROQ_API_KEY = "q";
        process.env.OPENAI_API_KEY = "o";
        process.env.ANTHROPIC_API_KEY = "a";

        expect(AIService.getModelInstance("gemini", "gemini-3.8-flash")).toBeTruthy();
        expect(AIService.getModelInstance("groq", "openai/gpt-oss-120b")).toBeTruthy();
        expect(AIService.getModelInstance("openai", "gpt-6-sol")).toBeTruthy();
        expect(AIService.getModelInstance("anthropic", "claude-sonnet-5")).toBeTruthy();
        expect(AIService.getModelInstance("openrouter", "openrouter/free")).toBeTruthy();
    });

    it("lanza error si falta cada key faltante", () => {
        delete process.env.GROQ_API_KEY;
        delete process.env.OPENAI_API_KEY;
        delete process.env.ANTHROPIC_API_KEY;
        delete process.env.OPENROUTER_API_KEY;
        delete mockEnv.OPENROUTER_API_KEY;
        expect(() => AIService.getModelInstance("groq", "m")).toThrow("GROQ_API_KEY");
        expect(() => AIService.getModelInstance("openai", "m")).toThrow("OpenAI");
        expect(() => AIService.getModelInstance("anthropic", "m")).toThrow("Anthropic");
        expect(() => AIService.getModelInstance("openrouter", "m")).toThrow("OPENROUTER_API_KEY");
        mockEnv.OPENROUTER_API_KEY = "test-openrouter";
    });
});

describe("lib/ai — AIService.generateStructuredObject (cascada)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...OLD_ENV, GEMINI_API_KEY: "g", GROQ_API_KEY: "q", OPENROUTER_API_KEY: "r" };
    });

    afterEach(() => {
        process.env = { ...OLD_ENV };
    });

    it("retorna el objeto del primer proveedor que responde", async () => {
        const { generateObject } = await import("ai");
        vi.mocked(generateObject).mockResolvedValue({ object: { score: 80 } } as any);

        const result = await AIService.generateStructuredObject<{ score: number }>({
            schema: {},
            prompt: "analiza",
        });

        expect(result).toEqual({ score: 80 });
        expect(generateObject).toHaveBeenCalledTimes(1);
    });

    it("hace fallback al siguiente proveedor si el primario falla", async () => {
        const { generateObject } = await import("ai");
        vi.mocked(generateObject)
            .mockRejectedValueOnce(new Error("gemini caído"))
            .mockResolvedValueOnce({ object: { score: 70 } } as any);

        const result = await AIService.generateStructuredObject<{ score: number }>({
            schema: {},
            prompt: "analiza",
            userSettings: { preferredProvider: "gemini", preferredModel: "gemini-3.8-flash" },
        });

        expect(result).toEqual({ score: 70 });
        expect(generateObject).toHaveBeenCalledTimes(2);
    });

    it("lanza error agregado si todos los proveedores fallan", async () => {
        const { generateObject } = await import("ai");
        vi.mocked(generateObject).mockRejectedValue(new Error("todo caído"));

        await expect(AIService.generateStructuredObject({ schema: {}, prompt: "analiza" })).rejects.toThrow(
            "Todos los proveedores",
        );
    });
});
