import { createHash } from "crypto";
import { logger } from "@/infrastructure/logger";
import { trackServerEvent } from "@/infrastructure/analytics";

export interface AiUsageInput {
    provider: string;
    model: string;
    latencyMs: number;
    success: boolean;
    /** Índice del intento dentro de la cascada (0 = primario). */
    fallbackAttempt: number;
    userId?: string;
}

/**
 * Observabilidad de inferencias IA (Fase 3).
 *
 * - Log estructurado siempre (proveedor, modelo, latencia, éxito, intento).
 * - Evento analítico anonimizado best-effort (nunca lanza).
 * - El userId viaja solo como hash SHA-256; sin userId el evento es anónimo.
 * - Atribución de costo por usuario y split por proveedor en DB requieren
 *   migración de schema (deuda explícita, ver ADR-003/Fase 3).
 */
export async function trackAiUsage(input: AiUsageInput): Promise<void> {
    const userHash = input.userId ? createHash("sha256").update(input.userId).digest("hex") : null;

    logger.info("[AI usage]", {
        provider: input.provider,
        model: input.model,
        latencyMs: Math.round(input.latencyMs),
        success: input.success,
        fallbackAttempt: input.fallbackAttempt,
        userHash,
    });

    try {
        await trackServerEvent(input.success ? "ai_inference_succeeded" : "ai_inference_failed", input.userId, {
            provider: input.provider,
            model: input.model,
            latencyMs: Math.round(input.latencyMs),
            fallbackAttempt: input.fallbackAttempt,
        });
    } catch (error) {
        logger.error("[AI usage] Error registrando evento analítico:", error);
    }
}
