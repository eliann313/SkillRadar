import { track } from "@vercel/analytics";
import { db } from "@/lib/db";
import { createHash } from "crypto";

export function getAnonymousUserHash(userId: string): string {
    return createHash("sha256").update(userId).digest("hex");
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
        | "user_registered",
    userId?: string,
    properties?: Record<string, string | number | boolean | null>,
) {
    try {
        const userHash = userId ? getAnonymousUserHash(userId) : null;

        // 1. Guardar en Base de Datos de manera 100% anónima
        await db.analyticsEvent.create({
            data: {
                name,
                userHash,
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
        track(name, {
            ...cleanProperties,
            userHash: userHash || "anonymous",
        });
    } catch (err) {
        console.error("[Analytics] Error trackeando evento:", name, err);
    }
}
