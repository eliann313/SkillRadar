/**
 * Modelo de planes (Fase 5): formaliza en código lo que ya existe implícito.
 * - `free`: cuota del sistema vía rate-limiters (24h por defecto).
 * - `byok`: el usuario aporta sus claves (bypass 999 en check*RateLimit).
 *
 * Sin migración de schema: el plan se deriva de `hasApiKeys` y las cuotas
 * espejan las constantes de `@/infrastructure/rate-limit`.
 */

export type PlanId = "free" | "byok";

export interface PlanQuota {
    /** Clave estable para i18n y telemetría. */
    key:
        | "cv-analysis"
        | "job-match"
        | "github-analysis"
        | "ai-sourcing"
        | "ai-chat"
        | "job-postings"
        | "job-applications"
        | "writes";
    limit: number;
    /** Ventana en ms (todas 24h hoy). */
    windowMs: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const FREE_QUOTAS: readonly PlanQuota[] = [
    { key: "cv-analysis", limit: 5, windowMs: DAY_MS },
    { key: "job-match", limit: 10, windowMs: DAY_MS },
    { key: "github-analysis", limit: 10, windowMs: DAY_MS },
    { key: "ai-sourcing", limit: 10, windowMs: DAY_MS },
    { key: "ai-chat", limit: 20, windowMs: DAY_MS },
    { key: "job-postings", limit: 10, windowMs: DAY_MS },
    { key: "job-applications", limit: 20, windowMs: DAY_MS },
    { key: "writes", limit: 30, windowMs: DAY_MS },
] as const;

export function getPlanId(hasApiKeys: boolean): PlanId {
    return hasApiKeys ? "byok" : "free";
}
