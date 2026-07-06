"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

import type { Notification } from "@prisma/client";

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export interface NotificationListResult {
    notifications: Notification[];
    unreadCount: number;
    totalCount: number;
}

/**
 * Obtiene las notificaciones del usuario autenticado de forma paginada.
 * Filtra estrictamente por el userId de la sesión activa para evitar IDOR.
 */
export async function getNotificationsAction(
    page: number = 1,
    limit: number = 10,
): Promise<ActionResult<NotificationListResult>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const userId = session.user.id;
        const skip = (page - 1) * limit;

        const [notifications, unreadCount, totalCount] = await Promise.all([
            db.notification.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            db.notification.count({
                where: { userId, read: false },
            }),
            db.notification.count({
                where: { userId },
            }),
        ]);

        return {
            success: true,
            data: {
                notifications,
                unreadCount,
                totalCount,
            },
        };
    } catch (error) {
        console.error("[getNotificationsAction] Error:", error);
        return { success: false, error: "Error al recuperar las notificaciones." };
    }
}

/**
 * Marca una notificación específica como leída.
 * Verifica ownership para prevenir IDOR.
 */
export async function markAsReadAction(notificationId: string): Promise<ActionResult<boolean>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        // Verificar propiedad antes de mutar
        const notification = await db.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification) {
            return { success: false, error: "Notificación no encontrada." };
        }

        if (notification.userId !== session.user.id) {
            return { success: false, error: "Acceso denegado. No te pertenece esta notificación." };
        }

        await db.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });

        revalidatePath("/dashboard");
        return { success: true, data: true };
    } catch (error) {
        console.error("[markAsReadAction] Error:", error);
        return { success: false, error: "Error al marcar la notificación como leída." };
    }
}

/**
 * Marca todas las notificaciones del usuario como leídas.
 */
export async function markAllAsReadAction(): Promise<ActionResult<boolean>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const userId = session.user.id;

        await db.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });

        revalidatePath("/dashboard");
        return { success: true, data: true };
    } catch (error) {
        console.error("[markAllAsReadAction] Error:", error);
        return { success: false, error: "Error al marcar todas las notificaciones como leídas." };
    }
}
