/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveDefaultMatchProvider } from "./jobs.ports";
import { JobPostingService } from "../application/jobs.service";
import { db } from "@/infrastructure/db";

vi.mock("@/features/job-match/application/job-match.service", () => ({
    JobMatchService: {
        createJobMatch: vi.fn(),
    },
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("jobs/ports — MatchProvider (F4.2)", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("el adaptador por defecto delega en JobMatchService", async () => {
        const { JobMatchService } = await import("@/features/job-match/application/job-match.service");
        vi.mocked(JobMatchService.createJobMatch).mockResolvedValue({
            matchScore: 82,
            analysis: { totalScore: 82 },
        } as any);

        const provider = await resolveDefaultMatchProvider();
        const result = await provider.createJobMatch({
            userId: "dev-1",
            resumeId: "resume-1",
            jobOfferText: "React senior",
        });

        expect(JobMatchService.createJobMatch).toHaveBeenCalledWith({
            userId: "dev-1",
            resumeId: "resume-1",
            jobOfferText: "React senior",
        });
        expect(result).toEqual({ matchScore: 82, analysis: { totalScore: 82 } });
    });
});

describe("JobPostingService.getOrCalculateMatchScore — caché + provider inyectable", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("retorna el caché sin invocar al provider", async () => {
        vi.spyOn(db.jobPostingMatchCache, "findUnique").mockResolvedValue({
            matchScore: 90,
            analysis: { cached: true },
        } as any);
        const createSpy = vi.spyOn(db.jobPostingMatchCache, "create").mockResolvedValue({} as any);
        const provider = { createJobMatch: vi.fn() };

        const result = await JobPostingService.getOrCalculateMatchScore("r1", "j1", "desc", "dev-1", provider);

        expect(result).toEqual({ matchScore: 90, analysis: { cached: true } });
        expect(provider.createJobMatch).not.toHaveBeenCalled();
        expect(createSpy).not.toHaveBeenCalled();
    });

    it("calcula con el provider inyectado y persiste en caché", async () => {
        vi.spyOn(db.jobPostingMatchCache, "findUnique").mockResolvedValue(null);
        const createSpy = vi.spyOn(db.jobPostingMatchCache, "create").mockResolvedValue({} as any);
        const provider = {
            createJobMatch: vi.fn().mockResolvedValue({ matchScore: 77, analysis: { totalScore: 77 } }),
        };

        const result = await JobPostingService.getOrCalculateMatchScore("r1", "j1", "desc", "dev-1", provider);

        expect(provider.createJobMatch).toHaveBeenCalledWith({
            userId: "dev-1",
            resumeId: "r1",
            jobOfferText: "desc",
        });
        expect(createSpy).toHaveBeenCalledWith({
            data: expect.objectContaining({ resumeId: "r1", jobPostingId: "j1", matchScore: 77 }),
        });
        expect(result.matchScore).toBe(77);
    });

    it("retorna fallback 0 si el provider falla (no rompe el board)", async () => {
        vi.spyOn(db.jobPostingMatchCache, "findUnique").mockResolvedValue(null);
        vi.spyOn(db.jobPostingMatchCache, "create").mockResolvedValue({} as any);
        const provider = { createJobMatch: vi.fn().mockRejectedValue(new Error("IA caída")) };

        const result = await JobPostingService.getOrCalculateMatchScore("r1", "j1", "desc", "dev-1", provider);

        expect(result).toEqual({ matchScore: 0, analysis: { error: "No se pudo calcular el matching" } });
    });
});
