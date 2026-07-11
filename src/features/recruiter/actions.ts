"use server";

import { auth } from "@/lib/auth";
import { trackServerEvent } from "@/lib/analytics";
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

        // Asegurar que el usuario reclutador demo existe en DB para cumplir las FKeys
        if (session.user.id === "guest-recruiter-id") {
            const { db } = await import("@/lib/db");
            await db.user.upsert({
                where: { id: "guest-recruiter-id" },
                update: {},
                create: {
                    id: "guest-recruiter-id",
                    name: "Demo Recruiter",
                    email: "recruiter-guest@skillradar.dev",
                    role: "recruiter",
                },
            });
        }

        const request = await RecruiterService.createContactRequest({
            recruiterId: session.user.id,
            developerId,
            message,
        });

        // Registrar analítica
        await trackServerEvent("contact_request_sent", session.user.id, { developerId });

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

/**
 * Alterna el estado de favoritos (shortlist) de un reclutador sobre un desarrollador.
 */
export async function toggleShortlistAction(developerId: string): Promise<ActionResult<boolean>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        if (session.user.role !== "recruiter") {
            return { success: false, error: "Acceso denegado. Se requiere el rol de reclutador." };
        }

        if (!developerId) {
            return { success: false, error: "ID de desarrollador inválido." };
        }

        // Asegurar que el usuario reclutador demo existe en DB para cumplir las FKeys
        if (session.user.id === "guest-recruiter-id") {
            const { db } = await import("@/lib/db");
            await db.user.upsert({
                where: { id: "guest-recruiter-id" },
                update: {},
                create: {
                    id: "guest-recruiter-id",
                    name: "Demo Recruiter",
                    email: "recruiter-guest@skillradar.dev",
                    role: "recruiter",
                },
            });
        }

        const isShortlisted = await RecruiterService.toggleShortlist({
            recruiterId: session.user.id,
            developerId,
        });

        revalidatePath("/dashboard");

        return {
            success: true,
            data: isShortlisted,
        };
    } catch (error: unknown) {
        console.error("[toggleShortlistAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al actualizar la shortlist.",
        };
    }
}

/**
 * Obtiene el listado de habilidades agregadas para Market Intelligence.
 */
export async function getMarketIntelligenceSkillsAction(): Promise<ActionResult<{ name: string; value: number }[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        if (session.user.role !== "recruiter") {
            return { success: false, error: "Acceso denegado." };
        }

        const skills = await RecruiterService.getMarketIntelligenceSkills();

        return {
            success: true,
            data: skills,
        };
    } catch (error: unknown) {
        console.error("[getMarketIntelligenceSkillsAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al obtener Market Intelligence.",
        };
    }
}

/**
 * Genera de 3 a 5 preguntas de entrevista técnica y respuestas esperadas.
 */
export async function generateInterviewQuestionsAction(
    developerId: string,
    jobDescription: string,
): Promise<ActionResult<{ question: string; expectedResponse: string }[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        if (session.user.role !== "recruiter") {
            return { success: false, error: "Acceso denegado. Se requiere el rol de reclutador." };
        }

        if (!developerId || !jobDescription.trim()) {
            return { success: false, error: "Parámetros de entrada inválidos." };
        }

        const questions = await RecruiterService.generateInterviewQuestions({
            developerId,
            recruiterId: session.user.id,
            jobDescription,
        });

        return {
            success: true,
            data: questions,
        };
    } catch (error: unknown) {
        console.error("[generateInterviewQuestionsAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al generar la guía de preguntas de entrevista.",
        };
    }
}
