import { describe, it, expect } from "vitest";
import { FREE_QUOTAS, getPlanId } from "./plans";

describe("shared-kernel/plans — modelo de planes (Fase 5)", () => {
    it("deriva byok con claves propias y free sin ellas", () => {
        expect(getPlanId(true)).toBe("byok");
        expect(getPlanId(false)).toBe("free");
    });

    it("expone las 8 cuotas free espejando rate-limit", () => {
        const byKey = Object.fromEntries(FREE_QUOTAS.map((q) => [q.key, q.limit]));
        expect(byKey).toEqual({
            "cv-analysis": 5,
            "job-match": 10,
            "github-analysis": 10,
            "ai-sourcing": 10,
            "ai-chat": 20,
            "job-postings": 10,
            "job-applications": 20,
            writes: 30,
        });
    });
});
