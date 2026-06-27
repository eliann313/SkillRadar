"use server";

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
        console.error("[startInterviewAction] Error:", error);
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
        console.error("[saveInterviewMessagesAction] Error:", error);
        return { success: false, error: "Error al guardar el historial del chat." };
    }
}

export async function finishInterviewAction(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado." };
    }

    try {
        const debrief = await InterviewService.finishAndDebrief(id, session.user.id);
        revalidatePath("/dashboard"); // Revalidar historial y timelines
        return { success: true, data: debrief };
    } catch (error: unknown) {
        console.error("[finishInterviewAction] Error:", error);
        const msg = error instanceof Error ? error.message : "Error al procesar el reporte final.";
        return { success: false, error: msg };
    }
}
