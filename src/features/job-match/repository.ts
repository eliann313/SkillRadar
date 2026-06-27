import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { CreateJobMatchInput, JobMatchAnalysis } from "./types";

export class JobMatchRepository {
    static async create(data: CreateJobMatchInput) {
        return await db.jobMatch.create({
            data: {
                userId: data.userId,
                resumeId: data.resumeId || null,
                jobOfferText: data.jobOfferText,
                matchScore: data.matchScore ?? null,
                analysis: data.analysis ? (data.analysis as Prisma.InputJsonValue) : undefined,
            },
        });
    }

    static async updateAnalysis(id: string, userId: string, matchScore: number, analysis: JobMatchAnalysis) {
        return await db.jobMatch.update({
            where: { id, userId },
            data: {
                matchScore,
                analysis: analysis as Prisma.InputJsonValue,
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

    static async listByUserId(userId: string) {
        return await db.jobMatch.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                resume: true,
            },
        });
    }

    static async delete(id: string, userId: string) {
        return await db.jobMatch.delete({
            where: { id, userId },
        });
    }
}
