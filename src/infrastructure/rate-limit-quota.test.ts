import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserQuotaUsage } from "./rate-limit";
import { checkCVRateLimit } from "./rate-limit";
import { db } from "./db";

describe("getUserQuotaUsage — lectura sin consumo (Fase 5)", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(db.user, "findUnique").mockRejectedValue(new Error("sin DB en test"));
    });

    it("reporta 8 cuotas llenas para usuario nuevo", async () => {
        const quotas = await getUserQuotaUsage("quota-nuevo-123");
        expect(quotas).toHaveLength(8);
        for (const q of quotas) {
            expect(q.remaining).toBe(q.limit);
            expect(q.reset).toBeGreaterThan(Date.now());
        }
    });

    it("refleja consumo sin consumir al leer", async () => {
        const id = "quota-lector-456";
        await checkCVRateLimit(`user:${id}`);
        await checkCVRateLimit(`user:${id}`);

        const before = await getUserQuotaUsage(id);
        const cv = before.find((q) => q.key === "cv-analysis");
        expect(cv?.remaining).toBe((cv?.limit ?? 5) - 2);

        const after = await getUserQuotaUsage(id);
        expect(after.find((q) => q.key === "cv-analysis")?.remaining).toBe(cv?.remaining);
    });
});
