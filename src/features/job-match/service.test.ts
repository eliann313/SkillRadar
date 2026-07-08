import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobMatchService } from "./service";
import { db } from "@/lib/db";
import { JobMatchRepository } from "./repository";
import type { JobMatch } from "@prisma/client";
import type { JobMatchAnalysis } from "./types";

describe("JobMatchService", () => {
    const userId = "test-user-id";
    const resumeId = "test-resume-id";
    const jobOfferText = "Buscamos un programador React y TypeScript que conozca Node.js y Docker.";

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("debe crear un Job Match exitosamente y persistirlo", async () => {
        // Mocks de base de datos
        const mockResume = {
            id: resumeId,
            userId: userId,
            fileName: "cv.pdf",
            fileUrl: "https://utfs.io/f/cv.pdf",
            rawText: "Soy desarrollador React, TypeScript y Node.js.",
            atsScore: 80,
            analysis: null,
            isActive: false,
            createdAt: new Date(),
        };

        const mockJobMatch: JobMatch = {
            id: "match-cuid-12345",
            userId: userId,
            resumeId: resumeId,
            jobOfferText: jobOfferText,
            matchScore: 75,
            analysis: {
                requiredSkills: ["React", "TypeScript", "Node.js", "Docker"],
                missingSkills: ["Docker"],
                seniority: "mid",
                recommendations: [
                    "Enriquece tu experiencia laboral agregando proyectos donde hayas implementado contenedores Docker.",
                ],
                matchScore: 75,
            },
            createdAt: new Date(),
        };

        const spyFindUniqueResume = vi.spyOn(db.resume, "findUnique").mockResolvedValue(mockResume);
        const spyCreateMatch = vi.spyOn(JobMatchRepository, "create").mockResolvedValue(mockJobMatch);
        const spyUpdateMatch = vi.spyOn(JobMatchRepository, "updateAnalysis").mockResolvedValue(mockJobMatch);

        const result = await JobMatchService.createJobMatch({
            userId,
            resumeId,
            jobOfferText,
        });

        expect(spyFindUniqueResume).toHaveBeenCalledWith({
            where: { id: resumeId, userId },
        });
        expect(spyCreateMatch).toHaveBeenCalled();
        expect(spyUpdateMatch).toHaveBeenCalled();

        expect(result).toBeDefined();
        expect(result.id).toBe("match-cuid-12345");
        expect(result.matchScore).toBe(75);

        const analysis = result.analysis as unknown as JobMatchAnalysis;
        expect(analysis.requiredSkills).toContain("React");
    });

    it("debe arrojar un error si el CV no existe o no pertenece al usuario", async () => {
        vi.spyOn(db.resume, "findUnique").mockResolvedValue(null);

        await expect(
            JobMatchService.createJobMatch({
                userId,
                resumeId,
                jobOfferText,
            }),
        ).rejects.toThrow("El CV seleccionado no existe o no te pertenece.");
    });
});
