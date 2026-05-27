import { db } from "@/lib/db";
import type { ATSAnalysis } from "./types";
import type { Prisma } from "@prisma/client";

export class ResumeRepository {
    static async create(data: { userId: string; fileName: string; fileUrl: string; rawText: string }) {
        return await db.resume.create({
            data,
        });
    }

    static async updateAnalysis(
        id: string,
        userId: string,
        data: {
            atsScore: number;
            analysis: ATSAnalysis;
        },
    ) {
        return await db.resume.update({
            where: { id, userId },
            data: {
                atsScore: data.atsScore,
                analysis: data.analysis as unknown as Prisma.InputJsonValue, // Cast seguro para compatibilidad de tipos estrictos con Prisma JSON
            },
        });
    }

    static async findByUserId(userId: string) {
        return await db.resume.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    static async delete(id: string, userId: string) {
        return await db.resume.delete({
            where: { id, userId },
        });
    }
}
