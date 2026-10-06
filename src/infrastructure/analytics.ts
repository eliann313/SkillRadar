import { logger } from "@/infrastructure/logger";
import { track } from "@vercel/analytics/server";
import { db } from "@/infrastructure/db";
import { createHash } from "crypto";

function getAnonymousUserHash(userId: string): string {
    return createHash("sha256").update(userId).digest("hex");
}

function asString(value: unknown): string | undefined {
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asInt(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : undefined;
}

/**
 * Registra un evento analítico en Vercel Analytics y de forma anónima en base de datos.
 * Esta versión se ejecuta exclusivamente del lado del servidor para garantizar SSRF y PII compliance.
 */
export async function trackServerEvent(
    name:
        | "cv_uploaded"
        | "job_match_completed"
        | "public_profile_viewed"
        | "contact_request_sent"
        | "job_posting_applied"
        | "user_registered"
        | "ai_inference_succeeded"
        | "ai_inference_failed",
    userId?: string,
    properties?: Record<string, string | number | boolean | null>,
) {
    try {
        const userHash = userId ? getAnonymousUserHash(userId) : null;

        // 1. Guardar en Base de Datos de manera 100% anónima.
        // Campos IA (provider/model/latencyMs/success) solo en eventos ai_inference_* (Fase 3+deuda).
        const isAiEvent = name === "ai_inference_succeeded" || name === "ai_inference_failed";
        await db.analyticsEvent.create({
            data: {
                name,
                userHash,
                provider: isAiEvent ? asString(properties?.provider) : undefined,
                model: isAiEvent ? asString(properties?.model) : undefined,
                latencyMs: isAiEvent ? asInt(properties?.latencyMs) : undefined,
                success: isAiEvent ? name === "ai_inference_succeeded" : undefined,
            },
        });

        // 2. Trackear en Vercel Analytics (quitando PII del payload)
        const cleanProperties: Record<string, string | number | boolean> = {};
        if (properties) {
            for (const [key, value] of Object.entries(properties)) {
                if (value === null || value === undefined) continue;
                if (["name", "email", "emailVerified", "passwordHash", "image", "githubUsername"].includes(key)) {
                    continue;
                }
                cleanProperties[key] = typeof value === "object" ? JSON.stringify(value) : value;
            }
        }

        // Registrar en Vercel Analytics
        await track(name, {
            ...cleanProperties,
            userHash: userHash || "anonymous",
        });
    } catch (err) {
        logger.error("[Analytics] Error trackeando evento:", name, err);
    }
}
