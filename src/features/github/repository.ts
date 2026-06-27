import { db } from "@/lib/db";
import { type GithubAnalysisData } from "./types";
import type { Prisma } from "@prisma/client";

export class GithubAnalysisRepository {
    static async createOrUpdate(userId: string, githubUser: string, data: GithubAnalysisData) {
        // Buscar si el usuario ya tiene un análisis de GitHub
        const existing = await db.githubAnalysis.findFirst({
            where: { userId, githubUser },
        });

        if (existing) {
            return await db.githubAnalysis.update({
                where: { id: existing.id },
                data: {
                    profileScore: data.profileScore,
                    languages: data.languages as Prisma.InputJsonValue,
                    repos: data.repos as unknown as Prisma.InputJsonValue,
                    analysis: data.analysis as Prisma.InputJsonValue,
                    createdAt: new Date(), // Actualizar marca de tiempo
                },
            });
        }

        return await db.githubAnalysis.create({
            data: {
                userId,
                githubUser,
                profileScore: data.profileScore,
                languages: data.languages as Prisma.InputJsonValue,
                repos: data.repos as unknown as Prisma.InputJsonValue,
                analysis: data.analysis as Prisma.InputJsonValue,
            },
        });
    }

    static async findLatestByUserId(userId: string) {
        return await db.githubAnalysis.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    static async delete(id: string, userId: string) {
        return await db.githubAnalysis.deleteMany({
            where: { id, userId },
        });
    }
}
