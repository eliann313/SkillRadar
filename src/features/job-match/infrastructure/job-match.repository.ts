import { db } from "@/infrastructure/db";
import type { Prisma } from "@prisma/client";
import type { CreateJobMatchInput, JobMatchAnalysis } from "../domain/job-match.types";
import type { JobMatchStore, JobMatchWithResume } from "../domain/job-match.ports";

export class JobMatchRepository {
    static async create(data: CreateJobMatchInput) {
        return await db.jobMatch.create({
            data: {
                userId: data.userId,
                resumeId: data.resumeId || null,
                jobOfferText: data.jobOfferText,
                matchScore: data.matchScore ?? null,
                analysis: data.analysis ? (data.analysis as unknown as Prisma.InputJsonValue) : undefined,
            },
        });
    }

    static async updateAnalysis(id: string, userId: string, matchScore: number, analysis: JobMatchAnalysis) {
        return await db.jobMatch.update({
            where: { id, userId },
            data: {
                matchScore,
                analysis: analysis as unknown as Prisma.InputJsonValue,
            },
        });
    }

    static async findById(id: string, userId: string) {
        return await db.jobMatch.findUnique({
            where: { id, userId },
            include: {
                resume: true,
            },
        });
    }
}

/**
 * Adaptador por defecto del puerto `JobMatchStore` (ADR-003).
 */
export const defaultJobMatchStore: JobMatchStore = {
    create: (data) => JobMatchRepository.create(data),
    updateAnalysis: (id, userId, matchScore, analysis) =>
        JobMatchRepository.updateAnalysis(id, userId, matchScore, analysis),
    findById: (id, userId): Promise<JobMatchWithResume | null> => JobMatchRepository.findById(id, userId),
};
