"use server";

import { auth } from "@/lib/auth";
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

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

// Zod Schema para validación de datos de oferta laboral
export const jobPostingSchema = z.object({
    title: z.string().min(2, "El título es obligatorio y debe tener al menos 2 caracteres.").max(150),
    company: z.string().min(2, "El nombre de la empresa es obligatorio.").max(100),
    location: z.string().min(2, "La ubicación es obligatoria.").max(100),
    remoteType: z.enum(["remote", "hybrid", "onsite"], {
        errorMap: () => ({ message: "Tipo de trabajo inválido." }),
    }),
    description: z.string().min(10, "La descripción es obligatoria y debe tener al menos 10 caracteres."),
    requiredSkills: z.array(z.string()).min(1, "Debe agregar al menos una habilidad requerida."),
    seniorityLevel: z.string().min(2, "El nivel de seniority es obligatorio."),
});

export type JobPostingWithCount = JobPosting & {
    _count: {
        applications: number;
    };
};

export type JobPostingWithMatch = JobPosting & {
    matchScore: number | null;
    hasApplied: boolean;
};

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

        // Validar input con Zod
        const validation = jobPostingSchema.safeParse(rawInput);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.errors.map((e) => e.message).join(" "),
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

        const newJob = await JobPostingService.createJobPosting(recruiterId, validation.data);

        revalidatePath("/dashboard/recruiter/postings");
        return { success: true, data: newJob };
    } catch (error) {
        console.error("[createJobPostingAction] Error:", error);
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

        // Validar input parcial con Zod
        const validation = jobPostingSchema.partial().safeParse(rawInput);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.errors.map((e) => e.message).join(" "),
            };
        }

        const updatedJob = await JobPostingService.updateJobPosting(session.user.id, id, validation.data);

        revalidatePath("/dashboard/recruiter/postings");
        return { success: true, data: updatedJob };
    } catch (error) {
        console.error("[updateJobPostingAction] Error:", error);
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

        const publishedJob = await JobPostingService.publishJobPosting(session.user.id, id);

        revalidatePath("/dashboard/recruiter/postings");
        revalidatePath("/dashboard/jobs");
        return { success: true, data: publishedJob };
    } catch (error) {
        console.error("[publishJobPostingAction] Error:", error);
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

        const closedJob = await JobPostingService.closeJobPosting(session.user.id, id);

        revalidatePath("/dashboard/recruiter/postings");
        revalidatePath("/dashboard/jobs");
        return { success: true, data: closedJob };
    } catch (error) {
        console.error("[closeJobPostingAction] Error:", error);
        return { success: false, error: (error as Error).message || "Error al cerrar la oferta de trabajo." };
    }
}

/**
 * Obtiene las ofertas de trabajo creadas por el reclutador autenticado.
 */
export async function getRecruiterJobPostingsAction(): Promise<ActionResult<JobPostingWithCount[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "recruiter") {
            return { success: false, error: "No autorizado." };
        }

        const jobs = await JobPostingService.getRecruiterJobPostings(session.user.id);
        return { success: true, data: jobs as JobPostingWithCount[] };
    } catch (error) {
        console.error("[getRecruiterJobPostingsAction] Error:", error);
        return { success: false, error: "Error al cargar las ofertas de trabajo." };
    }
}

/**
 * Obtiene las postulaciones recibidas para una oferta de trabajo.
 * Valida internamente propiedad para evitar IDOR.
 */
export async function getJobPostingApplicationsAction(jobPostingId: string): Promise<ActionResult<unknown[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "recruiter") {
            return { success: false, error: "No autorizado." };
        }

        const apps = await JobPostingService.getJobPostingApplications(session.user.id, jobPostingId);
        return { success: true, data: apps };
    } catch (error) {
        console.error("[getJobPostingApplicationsAction] Error:", error);
        return { success: false, error: (error as Error).message || "Error al cargar las postulaciones." };
    }
}

/**
 * Actualiza el estado de una postulación (Solo Recruiters).
 */
export async function updateApplicationStatusAction(
    applicationId: string,
    newStatus: "submitted" | "reviewed" | "rejected" | "shortlisted",
): Promise<ActionResult<JobPostingApplication>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "recruiter") {
            return { success: false, error: "No autorizado." };
        }

        const updatedApp = await JobPostingService.updateApplicationStatus(session.user.id, applicationId, newStatus);

        revalidatePath(`/dashboard/recruiter/postings/${updatedApp.jobPostingId}/applications`);
        return { success: true, data: updatedApp };
    } catch (error) {
        console.error("[updateApplicationStatusAction] Error:", error);
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
        console.error("[getDeveloperJobBoardAction] Error:", error);
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

        revalidatePath("/dashboard/jobs");
        revalidatePath("/dashboard/job-tracker");
        return { success: true, data: application };
    } catch (error) {
        console.error("[applyToJobPostingAction] Error:", error);
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

        const reportSchema = z.object({
            targetType: z.enum(["job_posting", "contact_request"]),
            targetId: z.string().min(1),
            reason: z.string().min(5, "El motivo debe tener al menos 5 caracteres.").max(500),
        });

        const validation = reportSchema.safeParse(rawInput);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.errors.map((e) => e.message).join(" "),
            };
        }

        const reporterId = session.user.id;

        // Rate Limiting
        const isGuest = session.user.isGuest === true;
        const identifier = isGuest ? `ip:${await getClientIp()}` : `user:${reporterId}`;
        const limitResult = await checkContentReportRateLimit(identifier);

        if (!limitResult.success) {
            console.warn(
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
        console.error("[createReportAction] Error:", error);
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

        const updatedJob = await JobPostingService.extendJobPostingExpiration(session.user.id, id);

        revalidatePath("/dashboard/recruiter/postings");
        return { success: true, data: updatedJob };
    } catch (error) {
        console.error("[extendJobPostingExpirationAction] Error:", error);
        return {
            success: false,
            error: (error as Error).message || "Error al extender la expiración de la oferta.",
        };
    }
}
