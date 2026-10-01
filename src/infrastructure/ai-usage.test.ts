import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackAiUsage } from "./ai-usage";
import { logger } from "@/infrastructure/logger";

vi.mock("@/infrastructure/analytics", () => ({
    trackServerEvent: vi.fn().mockResolvedValue(undefined),
}));

describe("trackAiUsage — observabilidad IA (Fase 3)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loguea_metricas estructuradas sin userId (anonimo)", async () => {
        const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});
        const { trackServerEvent } = await import("@/infrastructure/analytics");

        await trackAiUsage({
            provider: "groq",
            model: "openai/gpt-oss-120b",
            latencyMs: 1234.5,
            success: true,
            fallbackAttempt: 1,
        });

        expect(infoSpy).toHaveBeenCalledWith(
            "[AI usage]",
            expect.objectContaining({
                provider: "groq",
                latencyMs: 1235,
                success: true,
                fallbackAttempt: 1,
                userHash: null,
            }),
        );
        expect(trackServerEvent).toHaveBeenCalledWith(
            "ai_inference_succeeded",
            undefined,
            expect.objectContaining({ provider: "groq" }),
        );
    });

    it("hashea el userId y nunca expone PII", async () => {
        const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});
        const { trackServerEvent } = await import("@/infrastructure/analytics");

        await trackAiUsage({
            provider: "gemini",
            model: "gemini-3.8-flash",
            latencyMs: 10,
            success: false,
            fallbackAttempt: 0,
            userId: "user-123",
        });

        const meta = infoSpy.mock.calls[0][1] as { userHash: string };
        expect(meta.userHash).toMatch(/^[a-f0-9]{64}$/);
        expect(JSON.stringify(infoSpy.mock.calls)).not.toContain("user-123");
        expect(trackServerEvent).toHaveBeenCalledWith("ai_inference_failed", "user-123", expect.anything());
    });

    it("no lanza si el tracking analitico falla", async () => {
        vi.spyOn(logger, "info").mockImplementation(() => {});
        const { trackServerEvent } = await import("@/infrastructure/analytics");
        vi.mocked(trackServerEvent).mockRejectedValueOnce(new Error("/analytics caído"));

        await expect(
            trackAiUsage({ provider: "gemini", model: "x", latencyMs: 1, success: true, fallbackAttempt: 0 }),
        ).resolves.toBeUndefined();
    });
});
