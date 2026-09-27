"use server";

import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { isGuestSession, GUEST_WRITE_ERROR } from "@/lib/guest-guard";
import { RECRUITER_PENDING_ERROR } from "@/lib/recruiter-guard";
import { trackServerEvent } from "@/lib/analytics";
import { db } from "@/lib/db";
import { z } from "zod";
import { JobPostingService } from "./service";
import {
    checkJobPostingRateLimit,
    checkJobPostingApplyRateLimit,
    checkContentReportRateLimit,
    getClientIp,
} from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import type { JobPosting, JobPostingApplication } from "@prisma/client";

import { type JobPostingWithMatch, jobPostingSchema } from "./types";
import type { ActionResult } from "@/lib/action-result";

/**
 * Crea una oferta laboral en estado draft (Solo Recruiters).
 * Aplica Rate Limiting con Upstash.
 */
export async function createJobPostingAction(rawInput: unknown): Promise<ActionResult<JobPosting>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "recruiter") {
            return { success: false, error: "No autorizado. Solo reclutadores pueden realizar esta acción." };
        }
        const { db: verifiedDb } = await import("@/lib/db");
        const verifiedUser = await verifiedDb.user.findUnique({
            where: { id: session.user.id },
            select: { recruiterVerified: true },
        });
        if (!verifiedUser?.recruiterVerified && !isGuestSession(session)) {
            return { success: false, error: RECRUITER_PENDING_ERROR };
        }

        // Validar input con Zod
        const validation = jobPostingSchema.safeParse(rawInput);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues.map((e) => e.message).join(" "),
            };
        }

        const recruiterId = session.user.id;

        // Límite de velocidad
        const isGuest = session.user.isGuest === true;
        const identifier = isGuest ? `ip:${await getClientIp()}` : `user:${recruiterId}`;
        const limitResult = await checkJobPostingRateLimit(identifier);

        if (!limitResult.success) {
            const resetTime = new Date(limitResult.reset);
            const now = new Date();
            const diffMs = resetTime.getTime() - now.getTime();
            const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
            return {
                success: false,
                error: `Límite de publicaciones alcanzado (máximo 10 por día). Tu cuota se restablecerá en ${diffHours} ${diffHours === 1 ? "hora" : "horas"}.`,
            };
        }

        // Modo Demo/Guest: NO persistir. "guest-recruiter-id" es compartido por todas
        // las sesiones anónimas, así que un insert real contaminaría a otros visitantes.
        // El cliente maneja el estado localmente (ver handleSave en client-page.tsx),
        // por lo que devolver el objeto en memoria alcanza para toda la UI.
        if (isGuest) {
            const demoJob: JobPosting = {
                id: `demo-job-${Date.now()}`,
                recruiterId,
                title: validation.data.title,
                company: validation.data.company,
                location: validation.data.location,
                remoteType: validation.data.remoteType,
                description: validation.data.description,
                requiredSkills: validation.data.requiredSkills,
                seniorityLevel: validation.data.seniorityLevel,
                pipelineStages: validation.data.pipelineStages ?? [],
                status: "draft",
                expiresAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            return { success: true, data: demoJob };
        }

        const newJob = await JobPostingService.createJobPosting(recruiterId, validation.data);

        revalidatePath("/dashboard/recruiter/postings");
        return { success: true, data: newJob };
    } catch (error) {
        logger.error("[createJobPostingAction] Error:", error);
        return { success: false, error: (error as Error).message || "Error al crear la oferta de trabajo." };
    }
}
/**
 * Actualiza una oferta de trabajo existente (Solo Recruiters).
 */
export async function updateJobPostingAction(id: string, rawInput: unknown): Promise<ActionResult<JobPosting>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "recruiter") {
            return { success: false, error: "No autorizado." };
        }
        const { db: verifiedDb } = await import("@/lib/db");
        const verifiedUser = await verifiedDb.user.findUnique({
            where: { id: session.user.id },
            select: { recruiterVerified: true },
        });
        if (!verifiedUser?.recruiterVerified && !isGuestSession(session)) {
            return { success: false, error: RECRUITER_PENDING_ERROR };
        }

        // Validar input parcial con Zod
        const validation = jobPostingSchema.partial().safeParse(rawInput);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues.map((e) => e.message).join(" "),
            };
        }

        if (session.user.isGuest === true) {
            return { success: true, data: { id, ...validation.data } as unknown as JobPosting };
        }

        const updatedJob = await JobPostingService.updateJobPosting(session.user.id, id, validation.data);

        revalidatePath("/dashboard/recruiter/postings");
        return { success: true, data: updatedJob };
    } catch (error) {
        logger.error("[updateJobPostingAction] Error:", error);
        return { success: false, error: (error as Error).message || "Error al actualizar la oferta de trabajo." };
    }
}
/**
 * Publica una oferta de trabajo cambiando su estado a "published" (Solo Recruiters).
 */
export async function publishJobPostingAction(id: string): Promise<ActionResult<JobPosting>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "recruiter") {
            return { success: false, error: "No autorizado." };
        }
        const { db: verifiedDb } = await import("@/lib/db");
        const verifiedUser = await verifiedDb.user.findUnique({
            where: { id: session.user.id },
            select: { recruiterVerified: true },
        });
        if (!verifiedUser?.recruiterVerified && !isGuestSession(session)) {
            return { success: false, error: RECRUITER_PENDING_ERROR };
        }

        // Modo Demo/Guest: el posting tampoco existe en la DB (ver createJobPostingAction),
        // así que no hay nada para buscar/actualizar. El cliente no lee `data` en este caso
        // (solo `success`), por eso el cast es seguro.
        if (session.user.isGuest === true) {
            return { success: true, data: { id } as unknown as JobPosting };
        }

        const publishedJob = await JobPostingService.publishJobPosting(session.user.id, id);

        revalidatePath("/dashboard/recruiter/postings");
        revalidatePath("/dashboard/jobs");
        return { success: true, data: publishedJob };
    } catch (error) {
        logger.error("[publishJobPostingAction] Error:", error);
        return { success: false, error: (error as Error).message || "Error al publicar la oferta de trabajo." };
    }
}
/**
 * Cierra una oferta de trabajo cambiando su estado a "closed" (Solo Recruiters).
 */
export async function closeJobPostingAction(id: string): Promise<ActionResult<JobPosting>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "recruiter") {
            return { success: false, error: "No autorizado." };
        }
        const { db: verifiedDb } = await import("@/lib/db");
        const verifiedUser = await verifiedDb.user.findUnique({
            where: { id: session.user.id },
            select: { recruiterVerified: true },
        });
        if (!verifiedUser?.recruiterVerified && !isGuestSession(session)) {
            return { success: false, error: RECRUITER_PENDING_ERROR };
        }

        if (session.user.isGuest === true) {
            return { success: true, data: { id } as unknown as JobPosting };
        }

        const closedJob = await JobPostingService.closeJobPosting(session.user.id, id);

        revalidatePath("/dashboard/recruiter/postings");
        revalidatePath("/dashboard/jobs");
        return { success: true, data: closedJob };
    } catch (error) {
        logger.error("[closeJobPostingAction] Error:", error);
        return { success: false, error: (error as Error).message || "Error al cerrar la oferta de trabajo." };
    }
}
/**
 * Actualiza el estado de una postulación (Solo Recruiters).
 */
export async function updateApplicationStatusAction(
    applicationId: string,
    newStatus: string,
): Promise<ActionResult<JobPostingApplication>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "recruiter") {
            return { success: false, error: "No autorizado." };
        }
        if (!/^[a-z0-9_]{1,24}$/.test(newStatus.trim().toLowerCase())) {
            return { success: false, error: "Estado inválido." };
        }
        const { db: verifiedDb } = await import("@/lib/db");
        const verifiedUser = await verifiedDb.user.findUnique({
            where: { id: session.user.id },
            select: { recruiterVerified: true },
        });
        if (!verifiedUser?.recruiterVerified && !isGuestSession(session)) {
            return { success: false, error: RECRUITER_PENDING_ERROR };
        }
        if (isGuestSession(session)) {
            return { success: false, error: GUEST_WRITE_ERROR };
        }

        const updatedApp = await JobPostingService.updateApplicationStatus(session.user.id, applicationId, newStatus);

        revalidatePath(`/dashboard/recruiter/postings/${updatedApp.jobPostingId}/applications`);
        return { success: true, data: updatedApp };
    } catch (error) {
        logger.error("[updateApplicationStatusAction] Error:", error);
        return {
            success: false,
            error: (error as Error).message || "Error al actualizar el estado de la postulación.",
        };
    }
}

/**
 * Obtiene el listado del Job Board para desarrolladores, con scores de matching de IA cacheados.
 */
export async function getDeveloperJobBoardAction(filters?: {
    remoteType?: string;
    seniorityLevel?: string;
    search?: string;
}): Promise<ActionResult<JobPostingWithMatch[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "developer") {
            return { success: false, error: "No autorizado. Solo desarrolladores pueden ver el Job Board." };
        }

        const jobs = await JobPostingService.getDeveloperJobBoard(session.user.id, filters);
        return { success: true, data: jobs as JobPostingWithMatch[] };
    } catch (error) {
        logger.error("[getDeveloperJobBoardAction] Error:", error);
        return { success: false, error: "Error al cargar las ofertas del Job Board." };
    }
}
/**
 * Permite a un desarrollador postularse a una oferta laboral activa.
 * Aplica Rate Limiting de Upstash (máx 20 postulaciones por día).
 */
export async function applyToJobPostingAction(jobPostingId: string): Promise<ActionResult<JobPostingApplication>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "developer") {
            return { success: false, error: "No autorizado. Solo desarrolladores pueden postularse." };
        }
        if (isGuestSession(session)) {
            return { success: false, error: GUEST_WRITE_ERROR };
        }

        const developerId = session.user.id;

        // Verificar que la oferta exista y esté publicada y no expirada
        const jobPosting = await db.jobPosting.findUnique({
            where: { id: jobPostingId },
        });

        if (
            !jobPosting ||
            jobPosting.status !== "published" ||
            (jobPosting.expiresAt && jobPosting.expiresAt < new Date())
        ) {
            return {
                success: false,
                error: "No puedes postularte a esta oferta. Puede haber expirado, cerrado o estar bajo revisión.",
            };
        }

        // Rate Limiting
        const isGuest = session.user.isGuest === true;
        const identifier = isGuest ? `ip:${await getClientIp()}` : `user:${developerId}`;
        const limitResult = await checkJobPostingApplyRateLimit(identifier);

        if (!limitResult.success) {
            const resetTime = new Date(limitResult.reset);
            const now = new Date();
            const diffMs = resetTime.getTime() - now.getTime();
            const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
            return {
                success: false,
                error: `Has alcanzado el límite diario de postulaciones (máximo 20 por día). Tu cuota se restablecerá en ${diffHours} ${diffHours === 1 ? "hora" : "horas"}.`,
            };
        }

        const application = await JobPostingService.applyToJobPosting(developerId, jobPostingId);

        // Registrar analítica
        await trackServerEvent("job_posting_applied", developerId, { jobPostingId });

        revalidatePath("/dashboard/jobs");
        revalidatePath("/dashboard/job-tracker");
        return { success: true, data: application };
    } catch (error) {
        logger.error("[applyToJobPostingAction] Error:", error);
        return { success: false, error: (error as Error).message || "Error al enviar tu postulación." };
    }
}

/**
 * Reportar una oferta laboral o solicitud de contacto.
 * Aplica Rate Limiting con Upstash (máximo 5 reportes por día).
 */
export async function createReportAction(rawInput: unknown): Promise<ActionResult<boolean>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }
        if (isGuestSession(session)) {
            return { success: false, error: GUEST_WRITE_ERROR };
        }

        const reportSchema = z.object({
            targetType: z.enum(["job_posting", "contact_request"]),
            targetId: z.string().min(1),
            reason: z.string().min(5, "El motivo debe tener al menos 5 caracteres.").max(500),
        });

        const validation = reportSchema.safeParse(rawInput);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues.map((e) => e.message).join(" "),
            };
        }

        const reporterId = session.user.id;

        // Rate Limiting
        const isGuest = session.user.isGuest === true;
        const identifier = isGuest ? `ip:${await getClientIp()}` : `user:${reporterId}`;
        const limitResult = await checkContentReportRateLimit(identifier);

        if (!limitResult.success) {
            logger.warn(
                `🛡️ [RateLimit] Reporte de contenido bloqueado para el usuario ${reporterId}. Excedió límite de 5/día.`,
            );
            const resetTime = new Date(limitResult.reset);
            const now = new Date();
            const diffMs = resetTime.getTime() - now.getTime();
            const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
            return {
                success: false,
                error: `Límite diario de reportes alcanzado (máximo 5 por día). Tu cuota se restablecerá en ${diffHours} ${diffHours === 1 ? "hora" : "horas"}.`,
            };
        }

        await JobPostingService.createContentReport(reporterId, validation.data);

        revalidatePath("/dashboard/jobs");
        return { success: true, data: true };
    } catch (error) {
        logger.error("[createReportAction] Error:", error);
        return { success: false, error: (error as Error).message || "Error al enviar el reporte." };
    }
}

/**
 * Extiende la expiración de una oferta laboral por 30 días más (Solo Recruiters).
 */
export async function extendJobPostingExpirationAction(id: string): Promise<ActionResult<JobPosting>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "recruiter") {
            return { success: false, error: "No autorizado." };
        }
        const { db: verifiedDb } = await import("@/lib/db");
        const verifiedUser = await verifiedDb.user.findUnique({
            where: { id: session.user.id },
            select: { recruiterVerified: true },
        });
        if (!verifiedUser?.recruiterVerified && !isGuestSession(session)) {
            return { success: false, error: RECRUITER_PENDING_ERROR };
        }
        if (isGuestSession(session)) {
            return { success: false, error: GUEST_WRITE_ERROR };
        }

        const updatedJob = await JobPostingService.extendJobPostingExpiration(session.user.id, id);

        revalidatePath("/dashboard/recruiter/postings");
        return { success: true, data: updatedJob };
    } catch (error) {
        logger.error("[extendJobPostingExpirationAction] Error:", error);
        return {
            success: false,
            error: (error as Error).message || "Error al extender la expiración de la oferta.",
        };
    }
}

/**
 * Permite a un desarrollador retirar su postulación a una oferta laboral.
 */
export async function withdrawApplicationAction(jobPostingId: string): Promise<ActionResult<JobPostingApplication>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "developer") {
            return { success: false, error: "No autorizado. Solo desarrolladores pueden retirar sus postulaciones." };
        }
        if (isGuestSession(session)) {
            return { success: false, error: GUEST_WRITE_ERROR };
        }

        const developerId = session.user.id;

        const application = await JobPostingService.withdrawApplication(developerId, jobPostingId);

        revalidatePath("/dashboard/jobs");
        revalidatePath("/dashboard/job-tracker");
        return { success: true, data: application };
    } catch (error) {
        logger.error("[withdrawApplicationAction] Error:", error);
        return { success: false, error: (error as Error).message || "Error al retirar tu postulación." };
    }
}
