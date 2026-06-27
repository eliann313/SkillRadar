"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/features/job-match/types";
import { revalidatePath } from "next/cache";
import type { ContactRequest } from "@prisma/client";

export type ContactRequestWithRecruiter = ContactRequest & {
    recruiter: {
        name: string | null;
        email: string;
    };
};

/**
 * Obtiene todas las solicitudes de contacto recibidas por el desarrollador activo.
 */
export async function getReceivedContactRequestsAction(): Promise<ActionResult<ContactRequestWithRecruiter[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        if (session.user.role !== "developer") {
            return { success: false, error: "Acceso denegado. Se requiere el rol de desarrollador." };
        }

        const requests = await db.contactRequest.findMany({
            where: { developerId: session.user.id },
            include: {
                recruiter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: requests as ContactRequestWithRecruiter[],
        };
    } catch (error: unknown) {
        console.error("[getReceivedContactRequestsAction] Error:", error);
        return {
            success: false,
            error: "Error al recuperar solicitudes de contacto.",
        };
    }
}

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

        revalidatePath("/dashboard");

        return {
            success: true,
            data: true,
        };
    } catch (error: unknown) {
        console.error("[acceptContactRequestAction] Error:", error);
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

        revalidatePath("/dashboard");

        return {
            success: true,
            data: true,
        };
    } catch (error: unknown) {
        console.error("[declineContactRequestAction] Error:", error);
        return {
            success: false,
            error: "Error al rechazar la solicitud de contacto.",
        };
    }
}
