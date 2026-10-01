import { db } from "@/infrastructure/db";
import type { ResumeAnalysisData, ResumeCreateData, ResumeStore } from "../domain/cv-analysis.ports";
import type { Prisma } from "@prisma/client";

/**
 * Adaptador por defecto del puerto `ResumeStore` (ADR-003, Fase 0).
 * Sin clase intermedia: el store implementa Prisma directo y el servicio
 * y los use-cases solo conocen el puerto. Tests inyectan otro `ResumeStore`.
 */
export const defaultResumeStore: ResumeStore = {
    async create(data: ResumeCreateData) {
        return await db.resume.create({
            data,
        });
    },

    async updateAnalysis(id: string, userId: string, data: ResumeAnalysisData) {
        return await db.resume.update({
            where: { id, userId },
            data: {
                atsScore: data.atsScore,
                analysis: data.analysis as unknown as Prisma.InputJsonValue, // Cast seguro para compatibilidad de tipos estrictos con Prisma JSON
            },
        });
    },

    async findByUserId(userId: string) {
        return await db.resume.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    },

    async delete(id: string, userId: string) {
        return await db.resume.delete({
            where: { id, userId },
        });
    },

    async setActive(id: string, userId: string) {
        return await db.$transaction([
            db.resume.updateMany({
                where: { userId },
                data: { isActive: false },
            }),
            db.resume.update({
                where: { id, userId },
                data: { isActive: true },
            }),
        ]);
    },

    async getActive(userId: string) {
        const active = await db.resume.findFirst({
            where: { userId, isActive: true },
        });
        if (active) return active;
        return await db.resume.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    },
};
