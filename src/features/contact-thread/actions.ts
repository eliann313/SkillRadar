"use server";

import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/features/job-match/types";
import { RecruiterService } from "@/features/recruiter/service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const requestIdSchema = z.string().cuid();
const bodySchema = z.string().min(1).max(2000);

export interface ThreadMessage {
    id: string;
    senderId: string;
    isMine: boolean;
    body: string;
    createdAt: string;
}

async function assertParticipant(requestId: string, userId: string) {
    const request = await db.contactRequest.findUnique({ where: { id: requestId } });
    if (!request || (request.recruiterId !== userId && request.developerId !== userId)) {
        return null;
    }
    return request;
}

export async function getThreadMessagesAction(requestId: string): Promise<ActionResult<ThreadMessage[]>> {
    try {
        if (!requestIdSchema.safeParse(requestId).success) {
            return { success: false, error: "Conversación no encontrada." };
        }
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "No autorizado." };

        const request = await assertParticipant(requestId, session.user.id);
        if (!request) return { success: false, error: "Conversación no encontrada." };

        const messages = await db.contactMessage.findMany({
            where: { requestId },
            orderBy: { createdAt: "asc" },
            take: 100,
        });

        return {
            success: true,
            data: messages.map((m) => ({
                id: m.id,
                senderId: m.senderId,
                isMine: m.senderId === session.user.id,
                body: m.body,
                createdAt: m.createdAt.toISOString(),
            })),
        };
    } catch (error: unknown) {
        logger.error("[getThreadMessagesAction] Error:", error);
        return { success: false, error: "Error al cargar la conversación." };
    }
}

export async function sendThreadMessageAction(requestId: string, body: string): Promise<ActionResult<ThreadMessage>> {
    try {
        if (!requestIdSchema.safeParse(requestId).success || !bodySchema.safeParse(body).success) {
            return { success: false, error: "Datos inválidos." };
        }
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "No autorizado." };
        if (session.user.isGuest) return { success: false, error: "La demo es de solo lectura." };

        const { checkWriteRateLimit } = await import("@/lib/rate-limit");
        const rl = await checkWriteRateLimit(`user:${session.user.id}`);
        if (!rl.success) return { success: false, error: "Límite diario de mensajes alcanzado." };

        const clean = RecruiterService.sanitize(body).trim().slice(0, 2000);
        if (!clean) return { success: false, error: "El mensaje no puede estar vacío." };

        const request = await assertParticipant(requestId, session.user.id);
        if (!request) return { success: false, error: "Conversación no encontrada." };
        if (request.status === "declined") {
            return { success: false, error: "Esta conversación está cerrada." };
        }

        const message = await db.contactMessage.create({
            data: { requestId, senderId: session.user.id, body: clean },
        });

        const otherId = request.recruiterId === session.user.id ? request.developerId : request.recruiterId;
        const { createNotification } = await import("@/lib/notifications");
        await createNotification({
            userId: otherId,
            type: "contact_status_changed",
            title: "Nuevo mensaje",
            message: "Tienes un mensaje nuevo en una conversación de contacto.",
            link: session.user.role === "recruiter" ? "/dashboard/recruiter/requests" : "/dashboard",
        });

        revalidatePath("/dashboard/recruiter/requests");
        revalidatePath("/dashboard");

        return {
            success: true,
            data: {
                id: message.id,
                senderId: message.senderId,
                isMine: true,
                body: message.body,
                createdAt: message.createdAt.toISOString(),
            },
        };
    } catch (error: unknown) {
        logger.error("[sendThreadMessageAction] Error:", error);
        return { success: false, error: "Error al enviar el mensaje." };
    }
}
