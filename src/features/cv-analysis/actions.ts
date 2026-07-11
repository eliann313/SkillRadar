"use server";

import { auth, assertActiveUser } from "@/lib/auth";
import { trackServerEvent } from "@/lib/analytics";
import { CVAnalysisService } from "./service";
import { ResumeRepository } from "./repository";
import type { Resume } from "@prisma/client";
import type { ActionResult } from "./types";
import { revalidatePath } from "next/cache";
import { checkCVRateLimit, getClientIp } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { AIService, type AIServiceOptions } from "@/lib/ai";
import { z } from "zod";
import { env } from "@/lib/env";

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

        // 3. Manejo de Modo Demo/Guest
        if (isGuest) {
            // Simular retraso de análisis de IA para realismo
            await new Promise((resolve) => setTimeout(resolve, 1500));
            await trackServerEvent("cv_uploaded", session.user.id, { isGuest: true, atsScore: 82 });
            return {
                success: true,
                data: {
                    id: "demo-resume-id",
                    fileName: fileName || "curriculum_demo.pdf",
                    fileUrl: fileUrl || "text://raw-input",
                    atsScore: 82,
                    analysis: {
                        atsScore: 82,
                        keywords: ["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS", "Git"],
                        missingKeywords: ["CI/CD", "Docker", "AWS", "Testing (Jest/Vitest)"],
                        formatIssues: rawText
                            ? ["Entrada directa por texto (sin issues de formato PDF)"]
                            : ["Falta de enlaces profesionales directos (LinkedIn/GitHub)"],
                        strengths: [
                            "Fuerte dominio técnico en el ecosistema moderno de React y TypeScript.",
                            "Estructura clara y secciones bien organizadas que facilitan el parseo por ATS.",
                        ],
                        improvements: [
                            "Se sugiere enriquecer las descripciones de proyectos utilizando métricas de impacto (metodología STAR).",
                            "Añadir exposición explícita en prácticas de CI/CD y despliegue en la nube.",
                        ],
                        estimatedSeniority: "mid",
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

        // 5. Manejo de PDF mediante URL de UploadThing
        // SSRF Prevention: Validate that the fileUrl belongs to UploadThing's trusted domains using a strict regex barrier guard.
        // This is natively recognized by CodeQL static analyzer as a sanitization barrier for SSRF.
        const UPLOADTHING_URL_REGEX = /^https:\/\/([a-zA-Z0-9-]+\.)?(utfs\.io|ufs\.sh)\/f\/.+/;
        if (!UPLOADTHING_URL_REGEX.test(fileUrl!)) {
            return {
                success: false,
                error: "URL de archivo no permitida por razones de seguridad.",
            };
        }

        // SSRF Prevention: Extract the unique fileKey and reconstruct the target URL using 100% hardcoded secure hosts.
        // This physically blocks any host-level manipulation (SSRF) and terminates CodeQL's taint propagation.
        let validatedUrl: string;
        try {
            const parsedUrl = new URL(fileUrl!);

            // Only allow HTTPS URLs
            if (parsedUrl.protocol !== "https:") {
                return {
                    success: false,
                    error: "URL de archivo no permitida por razones de seguridad.",
                };
            }

            // Allow-list UploadThing hosts only at structural level
            const host = parsedUrl.hostname.toLowerCase();
            const isUfs = host === "ufs.sh" || host.endsWith(".ufs.sh");
            const isUtfs = host === "utfs.io" || host.endsWith(".utfs.io");
            if (!isUfs && !isUtfs) {
                return {
                    success: false,
                    error: "URL de archivo no permitida por razones de seguridad.",
                };
            }

            // Extract the fileKey which resides after the "/f/" path segments
            const urlPath = parsedUrl.pathname;
            if (!urlPath.startsWith("/f/")) {
                return {
                    success: false,
                    error: "Estructura de URL no permitida por razones de seguridad.",
                };
            }
            const fileKey = urlPath.substring(3); // Extracts everything after "/f/"

            // Extremely strict whitelist of safe characters for the fileKey to prevent any path traversal or injection attempts
            const SAFE_FILE_KEY_REGEX = /^[a-zA-Z0-9\-_.]+$/;
            if (!SAFE_FILE_KEY_REGEX.test(fileKey)) {
                return {
                    success: false,
                    error: "Nombre de archivo contiene caracteres no permitidos.",
                };
            }

            // Reconstruct the URL using 100% static hosts, completely decoupling the request host from user input.
            validatedUrl = isUfs ? `https://ufs.sh/f/${fileKey}` : `https://utfs.io/f/${fileKey}`;
        } catch {
            return {
                success: false,
                error: "URL de archivo inválida o no permitida.",
            };
        }

        // Descargar el archivo desde la URL de UploadThing para poder parsearlo
        const response = await fetch(validatedUrl);
        if (!response.ok) {
            return {
                success: false,
                error: `No se pudo descargar el archivo para su análisis (Status ${response.status}).`,
            };
        }

        const arrayBuffer = await response.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

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
        console.error("[uploadAndParseCVAction] Error general:", error);

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

        const resumes = await ResumeRepository.findByUserId(session.user.id);
        return {
            success: true,
            data: resumes,
        };
    } catch (error) {
        console.error("[getUserResumesAction] Error recuperando currículums:", error);
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
        console.error("[getProgressDataAction] Error:", errMessage);
        return { success: false, error: errMessage };
    }
}

export async function setActiveResumeAction(id: string): Promise<ActionResult<boolean>> {
    try {
        const session = await assertActiveUser();
        const userId = session.user.id;

        await ResumeRepository.setActive(id, userId);

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/settings/resumes");
        revalidatePath("/dashboard/job-match");
        revalidatePath("/dashboard/jobs");
        return { success: true, data: true };
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Error al marcar el CV como activo.";
        console.error("[setActiveResumeAction] Error:", errMessage);
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
            const matches = await db.jobMatch.count({ where: { resumeId: id } });
            const interviews = await db.interviewSession.count({ where: { resumeId: id } });
            const applications = await db.jobPostingApplication.count({ where: { resumeId: id } });

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
        await ResumeRepository.delete(id, userId);

        // Si era el CV activo, marcar el más reciente restante como activo de forma predeterminada
        if (resume.isActive) {
            const latestRemaining = await db.resume.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
            if (latestRemaining) {
                await ResumeRepository.setActive(latestRemaining.id, userId);
            }
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/settings/resumes");
        revalidatePath("/dashboard/job-match");
        revalidatePath("/dashboard/jobs");
        return { success: true, data: true };
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Error al eliminar el currículum.";
        console.error("[deleteResumeAction] Error:", errMessage);
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
}

/**
 * Obtiene recomendaciones inteligentes del Career Copilot basadas en el CV del usuario y la demanda laboral.
 */
export async function getCareerRecommendationsAction(): Promise<ActionResult<CareerRecommendations>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        const userId = session.user.id;

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
        });

        if (!hasGlobalKeys && !hasUserKeys) {
            // Simulación offline
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

        const result = await AIService.generateStructuredObject<CareerRecommendations>({
            schema: careerRecommendationsSchema,
            system: `Eres el Career Copilot de SkillRadar. Tu misión es analizar el CV activo del desarrollador y compararlo con las tecnologías solicitadas en el Job Board (o las más demandadas de la industria actual).
Debes identificar las brechas técnicas (skills ausentes o poco reforzados) y generar recomendaciones personalizadas estructuradas:
1. Tecnologías específicas a aprender con un nivel de importancia (high, medium, low) y una razón motivadora y real vinculada a la demanda laboral.
2. Un roadmap sugerido paso a paso para dominar la habilidad prioritaria.
3. Propuestas de proyectos prácticos (indicando dificultad) que el programador pueda crear y subir a su GitHub para sumar a su CV y capacidad.
El idioma debe ser español, profesional, constructivo y alentador.`,
            prompt: `Compara las habilidades del candidato con la demanda laboral y genera las sugerencias:

=== TEXTO COMPLETO DEL CV ===
${resume.rawText}

=== HABILIDADES DETECTADAS EN OFERTAS DE TRABAJO (JOB BOARD) ===
${demandedSkills.join(", ") || "React, Node.js, TypeScript, Next.js, Docker, AWS, Testing, CI/CD"}`,
            userSettings,
        });

        return {
            success: true,
            data: result,
        };
    } catch (error: unknown) {
        console.error("[getCareerRecommendationsAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al procesar las sugerencias del Career Copilot.",
        };
    }
}
