"use server";

import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { trackServerEvent } from "@/lib/analytics";
import { checkJobMatchRateLimit, getClientIp } from "@/lib/rate-limit";
import type { JobMatch } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { JobMatchService } from "./service";
import type { ActionResult } from "@/lib/action-result";

interface CreateJobMatchActionInput {
    resumeId: string;
    jobOfferText: string;
}

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

        // Registrar analítica
        await trackServerEvent("job_match_completed", session.user.id, {
            matchScore: jobMatch.matchScore,
        });

        revalidatePath("/dashboard/job-match");

        return {
            success: true,
            data: jobMatch,
        };
    } catch (error: unknown) {
        logger.error("[createJobMatchAction] Error general:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Ocurrió un error inesperado al procesar el matching.",
        };
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
        logger.error("[generateSmartPitchAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al generar el pitch de valor.",
        };
    }
}
