"use server";

import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { trackServerEvent } from "@/lib/analytics";
import { checkProactiveMatchingRateLimit } from "@/lib/rate-limit";
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

        const rl = await checkProactiveMatchingRateLimit(`user:${session.user.id}`);
        if (!rl.success) {
            return { success: false, error: "Límite diario de sourcing IA alcanzado. Inténtalo mañana." };
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
        logger.error("[rankTalentPoolAction] Error general:", error);
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

        // Modo Demo/Guest: solo lectura. guest-recruiter-id es compartido entre
        // todos los visitantes, por lo que nunca debe persistir en la DB real
        // (evita contaminación cruzada: un demo pide contacto, el dev acepta y
        // otro visitante vería los datos revelados).
        if (session.user.isGuest || session.user.id === "guest-recruiter-id") {
            return {
                success: true,
                data: {
                    id: `demo-contact-${Date.now()}`,
                    recruiterId: session.user.id,
                    developerId,
                    message: message.trim().slice(0, 500),
                    status: "pending",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as ContactRequest,
            };
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
        logger.error("[createContactRequestAction] Error general:", error);
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

        // Modo Demo/Guest: solo lectura, sin persistencia compartida.
        if (session.user.isGuest || session.user.id === "guest-recruiter-id") {
            return { success: true, data: true };
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
        logger.error("[toggleShortlistAction] Error:", error);
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
        logger.error("[getMarketIntelligenceSkillsAction] Error:", error);
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

        if (!developerId) {
            return { success: false, error: "Parámetros de entrada inválidos. Falta el ID del candidato." };
        }

        const jd = jobDescription?.trim() || "";

        const rl = await checkProactiveMatchingRateLimit(`user:${session.user.id}`);
        if (!rl.success) {
            return { success: false, error: "Límite diario de guías de entrevista alcanzado." };
        }

        const questions = await RecruiterService.generateInterviewQuestions({
            developerId,
            recruiterId: session.user.id,
            jobDescription: jd,
        });

        return {
            success: true,
            data: questions,
        };
    } catch (error: unknown) {
        logger.error("[generateInterviewQuestionsAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al generar la guía de preguntas de entrevista.",
        };
    }
}

/**
 * Realiza una búsqueda avanzada con IA (Headhunting con IA) sobre el Talent Pool.
 */
export async function searchTalentPoolAIAction(query: string): Promise<ActionResult<RankedCandidate[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        if (session.user.role !== "recruiter") {
            return { success: false, error: "Acceso denegado. Se requiere el rol de reclutador." };
        }

        if (!query.trim()) {
            return { success: false, error: "La consulta de búsqueda no puede estar vacía." };
        }

        const rl = await checkProactiveMatchingRateLimit(`user:${session.user.id}`);
        if (!rl.success) {
            return { success: false, error: "Límite diario de búsqueda IA alcanzado. Inténtalo mañana." };
        }

        const rankedCandidates = await RecruiterService.searchTalentPoolAI({
            recruiterId: session.user.id,
            query,
        });

        return {
            success: true,
            data: rankedCandidates,
        };
    } catch (error: unknown) {
        logger.error("[searchTalentPoolAIAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Ocurrió un error en el buscador de IA.",
        };
    }
}

/**
 * Genera un resumen ejecutivo personalizado por IA (AI Candidate Pitch).
 */
export async function generateCandidatePitchSummaryAction(developerId: string): Promise<ActionResult<string>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        if (session.user.role !== "recruiter") {
            return { success: false, error: "Acceso denegado." };
        }

        const summary = await RecruiterService.generateCandidatePitchSummary({
            recruiterId: session.user.id,
            developerId,
        });

        return {
            success: true,
            data: summary,
        };
    } catch (error: unknown) {
        logger.error("[generateCandidatePitchSummaryAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al generar el resumen de IA.",
        };
    }
}

/**
 * Genera una propuesta de contacto (AI Outreach) personalizada.
 */
export async function generateCandidateOutreachAction(
    developerId: string,
    jobTitle: string,
    company: string,
): Promise<ActionResult<string>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        if (session.user.role !== "recruiter") {
            return { success: false, error: "Acceso denegado." };
        }

        const message = await RecruiterService.generateCandidateOutreach({
            recruiterId: session.user.id,
            developerId,
            jobTitle,
            company,
        });

        return {
            success: true,
            data: message,
        };
    } catch (error: unknown) {
        logger.error("[generateCandidateOutreachAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al generar el mensaje de contacto.",
        };
    }
}

/**
 * Obtiene métricas agregadas e interacciones para el Market Intelligence.
 */
export async function getMarketIntelligenceDataAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        if (session.user.role !== "recruiter") {
            return { success: false, error: "Acceso denegado." };
        }

        const data = await RecruiterService.getMarketIntelligenceData();

        return {
            success: true,
            data,
        };
    } catch (error: unknown) {
        logger.error("[getMarketIntelligenceDataAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al obtener Market Intelligence.",
        };
    }
}

export interface SentContactRequest {
    id: string;
    developerId: string;
    message: string;
    status: string;
    createdAt: string;
    messageCount: number;
    lastMessageAt: string | null;
}

/**
 * Bandeja del recruiter: solicitudes enviadas con conteo de mensajes del thread.
 */
export async function getSentContactRequestsAction(): Promise<ActionResult<SentContactRequest[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "recruiter") {
            return { success: false, error: "No autorizado." };
        }
        if (session.user.isGuest) {
            return { success: true, data: [] };
        }

        const { db } = await import("@/lib/db");
        const requests = await db.contactRequest.findMany({
            where: { recruiterId: session.user.id },
            include: {
                _count: { select: { messages: true } },
                messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: requests.map((r) => ({
                id: r.id,
                developerId: r.developerId,
                message: r.message,
                status: r.status,
                createdAt: r.createdAt.toISOString(),
                messageCount: r._count.messages,
                lastMessageAt: r.messages[0]?.createdAt.toISOString() ?? null,
            })),
        };
    } catch (error: unknown) {
        logger.error("[getSentContactRequestsAction] Error:", error);
        return { success: false, error: "Error al cargar la bandeja." };
    }
}
