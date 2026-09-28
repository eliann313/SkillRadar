/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobPostingService } from "./service";
import { db } from "@/lib/db";

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

const posting = {
    id: "job-1",
    recruiterId: "rec-1",
    title: "React Senior",
    company: "Acme",
    location: "Remoto",
    remoteType: "remote",
    description: "Buscamos React senior con 5 años.",
    requiredSkills: ["React"],
    seniorityLevel: "senior",
    status: "draft",
};

const jobData = {
    title: "React Senior",
    company: "Acme",
    location: "Remoto",
    remoteType: "remote" as const,
    description: "Buscamos React senior con 5 años.",
    requiredSkills: ["React"],
    seniorityLevel: "senior",
};

describe("JobPostingService — CRUD + IDOR + moderación", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("createJobPosting sanitiza antes de persistir", async () => {
        vi.spyOn(db.jobPosting, "create").mockResolvedValue({ id: "job-1" } as any);

        await JobPostingService.createJobPosting("rec-1", {
            ...jobData,
            title: "<script>alert(1)</script>",
        });

        const createSpy = vi.mocked(db.jobPosting.create);
        expect(createSpy).toHaveBeenCalledWith({
            data: expect.objectContaining({
                recruiterId: "rec-1",
                title: "&lt;script&gt;alert(1)&lt;/script&gt;",
                status: "draft",
            }),
        });
    });

    it("updateJobPosting rechaza a quien no es dueño (IDOR)", async () => {
        vi.spyOn(db.jobPosting, "findUnique").mockResolvedValue({ ...posting } as any);

        await expect(JobPostingService.updateJobPosting("rec-otro", "job-1", { title: "Hack" })).rejects.toThrow(
            "Acceso denegado",
        );
    });

    it("updateJobPosting lanza si la oferta no existe", async () => {
        vi.spyOn(db.jobPosting, "findUnique").mockResolvedValue(null);

        await expect(JobPostingService.updateJobPosting("rec-1", "job-x", { title: "X" })).rejects.toThrow(
            "no encontrada",
        );
    });

    it("closeJobPosting y extend verifican ownership y estado", async () => {
        vi.spyOn(db.jobPosting, "findUnique").mockResolvedValue({ ...posting } as any);
        vi.spyOn(db.jobPosting, "update").mockResolvedValue({ ...posting, status: "closed" } as any);

        await JobPostingService.closeJobPosting("rec-1", "job-1");
        const updateSpy = vi.mocked(db.jobPosting.update);
        expect(updateSpy).toHaveBeenCalledWith({
            where: { id: "job-1" },
            data: { status: "closed" },
        });

        // Extender exige estado published
        await expect(JobPostingService.extendJobPostingExpiration("rec-1", "job-1")).rejects.toThrow("publicadas");
    });

    it("withdrawApplication cambia a withdrawn y rechaza doble retiro", async () => {
        vi.spyOn(db.jobPostingApplication, "findUnique").mockResolvedValue({
            id: "app-1",
            status: "submitted",
        } as any);
        vi.spyOn(db.jobPostingApplication, "update").mockResolvedValue({ id: "app-1", status: "withdrawn" } as any);

        await JobPostingService.withdrawApplication("dev-1", "job-1");
        expect(vi.mocked(db.jobPostingApplication.update)).toHaveBeenCalledWith({
            where: { id: "app-1" },
            data: { status: "withdrawn" },
        });

        vi.mocked(db.jobPostingApplication.findUnique).mockResolvedValue({
            id: "app-1",
            status: "withdrawn",
        } as any);
        await expect(JobPostingService.withdrawApplication("dev-1", "job-1")).rejects.toThrow("retirada");
    });

    it("createContentReport rechaza duplicados y modera al 3er reporte", async () => {
        vi.spyOn(db.contentReport, "findUnique").mockResolvedValue(null);
        vi.spyOn(db.contentReport, "create").mockResolvedValue({ id: "rep-1" } as any);
        const updateSpy = vi.spyOn(db.jobPosting, "update").mockResolvedValue({} as any);

        // 2 reportes acumulados → no modera
        vi.spyOn(db.contentReport, "count").mockResolvedValue(2);
        await JobPostingService.createContentReport("u-1", {
            targetType: "job_posting",
            targetId: "job-1",
            reason: "spam",
        });
        expect(updateSpy).not.toHaveBeenCalled();

        // 3er reporte → under_review
        vi.mocked(db.contentReport.count).mockResolvedValue(3);
        await JobPostingService.createContentReport("u-2", {
            targetType: "job_posting",
            targetId: "job-1",
            reason: "spam",
        });
        expect(updateSpy).toHaveBeenCalledWith({
            where: { id: "job-1" },
            data: { status: "under_review" },
        });

        // Duplicado del mismo reportante
        vi.mocked(db.contentReport.findUnique).mockResolvedValue({ id: "rep-1" } as any);
        await expect(
            JobPostingService.createContentReport("u-1", {
                targetType: "job_posting",
                targetId: "job-1",
                reason: "spam",
            }),
        ).rejects.toThrow("Ya has reportado");
    });
});
