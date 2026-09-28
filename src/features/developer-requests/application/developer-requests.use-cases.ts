"use server";

import { logger } from "@/infrastructure/logger";
import { auth } from "@/infrastructure/auth";
import { db } from "@/infrastructure/db";
import type { ActionResult } from "@/shared-kernel/action-result";
import { revalidatePath } from "next/cache";

/**
 * Acepta una solicitud de contacto, revelando los datos.
 */
export async function acceptContactRequestAction(requestId: string): Promise<ActionResult<boolean>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        const request = await db.contactRequest.findUnique({
            where: { id: requestId },
        });

        if (!request || request.developerId !== session.user.id) {
            return { success: false, error: "Solicitud no encontrada o no te pertenece." };
        }

        await db.contactRequest.update({
            where: { id: requestId },
            data: { status: "accepted" },
        });

        const { createNotification } = await import("@/infrastructure/notifications");
        await createNotification({
            userId: request.recruiterId,
            type: "contact_status_changed",
            title: "Contacto aceptado",
            message: `Un desarrollador aceptó tu solicitud de contacto. Ya puedes ver su perfil completo.`,
            link: "/dashboard",
        });

        revalidatePath("/dashboard");

        return {
            success: true,
            data: true,
        };
    } catch (error: unknown) {
        logger.error("[acceptContactRequestAction] Error:", error);
        return {
            success: false,
            error: "Error al aceptar la solicitud de contacto.",
        };
    }
}

/**
 * Declina de forma silenciosa una solicitud de contacto (cambia a declined).
 */
export async function declineContactRequestAction(requestId: string): Promise<ActionResult<boolean>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        const request = await db.contactRequest.findUnique({
            where: { id: requestId },
        });

        if (!request || request.developerId !== session.user.id) {
            return { success: false, error: "Solicitud no encontrada o no te pertenece." };
        }

        await db.contactRequest.update({
            where: { id: requestId },
            data: { status: "declined" },
        });

        const { createNotification } = await import("@/infrastructure/notifications");
        await createNotification({
            userId: request.recruiterId,
            type: "contact_status_changed",
            title: "Contacto declinado",
            message: `Un desarrollador declinó tu solicitud de contacto.`,
            link: "/dashboard",
        });

        revalidatePath("/dashboard");

        return {
            success: true,
            data: true,
        };
    } catch (error: unknown) {
        logger.error("[declineContactRequestAction] Error:", error);
        return {
            success: false,
            error: "Error al rechazar la solicitud de contacto.",
        };
    }
}
