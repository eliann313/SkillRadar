import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function createNotification(params: {
    userId: string;
    type: "new_job_match" | "new_application" | "application_status_changed";
    title: string;
    message: string;
    link: string;
    metadata?: unknown;
}) {
    try {
        return await db.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link,
                metadata: params.metadata !== undefined ? (params.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
            },
        });
    } catch (error) {
        console.error("[createNotification] Error creating notification in database:", error);
        throw error;
    }
}
