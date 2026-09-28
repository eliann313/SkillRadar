import { db } from "@/infrastructure/db";
import type { ResumeAnalysisData, ResumeCreateData, ResumeStore } from "../domain/cv-analysis.ports";
import type { Prisma } from "@prisma/client";

export class ResumeRepository {
    static async create(data: ResumeCreateData) {
        return await db.resume.create({
            data,
        });
    }

    static async updateAnalysis(id: string, userId: string, data: ResumeAnalysisData) {
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

    static async setActive(id: string, userId: string) {
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
    }

    static async getActive(userId: string) {
        const active = await db.resume.findFirst({
            where: { userId, isActive: true },
        });
        if (active) return active;
        return await db.resume.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
}

/**
 * Adaptador por defecto del puerto `ResumeStore` (ADR-003).
 * La aplicación inyecta otro `ResumeStore` en tests; el servicio usa este.
 */
export const defaultResumeStore: ResumeStore = {
    create: (data) => ResumeRepository.create(data),
    updateAnalysis: (id, userId, data) => ResumeRepository.updateAnalysis(id, userId, data),
    findByUserId: (userId) => ResumeRepository.findByUserId(userId),
    delete: (id, userId) => ResumeRepository.delete(id, userId),
    setActive: (id, userId) => ResumeRepository.setActive(id, userId),
    getActive: (userId) => ResumeRepository.getActive(userId),
};
