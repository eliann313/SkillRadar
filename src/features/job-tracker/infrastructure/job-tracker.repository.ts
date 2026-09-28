import { db } from "@/infrastructure/db";
import type { JobTrackerCreateData, JobTrackerStore } from "../domain/job-tracker.ports";

/**
 * Adaptador por defecto del puerto `JobTrackerStore` (ADR-003).
 * Sin clase intermedia: este feature solo necesita el contrato + Prisma.
 */
export const defaultJobTrackerStore: JobTrackerStore = {
    async listByUserId(userId) {
        return await db.jobApplication.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    },

    async create(data: JobTrackerCreateData) {
        return await db.jobApplication.create({
            data: {
                userId: data.userId,
                title: data.title,
                company: data.company,
                url: data.url || null,
                status: data.status || "to_apply",
            },
        });
    },

    async updateStatus(id, userId, status) {
        return await db.jobApplication.update({
            where: { id, userId },
            data: { status },
        });
    },

    async delete(id, userId) {
        return await db.jobApplication.delete({
            where: { id, userId },
        });
    },
};
