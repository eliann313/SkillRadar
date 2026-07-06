import { db } from "@/lib/db";

export class JobTrackerRepository {
    static async listByUserId(userId: string) {
        return await db.jobApplication.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    static async create(data: { userId: string; title: string; company: string; url?: string; status?: string }) {
        return await db.jobApplication.create({
            data: {
                userId: data.userId,
                title: data.title,
                company: data.company,
                url: data.url || null,
                status: data.status || "to_apply",
            },
        });
    }

    static async updateStatus(id: string, userId: string, status: string) {
        return await db.jobApplication.update({
            where: { id, userId },
            data: { status },
        });
    }

    static async delete(id: string, userId: string) {
        return await db.jobApplication.delete({
            where: { id, userId },
        });
    }
}
