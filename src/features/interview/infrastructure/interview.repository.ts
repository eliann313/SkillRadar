import { db } from "@/infrastructure/db";
import type { InterviewDebriefData } from "../domain/interview.types";
import type { InterviewStore } from "../domain/interview.ports";
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

/**
 * Adaptador por defecto del puerto `InterviewStore` (ADR-003).
 */
export const defaultInterviewStore: InterviewStore = {
    create: (userId, resumeId, jobMatchId) => InterviewRepository.create(userId, resumeId, jobMatchId),
    findById: (id, userId) => InterviewRepository.findById(id, userId),
    updateMessages: (id, userId, messages) => InterviewRepository.updateMessages(id, userId, messages),
    saveDebrief: (id, userId, score, debrief) => InterviewRepository.saveDebrief(id, userId, score, debrief),
    listByUserId: (userId) => InterviewRepository.listByUserId(userId),
};
