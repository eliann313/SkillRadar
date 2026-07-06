import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { JobMatchService } from "@/features/job-match/service";
import { RecruiterService } from "@/features/recruiter/service";
import type { Prisma, JobPosting, JobPostingApplication, ContactRequest } from "@prisma/client";

export interface JobPostingData {
    title: string;
    company: string;
    location: string;
    remoteType: "remote" | "hybrid" | "onsite";
    description: string;
    requiredSkills: string[];
    seniorityLevel: string;
}

export class JobPostingService {
    /**
     * Crea una oferta de trabajo en estado draft.
     * Sanitiza description y title antes de persistir.
     */
    static async createJobPosting(recruiterId: string, data: JobPostingData): Promise<JobPosting> {
        const titleSanitized = RecruiterService.sanitize(data.title);
        const descriptionSanitized = RecruiterService.sanitize(data.description);
        const companySanitized = RecruiterService.sanitize(data.company);
        const locationSanitized = RecruiterService.sanitize(data.location);

        return await db.jobPosting.create({
            data: {
                recruiterId,
                title: titleSanitized,
                description: descriptionSanitized,
                company: companySanitized,
                location: locationSanitized,
                remoteType: data.remoteType,
                requiredSkills: data.requiredSkills,
                seniorityLevel: data.seniorityLevel,
                status: "draft",
            },
        });
    }

    /**
     * Actualiza una oferta de trabajo.
     * Verifica ownership (recruiterId) para evitar IDOR.
     */
    static async updateJobPosting(recruiterId: string, id: string, data: Partial<JobPostingData>): Promise<JobPosting> {
        const jobPosting = await db.jobPosting.findUnique({
            where: { id },
        });

        if (!jobPosting) {
            throw new Error("Oferta de trabajo no encontrada.");
        }

        if (jobPosting.recruiterId !== recruiterId) {
            throw new Error("Acceso denegado. No eres el propietario de esta oferta.");
        }

        const updateData: Prisma.JobPostingUpdateInput = {};
        if (data.title) updateData.title = RecruiterService.sanitize(data.title);
        if (data.description) updateData.description = RecruiterService.sanitize(data.description);
        if (data.company) updateData.company = RecruiterService.sanitize(data.company);
        if (data.location) updateData.location = RecruiterService.sanitize(data.location);
        if (data.remoteType) updateData.remoteType = data.remoteType;
        if (data.requiredSkills) updateData.requiredSkills = data.requiredSkills;
        if (data.seniorityLevel) updateData.seniorityLevel = data.seniorityLevel;

        return await db.jobPosting.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Publica una oferta de trabajo.
     * Dispara el trigger de matching masivo (con límite de 10 devs más recientes para evitar spam)
     * y notifica si el match score >= 75%.
     */
    static async publishJobPosting(recruiterId: string, id: string): Promise<JobPosting> {
        const jobPosting = await db.jobPosting.findUnique({
            where: { id },
        });

        if (!jobPosting) {
            throw new Error("Oferta de trabajo no encontrada.");
        }

        if (jobPosting.recruiterId !== recruiterId) {
            throw new Error("Acceso denegado. No eres el propietario de esta oferta.");
        }

        const updatedPosting = await db.jobPosting.update({
            where: { id },
            data: { status: "published" },
        });

        // Iniciar el trigger de matching asíncronamente para no bloquear el request principal
        void this.triggerProactiveMatching(updatedPosting.id);

        return updatedPosting;
    }

    /**
     * Cierra una oferta de trabajo.
     */
    static async closeJobPosting(recruiterId: string, id: string): Promise<JobPosting> {
        const jobPosting = await db.jobPosting.findUnique({
            where: { id },
        });

        if (!jobPosting) {
            throw new Error("Oferta de trabajo no encontrada.");
        }

        if (jobPosting.recruiterId !== recruiterId) {
            throw new Error("Acceso denegado. No eres el propietario de esta oferta.");
        }

        return await db.jobPosting.update({
            where: { id },
            data: { status: "closed" },
        });
    }

    /**
     * Obtiene las ofertas de trabajo de un reclutador con conteo de postulaciones.
     */
    static async getRecruiterJobPostings(recruiterId: string) {
        return await db.jobPosting.findMany({
            where: { recruiterId },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { applications: true },
                },
            },
        });
    }

    /**
     * Obtiene o calcula el score de afinidad para una oferta laboral contra el CV de un dev.
     * Utiliza cacheado persistente.
     */
    static async getOrCalculateMatchScore(
        resumeId: string,
        jobPostingId: string,
        jobOfferText: string,
        developerId: string,
    ) {
        // 1. Intentar obtener de la caché
        const cached = await db.jobPostingMatchCache.findUnique({
            where: {
                resumeId_jobPostingId: {
                    resumeId,
                    jobPostingId,
                },
            },
        });

        if (cached) {
            return {
                matchScore: cached.matchScore,
                analysis: cached.analysis,
            };
        }

        // 2. Si no existe, invocar la IA mediante JobMatchService
        try {
            const jobMatch = await JobMatchService.createJobMatch({
                userId: developerId,
                resumeId,
                jobOfferText,
            });

            const score = jobMatch.matchScore || 0;
            const analysis = jobMatch.analysis || {};

            // 3. Guardar en caché
            await db.jobPostingMatchCache.create({
                data: {
                    resumeId,
                    jobPostingId,
                    matchScore: score,
                    analysis: analysis as Prisma.InputJsonValue,
                },
            });

            return {
                matchScore: score,
                analysis,
            };
        } catch (error) {
            console.error(
                `[getOrCalculateMatchScore] Error calculando match para resume ${resumeId} y job ${jobPostingId}:`,
                error,
            );
            // Retornar fallback para no romper toda la lista
            return {
                matchScore: 0,
                analysis: { error: "No se pudo calcular el matching" },
            };
        }
    }

    /**
     * Job board para developers. Retorna las ofertas publicadas e incluye el match score contra su CV activo.
     */
    static async getDeveloperJobBoard(
        developerId: string,
        filters?: { remoteType?: string; seniorityLevel?: string; search?: string },
    ) {
        // 1. Obtener el CV activo del developer
        const latestResume = await db.resume.findFirst({
            where: { userId: developerId },
            orderBy: { createdAt: "desc" },
        });

        // 2. Obtener ofertas publicadas
        const whereClause: Prisma.JobPostingWhereInput = { status: "published" };

        if (filters?.remoteType && filters.remoteType !== "all") {
            whereClause.remoteType = filters.remoteType;
        }
        if (filters?.seniorityLevel && filters.seniorityLevel !== "all") {
            whereClause.seniorityLevel = filters.seniorityLevel;
        }
        if (filters?.search) {
            whereClause.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { company: { contains: filters.search, mode: "insensitive" } },
            ];
        }

        const jobPostings = await db.jobPosting.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        // 3. Resolver match scores
        const postingsWithMatches = await Promise.all(
            jobPostings.map(async (job: JobPosting) => {
                let matchScore: number | null = null;
                let hasApplied = false;

                // Comprobar si ya se postuló
                const app = await db.jobPostingApplication.findUnique({
                    where: {
                        jobPostingId_developerId: {
                            jobPostingId: job.id,
                            developerId,
                        },
                    },
                });
                hasApplied = !!app;

                if (latestResume) {
                    const match = await this.getOrCalculateMatchScore(
                        latestResume.id,
                        job.id,
                        job.description,
                        developerId,
                    );
                    matchScore = match.matchScore;
                }

                return {
                    ...job,
                    matchScore,
                    hasApplied,
                };
            }),
        );

        return postingsWithMatches;
    }

    /**
     * Aplica a una oferta de trabajo.
     * Dispara una notificación al reclutador y crea automáticamente una card en el Kanban del Job Tracker (M14) en "applied".
     */
    static async applyToJobPosting(developerId: string, jobPostingId: string): Promise<JobPostingApplication> {
        // 1. Verificar si ya se postuló
        const existing = await db.jobPostingApplication.findUnique({
            where: {
                jobPostingId_developerId: {
                    jobPostingId,
                    developerId,
                },
            },
        });

        if (existing) {
            throw new Error("Ya te has postulado a esta oferta laboral.");
        }

        // 2. Obtener el CV activo
        const latestResume = await db.resume.findFirst({
            where: { userId: developerId },
            orderBy: { createdAt: "desc" },
        });

        if (!latestResume) {
            throw new Error("Debes subir un CV antes de postularte a las ofertas laborales.");
        }

        // 3. Crear la postulación
        const application = await db.jobPostingApplication.create({
            data: {
                jobPostingId,
                developerId,
                resumeId: latestResume.id,
                status: "submitted",
            },
            include: {
                jobPosting: true,
                developer: true,
            },
        });

        // 4. Notificar al reclutador
        await createNotification({
            userId: application.jobPosting.recruiterId,
            type: "new_application",
            title: "Nueva postulación recibida",
            message: `${application.developer.name || "Un desarrollador"} se ha postulado a la oferta de ${application.jobPosting.title} en ${application.jobPosting.company}.`,
            link: `/dashboard/recruiter/postings/${jobPostingId}/applications`,
            metadata: { applicationId: application.id, jobPostingId },
        });

        // 5. Integrar con el Kanban del Job Tracker (M14)
        try {
            await db.jobApplication.create({
                data: {
                    userId: developerId,
                    title: application.jobPosting.title,
                    company: application.jobPosting.company,
                    status: "applied", // Columna "applied"
                },
            });
        } catch (kanbanError) {
            // Registrar error pero no hacer fallar la postulación completa
            console.error("[applyToJobPosting] Error creando card en el Kanban del Job Tracker:", kanbanError);
        }

        return application;
    }

    /**
     * Obtiene las postulaciones para una oferta específica de un reclutador.
     * Valida IDOR comprobando que el reclutador sea el dueño de la oferta.
     */
    static async getJobPostingApplications(recruiterId: string, jobPostingId: string) {
        const jobPosting = await db.jobPosting.findUnique({
            where: { id: jobPostingId },
        });

        if (!jobPosting) {
            throw new Error("Oferta de trabajo no encontrada.");
        }

        if (jobPosting.recruiterId !== recruiterId) {
            throw new Error("Acceso denegado. No eres el propietario de esta oferta.");
        }

        const applications = await db.jobPostingApplication.findMany({
            where: { jobPostingId },
            orderBy: { createdAt: "desc" },
            include: {
                developer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        isPublicProfile: true,
                        publicUsername: true,
                    },
                },
                resume: {
                    select: {
                        id: true,
                        fileName: true,
                        fileUrl: true,
                        atsScore: true,
                        analysis: true,
                    },
                },
            },
        });

        // Buscar solicitudes de contacto del reclutador hacia estos desarrolladores
        const contactRequests = await db.contactRequest.findMany({
            where: {
                recruiterId,
                developerId: { in: applications.map((a: JobPostingApplication) => a.developerId) },
            },
        });

        const contactMap = new Map<string, ContactRequest>(
            contactRequests.map((r: ContactRequest) => [r.developerId, r]),
        );

        type AppWithRelations = (typeof applications)[number];

        // Enriquecer con el matchScore desde la caché y aplicar Doble Ciego
        const enriched = await Promise.all(
            applications.map(async (app: AppWithRelations) => {
                let matchScore = 0;
                let analysis = null;

                if (app.resumeId) {
                    const cachedMatch = await db.jobPostingMatchCache.findUnique({
                        where: {
                            resumeId_jobPostingId: {
                                resumeId: app.resumeId,
                                jobPostingId,
                            },
                        },
                    });
                    if (cachedMatch) {
                        matchScore = cachedMatch.matchScore;
                        analysis = cachedMatch.analysis;
                    }
                }

                const contactReq = contactMap.get(app.developerId);
                const contactStatus = contactReq?.status || "none";

                // Aplicar Doble Ciego: Si el contacto no ha sido aceptado, remover PII en el DTO
                const isRevealed = contactStatus === "accepted";
                const devAnonId = `DEV-${app.developer.id.slice(-4).toUpperCase()}`;

                const developerClean = {
                    id: app.developer.id,
                    name: isRevealed ? app.developer.name : null,
                    email: isRevealed ? app.developer.email : null,
                    image: isRevealed ? app.developer.image : null,
                    isPublicProfile: app.developer.isPublicProfile,
                    publicUsername: app.developer.publicUsername,
                    anonymousId: devAnonId,
                };

                return {
                    ...app,
                    matchScore,
                    analysis,
                    contactStatus,
                    contactRequestId: contactReq?.id || null,
                    developer: developerClean,
                };
            }),
        );

        interface EnrichedApplication {
            id: string;
            jobPostingId: string;
            developerId: string;
            resumeId: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            matchScore: number;
            contactStatus: string;
            contactRequestId: string | null;
            developer: {
                id: string;
                name: string | null;
                email: string | null;
                image: string | null;
                isPublicProfile: boolean;
                publicUsername: string | null;
                anonymousId: string;
            };
            resume: {
                id: string;
                fileName: string;
                fileUrl: string;
                atsScore: number | null;
                analysis: Prisma.JsonValue;
            } | null;
        }

        // Ordenar por matchScore descendente
        return (enriched as unknown as EnrichedApplication[]).sort((a, b) => b.matchScore - a.matchScore);
    }

    /**
     * Cambia el estado de una aplicación.
     * Valida IDOR y notifica al developer.
     */
    static async updateApplicationStatus(
        recruiterId: string,
        applicationId: string,
        newStatus: "submitted" | "reviewed" | "rejected" | "shortlisted",
    ): Promise<JobPostingApplication> {
        const application = await db.jobPostingApplication.findUnique({
            where: { id: applicationId },
            include: {
                jobPosting: true,
            },
        });

        if (!application) {
            throw new Error("Postulación no encontrada.");
        }

        if (application.jobPosting.recruiterId !== recruiterId) {
            throw new Error("Acceso denegado. No eres el propietario de la oferta de esta postulación.");
        }

        const updated = await db.jobPostingApplication.update({
            where: { id: applicationId },
            data: { status: newStatus },
            include: {
                jobPosting: true,
                developer: true,
            },
        });

        // Notificar al developer
        const statusMap = {
            submitted: "Recibida",
            reviewed: "En revisión",
            rejected: "No seleccionada",
            shortlisted: "Preseleccionada",
        };

        await createNotification({
            userId: updated.developerId,
            type: "application_status_changed",
            title: "Actualización de tu postulación",
            message: `Tu postulación para ${updated.jobPosting.title} en ${updated.jobPosting.company} cambió a: ${statusMap[newStatus]}.`,
            link: "/dashboard/jobs", // Redirige al listado de ofertas/jobs
            metadata: { applicationId, newStatus, jobPostingId: updated.jobPostingId },
        });

        return updated;
    }

    /**
     * Trigger de matching proactivo al publicar una oferta.
     * Calcula el match score contra los developers recientes y los notifica si el match score >= 75%.
     * Para evitar spam y sobrecarga a la IA (Tarjeta 20.2), limita el procesamiento a los 10 devs más recientemente activos.
     */
    private static async triggerProactiveMatching(jobPostingId: string) {
        try {
            const jobPosting = await db.jobPosting.findUnique({
                where: { id: jobPostingId },
            });

            if (!jobPosting || jobPosting.status !== "published") return;

            // 1. Obtener desarrolladores recientes
            // Buscamos los 10 desarrolladores más recientemente actualizados o creados
            const developers = await db.user.findMany({
                where: { role: "developer" },
                orderBy: { updatedAt: "desc" },
                take: 10,
                select: { id: true, name: true },
            });

            for (const dev of developers) {
                // Obtener su CV más reciente
                const latestResume = await db.resume.findFirst({
                    where: { userId: dev.id },
                    orderBy: { createdAt: "desc" },
                });

                if (!latestResume) continue;

                // Calcular (o recuperar si ya existiera) el match
                const match = await this.getOrCalculateMatchScore(
                    latestResume.id,
                    jobPosting.id,
                    jobPosting.description,
                    dev.id,
                );

                if (match.matchScore >= 75) {
                    // Crear notificación de alta afinidad
                    await createNotification({
                        userId: dev.id,
                        type: "new_job_match",
                        title: "Nueva oferta altamente compatible",
                        message: `¡Hola ${dev.name || "desarrollador"}! Hemos detectado que tu perfil tiene una afinidad del ${match.matchScore}% con la oferta de ${jobPosting.title} en ${jobPosting.company}.`,
                        link: "/dashboard/jobs",
                        metadata: { jobPostingId, matchScore: match.matchScore },
                    });
                }
            }
        } catch (error) {
            console.error("[triggerProactiveMatching] Error en trigger asíncrono de matching:", error);
        }
    }
}
