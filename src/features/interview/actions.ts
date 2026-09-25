"use server";

import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { InterviewService } from "./service";
import { InterviewRepository } from "./repository";
import { revalidatePath } from "next/cache";

export async function startInterviewAction() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado. Por favor inicia sesión." };
    }

    try {
        const result = await InterviewService.startSession(session.user.id);
        return { success: true, data: result };
    } catch (error: unknown) {
        logger.error("[startInterviewAction] Error:", error);
        return { success: false, error: "Error al iniciar la sesión de entrevista." };
    }
}

export async function saveInterviewMessagesAction(id: string, messages: Array<{ role: string; content: string }>) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado." };
    }

    try {
        await InterviewRepository.updateMessages(id, session.user.id, messages);
        return { success: true };
    } catch (error: unknown) {
        logger.error("[saveInterviewMessagesAction] Error:", error);
        return { success: false, error: "Error al guardar el historial del chat." };
    }
}

export async function finishInterviewAction(
    id: string,
    mode: "standard" | "pressure" | "recruiter_simulation" = "standard",
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado." };
    }

    try {
        const debrief = await InterviewService.finishAndDebrief(id, session.user.id, mode);
        revalidatePath("/dashboard"); // Revalidar historial y timelines
        revalidatePath("/dashboard/interview");
        return { success: true, data: debrief };
    } catch (error: unknown) {
        logger.error("[finishInterviewAction] Error:", error);
        const msg = error instanceof Error ? error.message : "Error al procesar el reporte final.";
        return { success: false, error: msg };
    }
}

export interface InterviewHistoryItem {
    id: string;
    score: number | null;
    mode: string | null;
    company: string | null;
    createdAt: string;
}

/**
 * Historial de sesiones de entrevista del usuario (para la lista en /interview).
 */
export async function getInterviewHistoryAction(): Promise<
    { success: true; data: InterviewHistoryItem[] } | { success: false; error: string }
> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado." };
    }
    try {
        const sessions = await InterviewRepository.listByUserId(session.user.id);
        return {
            success: true,
            data: sessions.slice(0, 20).map((s) => {
                const debrief = (s.debrief ?? {}) as { mode?: string };
                return {
                    id: s.id,
                    score: s.score,
                    mode: typeof debrief.mode === "string" ? debrief.mode : null,
                    company: (s as { company?: string | null }).company ?? null,
                    createdAt: s.createdAt.toISOString(),
                };
            }),
        };
    } catch (error: unknown) {
        logger.error("[getInterviewHistoryAction] Error:", error);
        return { success: false, error: "Error al cargar el historial." };
    }
}
