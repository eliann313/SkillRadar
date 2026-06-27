import { db } from "@/lib/db";
import { type InterviewDebriefData } from "./types";
import type { Prisma } from "@prisma/client";

export class InterviewRepository {
    static async create(userId: string, resumeId?: string | null, jobMatchId?: string | null) {
        return await db.interviewSession.create({
            data: {
                userId,
                resumeId: resumeId || null,
                jobMatchId: jobMatchId || null,
                messages: [], // Historial de chat vacío al iniciar
            },
        });
    }

    static async findById(id: string, userId: string) {
        return await db.interviewSession.findFirst({
            where: { id, userId },
        });
    }

    static async updateMessages(id: string, userId: string, messages: Prisma.InputJsonValue) {
        return await db.interviewSession.updateMany({
            where: { id, userId },
            data: {
                messages,
            },
        });
    }

    static async saveDebrief(id: string, userId: string, score: number, debrief: InterviewDebriefData) {
        return await db.interviewSession.updateMany({
            where: { id, userId },
            data: {
                score,
                debrief: debrief as unknown as Prisma.InputJsonValue,
            },
        });
    }

    static async listByUserId(userId: string) {
        return await db.interviewSession.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
}
