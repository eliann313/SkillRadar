"use server";

import { logger } from "@/infrastructure/logger";
import { auth, assertActiveUser } from "@/infrastructure/auth";
import { trackServerEvent } from "@/infrastructure/analytics";
import { CVAnalysisService } from "./cv-analysis.service";
import { defaultResumeStore as resumeStore } from "../infrastructure/cv-analysis.repository";
import type { Resume, Prisma } from "@prisma/client";
import type { ActionResult } from "@/shared-kernel/action-result";
import { revalidatePath } from "next/cache";
import { checkCVRateLimit, getClientIp } from "@/infrastructure/rate-limit";
import { validateBlobFileUrl } from "@/infrastructure/file-storage";
import { db } from "@/infrastructure/db";
import { AIService, type AIServiceOptions } from "@/infrastructure/ai";
import { z } from "zod";
import { env } from "@/infrastructure/env";
import { rejectGuestWrite } from "@/infrastructure/guest-guard";
import { normalizeCareerPath } from "@/shared-kernel/career-paths";

interface ParseCVInput {
    fileUrl?: string;
    fileName: string;
    rawText?: string;
}
interface ParseCVResult {
    id: string;
    fileName: string;
    fileUrl: string;
    atsScore?: number | null;
    analysis?: unknown;
    createdAt: Date;
}

export async function uploadAndParseCVAction(input: ParseCVInput): Promise<ActionResult<ParseCVResult>> {
    try {
        // 1. Validar autenticación
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: "No autorizado. Inicie sesión nuevamente.",
            };
        }

        // 2. Control de Rate Limiting (por UserId para autenticados o por IP en modo Demo/Guest)
        const isGuest = session.user.isGuest === true;
        const identifier = isGuest ? `ip:${await getClientIp()}` : `user:${session.user.id}`;

        const limitResult = await checkCVRateLimit(identifier);
        if (!limitResult.success) {
            const resetTime = new Date(limitResult.reset);
            const now = new Date();
            const diffMs = resetTime.getTime() - now.getTime();
            const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

            return {
                success: false,
                error: `Has alcanzado el límite diario de análisis (5 por día). Tu cuota se restablecerá en aproximadamente ${diffHours} ${diffHours === 1 ? "hora" : "horas"}.`,
            };
        }

        const { fileUrl, fileName, rawText } = input;
        if (!fileName) {
            return { success: false, error: "Nombre de archivo inválido." };
        }

        if (!fileUrl && !rawText) {
            return { success: false, error: "Datos de archivo inválidos." };
        }

        // 3. Manejo de Modo Demo/Guest (acotado: sin DB, sin LLM real, con razonamiento visible)
        if (isGuest) {
            // Simular retraso de análisis de IA para realismo
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const { CVAnalysisAIService } = await import("@/features/cv-analysis/application/cv-analysis.ai-service");
            const simulated = CVAnalysisAIService.generateSimulatedAnalysis(
                rawText || fileName || "React TypeScript Next.js Node.js",
            );
            await trackServerEvent("cv_uploaded", session.user.id, { isGuest: true, atsScore: simulated.atsScore });
            return {
                success: true,
                data: {
                    id: "demo-resume-id",
                    fileName: fileName || "curriculum_demo.pdf",
                    fileUrl: fileUrl || "text://raw-input",
                    atsScore: simulated.atsScore,
                    analysis: {
                        ...simulated,
                        formatIssues: rawText
                            ? ["Entrada directa por texto (sin issues de formato PDF)", ...simulated.formatIssues]
                            : simulated.formatIssues,
                    },
                    createdAt: new Date(),
                },
            };
        }

        // 4. Manejo de entrada por Texto Plano (Fallback / Canva OCR)
        if (rawText) {
            const resume = await CVAnalysisService.saveTextCV({
                userId: session.user.id,
                fileName,
                rawText,
            });

            await trackServerEvent("cv_uploaded", session.user.id, { isGuest: false, atsScore: resume.atsScore });

            revalidatePath("/dashboard");

            return {
                success: true,
                data: {
                    id: resume.id,
                    fileName: resume.fileName,
                    fileUrl: resume.fileUrl,
                    atsScore: resume.atsScore,
                    analysis: resume.analysis,
                    createdAt: resume.createdAt,
                },
            };
        }

        // 5. Manejo de PDF mediante URL de Vercel Blob
        // SSRF Prevention: la URL debe pertenecer a nuestro storage (barrera
        // anti-SSRF en `@/infrastructure/file-storage`) y se reconstruye con host verificado.
        const { validateBlobFileUrl } = await import("@/infrastructure/file-storage");
        const blobValidation = validateBlobFileUrl(fileUrl!);
        if (!blobValidation.ok) {
            return {
                success: false,
                error: blobValidation.error,
            };
        }
        const validatedUrl = blobValidation.validatedUrl;

        // Descargar el archivo para poder parsearlo. El store es privado: la lectura
        // se autentica en servidor con el token (nunca fetch anónimo).
        const { get: getBlob } = await import("@vercel/blob");
        const result = await getBlob(validatedUrl, { access: "private" });
        if (!result || result.statusCode !== 200 || !result.stream) {
            return {
                success: false,
                error: "No se pudo descargar el archivo para su análisis.",
            };
        }
        const fileBuffer = Buffer.from(await new Response(result.stream).arrayBuffer());

        // Procesar y guardar el CV en base de datos
        const resume = await CVAnalysisService.saveParsedCV({
            userId: session.user.id,
            fileName,
            fileUrl: fileUrl!,
            fileBuffer,
        });

        await trackServerEvent("cv_uploaded", session.user.id, { isGuest: false, atsScore: resume.atsScore });

        // Revalidar la vista del dashboard
        revalidatePath("/dashboard");

        return {
            success: true,
            data: {
                id: resume.id,
                fileName: resume.fileName,
                fileUrl: resume.fileUrl,
                atsScore: resume.atsScore,
                analysis: resume.analysis,
                createdAt: resume.createdAt,
            },
        };
    } catch (error: unknown) {
        logger.error("[uploadAndParseCVAction] Error general:", error);

        // Manejar el caso de que el PDF no contenga texto legible
        if (error instanceof Error && error.message === "PDF_NOT_READABLE") {
            return {
                success: false,
                error: "PDF_NOT_READABLE",
            };
        }

        const errorMessage =
            error instanceof Error ? error.message : "Ocurrió un error inesperado al procesar el archivo.";
        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function getUserResumesAction(): Promise<ActionResult<Resume[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const resumes = await resumeStore.findByUserId(session.user.id);
        return {
            success: true,
            data: resumes,
        };
    } catch (error) {
        logger.error("[getUserResumesAction] Error recuperando currículums:", error);
        return { success: false, error: "Error al recuperar tus currículums." };
    }
}

export async function getProgressDataAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const userId = session.user.id;
        const isGuest = session.user.isGuest === true;

        if (isGuest) {
            // Datos demo realistas
            const demoResumes = [
                { id: "1", fileName: "cv_2025_v1.pdf", atsScore: 45, createdAt: new Date("2026-01-10T12:00:00.000Z") },
                { id: "2", fileName: "cv_2025_v2.pdf", atsScore: 65, createdAt: new Date("2026-03-15T12:00:00.000Z") },
                {
                    id: "3",
                    fileName: "cv_2025_final.pdf",
                    atsScore: 82,
                    createdAt: new Date("2026-05-20T12:00:00.000Z"),
                },
            ];
            const closedSkills = ["Docker", "AWS", "CI/CD"];
            return {
                success: true,
                data: {
                    resumes: demoResumes,
                    totalMatches: 8,
                    averageScore: 78,
                    closedSkills,
                },
            };
        }

        // Obtener resumes ordenados por fecha ascendente para el gráfico
        const resumes = await db.resume.findMany({
            where: { userId, atsScore: { not: null } },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                fileName: true,
                atsScore: true,
                createdAt: true,
            },
        });

        // Obtener job matches ordenados por fecha descendente para los cálculos
        const matches = await db.jobMatch.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                matchScore: true,
                analysis: true,
                createdAt: true,
            },
        });

        const totalMatches = matches.length;

        // Calcular promedio de los últimos 5 matches
        const lastFive = matches.slice(0, 5);
        const validScores = lastFive.filter((m) => m.matchScore !== null);
        const averageScore =
            validScores.length > 0
                ? Math.round(validScores.reduce((acc, m) => acc + (m.matchScore || 0), 0) / validScores.length)
                : 0;

        // Calcular "Skills Cerrados"
        let closedSkills: string[] = [];
        if (totalMatches >= 1) {
            const firstMatch = matches[matches.length - 1];
            const lastMatch = matches[0];

            const firstAnalysis = firstMatch.analysis as { missingSkills?: string[] } | null;
            const lastAnalysis = lastMatch.analysis as { missingSkills?: string[] } | null;

            const firstMissing = Array.isArray(firstAnalysis?.missingSkills) ? firstAnalysis.missingSkills : [];
            const lastMissing = Array.isArray(lastAnalysis?.missingSkills) ? lastAnalysis.missingSkills : [];

            // Cerrados = estaban en el primero pero ya no están en el último
            closedSkills = firstMissing.filter((skill: string) => !lastMissing.includes(skill));
        }

        return {
            success: true,
            data: {
                resumes,
                totalMatches,
                averageScore,
                closedSkills,
            },
        };
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Error al obtener datos de progreso.";
        logger.error("[getProgressDataAction] Error:", errMessage);
        return { success: false, error: errMessage };
    }
}

export async function setActiveResumeAction(id: string): Promise<ActionResult<boolean>> {
    try {
        const session = await assertActiveUser();

        const blocked = rejectGuestWrite(session);
        if (blocked) return blocked;
        const userId = session.user.id;

        await resumeStore.setActive(id, userId);

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/settings/resumes");
        revalidatePath("/dashboard/job-match");
        revalidatePath("/dashboard/jobs");
        return { success: true, data: true };
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Error al marcar el CV como activo.";
        logger.error("[setActiveResumeAction] Error:", errMessage);
        return { success: false, error: errMessage };
    }
}

export async function deleteResumeAction(
    id: string,
    force = false,
): Promise<
    ActionResult<{ warning?: boolean; matches?: number; interviews?: number; applications?: number } | boolean>
> {
    try {
        const session = await assertActiveUser();

        const blocked = rejectGuestWrite(session);
        if (blocked) return blocked;
        const userId = session.user.id;

        // Validar ownership
        const resume = await db.resume.findFirst({
            where: { id, userId },
        });

        if (!resume) {
            return { success: false, error: "Currículum no encontrado o no autorizado." };
        }

        // Si no se fuerza, contar relaciones asociadas para advertir al usuario
        if (!force) {
            const [matches, interviews, applications] = await Promise.all([
                db.jobMatch.count({ where: { resumeId: id } }),
                db.interviewSession.count({ where: { resumeId: id } }),
                db.jobPostingApplication.count({ where: { resumeId: id } }),
            ]);

            if (matches > 0 || interviews > 0 || applications > 0) {
                return {
                    success: true,
                    data: {
                        warning: true,
                        matches,
                        interviews,
                        applications,
                    },
                };
            }
        }

        // Proceder a eliminar
        await resumeStore.delete(id, userId);

        // Si era el CV activo, marcar el más reciente restante como activo de forma predeterminada
        if (resume.isActive) {
            const latestRemaining = await db.resume.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
            if (latestRemaining) {
                await resumeStore.setActive(latestRemaining.id, userId);
            }
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/settings/resumes");
        revalidatePath("/dashboard/job-match");
        revalidatePath("/dashboard/jobs");
        return { success: true, data: true };
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Error al eliminar el currículum.";
        logger.error("[deleteResumeAction] Error:", errMessage);
        return { success: false, error: errMessage };
    }
}

export interface CareerRecommendations {
    technologies: Array<{ name: string; importance: "high" | "medium" | "low"; reason: string }>;
    roadmaps: Array<{ title: string; steps: string[]; duration: string }>;
    projects: Array<{
        title: string;
        description: string;
        technologies: string[];
        difficulty: "beginner" | "intermediate" | "advanced";
    }>;
    opportunities: Array<{
        title: string;
        description: string;
        demand: "high" | "medium" | "low";
    }>;
    targetPath?: string | null;
}

/**
 * Recomendaciones genéricas offline para un camino no-IT / sin claves IA.
 * Evita el sesgo determinista anterior (Docker/AWS/Jest) cuando el usuario
 * elige p.ej. sociología, educación o marketing.
 */
function buildOfflineRecommendationsForPath(targetPath: string): CareerRecommendations {
    const path = targetPath;
    return {
        technologies: [
            {
                name: `Fundamentos de ${path}`,
                importance: "high",
                reason: `Base conceptual imprescindible para posicionarte en ${path} frente a la demanda actual.`,
            },
            {
                name: `Herramientas aplicadas a ${path}`,
                importance: "medium",
                reason: `El mercado valora el dominio práctico de herramientas reales usadas en ${path}.`,
            },
            {
                name: "Comunicación y portafolio",
                importance: "medium",
                reason: "Documentar tu trabajo (casos, métricas, aprendizajes) multiplica tu credibilidad en cualquier campo.",
            },
        ],
        roadmaps: [
            {
                title: `Hoja de Ruta: ${path} en 12 semanas`,
                steps: [
                    `Semanas 1-3: fundamentos teóricos de ${path} + vocabulario profesional del campo.`,
                    `Semanas 4-7: práctica guiada con 2-3 ejercicios reales de ${path} y feedback.`,
                    `Semanas 8-10: proyecto integrador publicable con documentación y métricas de impacto.`,
                    `Semanas 11-12: portafolio, simulacros de entrevista y plan de postulación en ${path}.`,
                ],
                duration: "12 semanas",
            },
        ],
        projects: [
            {
                title: `Proyecto integrador en ${path}`,
                description: `Desarrolla un caso práctico de ${path} de principio a fin: problema, metodología, resultados y aprendizajes. Incluye un README que explique el reto y cómo replicar tu solución.`,
                technologies: [path, "Documentación", "Portafolio"],
                difficulty: "intermediate" as const,
            },
        ],
        opportunities: [
            {
                title: `Rol inicial en ${path}`,
                description: `Posiciones de entrada donde aplicar fundamentos de ${path} con supervisión y curva de aprendizaje.`,
                demand: "high" as const,
            },
            {
                title: `Rol intermedio / especialista en ${path}`,
                description: `Roles con autonomía donde el portafolio y la experiencia práctica en ${path} son el diferenciador.`,
                demand: "medium" as const,
            },
        ],
        targetPath: path,
    };
}

/** Mock de invitado sensible al camino elegido (sin DB ni IA). */
function buildGuestRecommendations(targetPath: string | null): CareerRecommendations {
    if (targetPath) return buildOfflineRecommendationsForPath(targetPath);
    return {
        technologies: [
            { name: "Docker", importance: "high", reason: "Demandado en la mayoría de ofertas backend." },
            { name: "CI/CD", importance: "high", reason: "Diferenciador clave en despliegues modernos." },
            { name: "Testing", importance: "medium", reason: "Mejora la credibilidad técnica del perfil." },
        ],
        roadmaps: [
            {
                title: "Ruta DevOps esencial",
                steps: ["Dockeriza un proyecto", "Automatiza CI con GitHub Actions", "Despliega en la nube"],
                duration: "4 semanas",
            },
        ],
        projects: [
            {
                title: "API con CI/CD completo",
                description: "API REST con tests, pipeline y deploy automático.",
                technologies: ["Node.js", "Docker", "GitHub Actions"],
                difficulty: "intermediate",
            },
        ],
        opportunities: [
            {
                title: "Backend Developer",
                description: "Roles backend donde Docker y CI/CD son requisitos frecuentes.",
                demand: "high",
            },
        ],
        targetPath: null,
    };
}

/**
 * Obtiene recomendaciones inteligentes del Career Copilot basadas en el CV del usuario y la demanda laboral.
 *
 * Si se indica `targetPath` (p.ej. "Ciencia de Datos", "Sociología"), la IA razona
 * sobre ese camino concreto — SkillRadar sirve a cualquier profesión, no solo IT —
 * y devuelve oportunidades, habilidades/tecnologías, ruta de aprendizaje y proyectos.
 */
export async function getCareerRecommendationsAction(
    targetPathInput?: string,
): Promise<ActionResult<CareerRecommendations>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        const userId = session.user.id;

        // Modo Demo/Guest: mock inmediato sin DB ni IA (el guest nunca persiste CVs)
        if (session.user.isGuest) {
            return { success: true, data: buildGuestRecommendations(normalizeCareerPath(targetPathInput)) };
        }

        // Camino por defecto: el guardado en el perfil (elegido una vez, vale en toda la app).
        let targetPath = normalizeCareerPath(targetPathInput);
        if (!targetPath) {
            try {
                const me = await db.user.findUnique({ where: { id: userId }, select: { careerPath: true } });
                targetPath = normalizeCareerPath(me?.careerPath);
            } catch {
                // Sin perfil legible: se sigue en modo general.
            }
        } else {
            // Elección explícita: persistir en el perfil para Job Match y Copilot.
            try {
                await db.user.update({ where: { id: userId }, data: { careerPath: targetPath } });
            } catch (dbError) {
                logger.error("[getCareerRecommendationsAction] Error al guardar careerPath:", dbError);
            }
        }

        // 1. Obtener currículum activo
        const resume =
            (await db.resume.findFirst({
                where: { userId, isActive: true },
            })) ||
            (await db.resume.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
            }));

        if (!resume) {
            return { success: false, error: "Sube un currículum para recibir sugerencias inteligentes de carrera." };
        }

        const existingAnalysis = resume.analysis as Record<string, unknown> | null;

        // Sin camino elegido: comportamiento legacy (caché única + Job Board).
        if (!targetPath) {
            if (existingAnalysis && existingAnalysis.careerRecommendations) {
                return {
                    success: true,
                    data: existingAnalysis.careerRecommendations as unknown as CareerRecommendations,
                };
            }
        } else {
            // Con camino elegido: caché por camino para no pisar la recomendación general.
            const byPath = (existingAnalysis?.careerRecommendationsByPath as Record<string, unknown> | undefined) ?? {};
            if (byPath[targetPath.toLowerCase()]) {
                return { success: true, data: byPath[targetPath.toLowerCase()] as CareerRecommendations };
            }
        }

        // 2. Obtener ofertas publicadas del Job Board
        const postings = await db.jobPosting.findMany({
            where: { status: "published" },
            select: { requiredSkills: true, title: true },
        });

        // 3. Cargar preferencias de IA del usuario
        let userSettings: AIServiceOptions["userSettings"] = undefined;
        try {
            const user = await db.user.findUnique({
                where: { id: userId },
                select: {
                    geminiApiKey: true,
                    groqApiKey: true,
                    openrouterApiKey: true,
                    openaiApiKey: true,
                    anthropicApiKey: true,
                    defaultAiProvider: true,
                    defaultAiModel: true,
                },
            });
            if (user) {
                userSettings = {
                    geminiApiKeyEncrypted: user.geminiApiKey,
                    groqApiKeyEncrypted: user.groqApiKey,
                    openrouterApiKeyEncrypted: user.openrouterApiKey,
                    openaiApiKeyEncrypted: user.openaiApiKey,
                    anthropicApiKeyEncrypted: user.anthropicApiKey,
                    preferredProvider: user.defaultAiProvider,
                    preferredModel: user.defaultAiModel,
                };
            }
        } catch {}

        const hasGlobalKeys = !!(
            env.GEMINI_API_KEY ||
            process.env.GROQ_API_KEY ||
            process.env.OPENROUTER_API_KEY ||
            process.env.OPENAI_API_KEY ||
            process.env.ANTHROPIC_API_KEY
        );
        const hasUserKeys = !!(
            userSettings &&
            (userSettings.geminiApiKeyEncrypted ||
                userSettings.groqApiKeyEncrypted ||
                userSettings.openrouterApiKeyEncrypted ||
                userSettings.openaiApiKeyEncrypted ||
                userSettings.anthropicApiKeyEncrypted)
        );

        const careerRecommendationsSchema = z.object({
            technologies: z.array(
                z.object({
                    name: z.string(),
                    importance: z.enum(["high", "medium", "low"]),
                    reason: z.string(),
                }),
            ),
            roadmaps: z.array(
                z.object({
                    title: z.string(),
                    steps: z.array(z.string()),
                    duration: z.string(),
                }),
            ),
            projects: z.array(
                z.object({
                    title: z.string(),
                    description: z.string(),
                    technologies: z.array(z.string()),
                    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
                }),
            ),
            opportunities: z
                .array(
                    z.object({
                        title: z.string(),
                        description: z.string(),
                        demand: z.enum(["high", "medium", "low"]),
                    }),
                )
                .default([]),
        });

        if (!hasGlobalKeys && !hasUserKeys) {
            // Simulación offline
            if (targetPath) {
                return { success: true, data: buildOfflineRecommendationsForPath(targetPath) };
            }
            const resumeLower = (resume.rawText || "").toLowerCase();
            const missingTech = [];
            if (!resumeLower.includes("docker"))
                missingTech.push({
                    name: "Docker",
                    importance: "high" as const,
                    reason: "Requerido frecuentemente en ofertas del Job Board para el despliegue de aplicaciones.",
                });
            if (!resumeLower.includes("aws"))
                missingTech.push({
                    name: "AWS",
                    importance: "medium" as const,
                    reason: "Altamente valorado en puestos Fullstack y Cloud Native.",
                });
            if (!resumeLower.includes("jest") && !resumeLower.includes("testing"))
                missingTech.push({
                    name: "Jest / Testing",
                    importance: "high" as const,
                    reason: "Esencial para asegurar la calidad de software y requerido en vacantes senior.",
                });
            if (!resumeLower.includes("ci/cd"))
                missingTech.push({
                    name: "CI/CD",
                    importance: "medium" as const,
                    reason: "Práctica estándar en equipos modernos de alto rendimiento.",
                });

            if (missingTech.length === 0) {
                missingTech.push({
                    name: "Kubernetes",
                    importance: "medium" as const,
                    reason: "Para escalar tus conocimientos de orquestación a nivel enterprise.",
                });
                missingTech.push({
                    name: "GraphQL",
                    importance: "low" as const,
                    reason: "Suma versatilidad a tus habilidades de APIs REST.",
                });
            }

            return {
                success: true,
                data: {
                    technologies: missingTech,
                    roadmaps: [
                        {
                            title: `Hoja de Ruta: Especialización en ${missingTech[0].name}`,
                            steps: [
                                `Aprender fundamentos teóricos y sintaxis básica de ${missingTech[0].name}.`,
                                `Implementar ejercicios prácticos aislados y configuración inicial.`,
                                `Integrar ${missingTech[0].name} en un proyecto Fullstack real.`,
                                "Configurar pipelines automatizados y monitoreo básico.",
                            ],
                            duration: "3 semanas",
                        },
                    ],
                    projects: [
                        {
                            title: `Proyecto Integrador con ${missingTech[0].name}`,
                            description: `Desarrolla una aplicación web que sirva para demostrar tu dominio práctico en ${missingTech[0].name}. Incluye documentación en un archivo README.md explicando el reto y cómo ejecutar la solución.`,
                            technologies: [missingTech[0].name, "React", "TypeScript"],
                            difficulty: "intermediate" as const,
                        },
                    ],
                    opportunities: [
                        {
                            title: "Desarrollador Fullstack",
                            description: "Demanda sostenida en el Job Board para perfiles con este stack.",
                            demand: "high" as const,
                        },
                    ],
                    targetPath: null,
                },
            };
        }

        // Obtener el stack en demanda del Job Board
        const demandedSkills = Array.from(
            new Set(
                postings.flatMap((p) => {
                    const skills = p.requiredSkills;
                    return Array.isArray(skills) ? skills.map((s) => String(s)) : [];
                }),
            ),
        );

        const pathDirective = targetPath
            ? `El usuario eligió explícitamente el camino profesional: "${targetPath}". Razona SOBRE ESE CAMINO (aunque no sea IT: puede ser sociología, educación, marketing, salud, derecho, etc.). Adapta todo el vocabulario: en vez de "tecnologías" usa habilidades/herramientas propias de ese campo; las oportunidades deben ser roles reales de ese campo; la ruta y los proyectos deben ser publicables en ese campo (no asumas GitHub/código salvo que el camino sea software).`
            : `Sin camino elegido: analiza el CV y compáralo con las tecnologías del Job Board (o las más demandadas de la industria actual).`;

        const result = await AIService.generateStructuredObject<CareerRecommendations>({
            schema: careerRecommendationsSchema,
            system: `Eres el Career Copilot de SkillRadar. Sirves a CUALQUIER profesión, no solo a desarrolladores de software.
${pathDirective}
Debes identificar brechas (skills ausentes o poco reforzados) y generar recomendaciones personalizadas estructuradas:
1. Oportunidades laborales concretas del camino elegido (2-4 roles con nivel de demanda high/medium/low y descripción realista).
2. Habilidades/tecnologías específicas a aprender con importancia (high, medium, low) y razón motivadora vinculada a la demanda laboral real.
3. Una ruta de aprendizaje sugerida paso a paso para dominar la habilidad prioritaria (con duración estimada).
4. Propuestas de proyectos prácticos (con dificultad beginner/intermediate/advanced) que la persona pueda crear y sumar a su CV/portafolio.
El idioma debe ser español, profesional, constructivo y alentador. Nunca inventes certificaciones oficiales inexistentes.`,
            prompt: `${targetPath ? `CAMINO ELEGIDO POR EL USUARIO: ${targetPath}\n\n` : ""}Compara las habilidades del candidato con la demanda laboral y genera las sugerencias:

=== TEXTO COMPLETO DEL CV ===
${resume.rawText}

=== HABILIDADES DETECTADAS EN OFERTAS DE TRABAJO (JOB BOARD) ===
${demandedSkills.join(", ") || "React, Node.js, TypeScript, Next.js, Docker, AWS, Testing, CI/CD"}`,
            userId,
            userSettings,
        });

        const resultWithPath: CareerRecommendations = { ...result, targetPath: targetPath ?? null };

        // Guardar en caché: general o por camino (sin pisar la otra).
        try {
            const baseAnalysis =
                typeof existingAnalysis === "object" && existingAnalysis !== null
                    ? (existingAnalysis as Record<string, unknown>)
                    : {};
            const serialized = JSON.parse(JSON.stringify(resultWithPath)) as Prisma.InputJsonValue;
            if (targetPath) {
                const prevByPath =
                    (baseAnalysis.careerRecommendationsByPath as Record<string, unknown> | undefined) ?? {};
                await db.resume.update({
                    where: { id: resume.id },
                    data: {
                        analysis: {
                            ...baseAnalysis,
                            careerRecommendationsByPath: {
                                ...prevByPath,
                                [targetPath.toLowerCase()]: serialized,
                            } as unknown as Prisma.InputJsonValue,
                        },
                    },
                });
            } else {
                await db.resume.update({
                    where: { id: resume.id },
                    data: {
                        analysis: {
                            ...baseAnalysis,
                            careerRecommendations: serialized,
                        },
                    },
                });
            }
        } catch (dbError) {
            logger.error("[getCareerRecommendationsAction] Error al guardar en caché:", dbError);
        }

        return {
            success: true,
            data: resultWithPath,
        };
    } catch (error: unknown) {
        logger.error("[getCareerRecommendationsAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al procesar las sugerencias del Career Copilot.",
        };
    }
}

/**
 * Genera una URL de vista con ownership para un archivo de CV.
 * Migrado desde `src/app/actions/cv-actions.ts` (Fase 0): logica de dominio
 * CV que vivia en la capa app. Auth + anti-SSRF + IDOR + rate-limit.
 */
export async function getSignedFileUrlAction(
    fileUrl: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // 1. Validar autenticación
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: "No autorizado. Inicie sesión nuevamente.",
            };
        }

        // 2. Validar que la URL pertenece a nuestro storage (barrera anti-SSRF)
        const validation = validateBlobFileUrl(fileUrl);
        if (!validation.ok) {
            return { success: false, error: validation.error };
        }

        // 3. Ownership: solo el dueño del resume puede ver su archivo (evita IDOR)
        const owned = await db.resume.findFirst({
            where: { userId: session.user.id, fileUrl: validation.validatedUrl },
            select: { id: true },
        });
        if (!owned) {
            return { success: false, error: "Archivo no encontrado para este usuario." };
        }

        const rl = await checkCVRateLimit(`user:${session.user.id}`);
        if (!rl.success) {
            return { success: false, error: "Límite diario de descargas alcanzado." };
        }

        // 4. URL de vista vía proxy con ownership: la URL cruda de Blob nunca
        // se expone de forma persistente al cliente.
        return {
            success: true,
            url: `/api/files?url=${encodeURIComponent(validation.validatedUrl)}`,
        };
    } catch (error) {
        logger.error("[getSignedFileUrlAction] Error:", error);
        return {
            success: false,
            error: "Error al generar la URL de vista para el archivo.",
        };
    }
}
