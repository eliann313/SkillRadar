"use server";

import { auth } from "@/lib/auth";
import { RecruiterService, type RankedCandidate } from "./service";
import type { ActionResult } from "@/features/job-match/types";
import { revalidatePath } from "next/cache";
import type { ContactRequest } from "@prisma/client";

/**
 * Obtiene el pool de talentos ordenados y evaluados por IA contra una JD.
 */
export async function rankTalentPoolAction(jobDescription: string): Promise<ActionResult<RankedCandidate[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        if (session.user.role !== "recruiter") {
            return { success: false, error: "Acceso denegado. Se requiere el rol de reclutador." };
        }

        if (!jobDescription.trim()) {
            return { success: false, error: "La descripción del empleo no puede estar vacía." };
        }

        const rankedCandidates = await RecruiterService.rankTalentPool({
            recruiterId: session.user.id,
            jobDescription,
        });

        return {
            success: true,
            data: rankedCandidates,
        };
    } catch (error: unknown) {
        console.error("[rankTalentPoolAction] Error general:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Ocurrió un error al rankear candidatos.",
        };
    }
}

/**
 * Crea una propuesta de contacto de reclutador hacia un desarrollador.
 */
export async function createContactRequestAction(
    developerId: string,
    message: string,
): Promise<ActionResult<ContactRequest>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        if (session.user.role !== "recruiter") {
            return { success: false, error: "Acceso denegado. Se requiere el rol de reclutador." };
        }

        if (!developerId || !message.trim()) {
            return { success: false, error: "Campos de entrada inválidos." };
        }

        const request = await RecruiterService.createContactRequest({
            recruiterId: session.user.id,
            developerId,
            message,
        });

        revalidatePath("/dashboard");

        return {
            success: true,
            data: request,
        };
    } catch (error: unknown) {
        console.error("[createContactRequestAction] Error general:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Ocurrió un error al enviar la propuesta.",
        };
    }
}
