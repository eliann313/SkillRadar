"use server";

import { auth } from "@/lib/auth";
import { checkJobMatchRateLimit, getClientIp } from "@/lib/rate-limit";
import type { JobMatch, Resume } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { JobMatchService } from "./service";
import type { ActionResult } from "./types";

interface CreateJobMatchActionInput {
    resumeId: string;
    jobOfferText: string;
}

export type JobMatchWithResume = JobMatch & { resume: Resume | null };

export async function createJobMatchAction(input: CreateJobMatchActionInput): Promise<ActionResult<JobMatch>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        const { resumeId, jobOfferText } = input;
        if (!resumeId || !jobOfferText.trim()) {
            return { success: false, error: "Campos de entrada inválidos." };
        }

        // Validar Rate Limits
        const isGuest = session.user.isGuest === true;
        const identifier = isGuest ? `ip:${await getClientIp()}` : `user:${session.user.id}`;
        const limitResult = await checkJobMatchRateLimit(identifier);

        if (!limitResult.success) {
            const resetTime = new Date(limitResult.reset);
            const now = new Date();
            const diffMs = resetTime.getTime() - now.getTime();
            const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
            return {
                success: false,
                error: `Has alcanzado el límite diario de Job Matches (10 por día). Tu cuota se restablecerá en ${diffHours} ${diffHours === 1 ? "hora" : "horas"}.`,
            };
        }

        // Crear y calcular match
        const jobMatch = await JobMatchService.createJobMatch({
            userId: session.user.id,
            resumeId,
            jobOfferText,
        });

        revalidatePath("/dashboard/job-match");

        return {
            success: true,
            data: jobMatch,
        };
    } catch (error: unknown) {
        console.error("[createJobMatchAction] Error general:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Ocurrió un error inesperado al procesar el matching.",
        };
    }
}

export async function getJobMatchesHistoryAction(): Promise<ActionResult<JobMatchWithResume[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const history = await JobMatchService.getJobMatchesHistory(session.user.id);
        return { success: true, data: history };
    } catch (error: unknown) {
        console.error("[getJobMatchesHistoryAction] Error general:", error);
        return { success: false, error: "Error al recuperar historial de matches." };
    }
}

export async function deleteJobMatchAction(id: string): Promise<ActionResult<boolean>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        await JobMatchService.deleteJobMatch(id, session.user.id);
        revalidatePath("/dashboard/job-match");

        return { success: true, data: true };
    } catch (error: unknown) {
        console.error("[deleteJobMatchAction] Error general:", error);
        return { success: false, error: "Error al eliminar el registro de matching." };
    }
}

export async function generateSmartPitchAction(jobMatchId: string): Promise<ActionResult<string>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const pitch = await JobMatchService.generateSmartPitch(jobMatchId, session.user.id);
        return { success: true, data: pitch };
    } catch (error: unknown) {
        console.error("[generateSmartPitchAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al generar el pitch de valor.",
        };
    }
}
