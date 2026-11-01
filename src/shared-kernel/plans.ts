import type { UserRole } from "./types";

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

const DEVELOPER_QUOTA_KEYS: ReadonlyArray<PlanQuota["key"]> = [
    "cv-analysis",
    "job-match",
    "github-analysis",
    "ai-chat",
    "job-applications",
    "writes",
];

const RECRUITER_QUOTA_KEYS: ReadonlyArray<PlanQuota["key"]> = ["ai-sourcing", "job-postings", "ai-chat", "writes"];

export function getQuotasForRole(role?: UserRole | string | null): readonly PlanQuota[] {
    if (role === "recruiter") {
        return FREE_QUOTAS.filter((q) => RECRUITER_QUOTA_KEYS.includes(q.key));
    }
    return FREE_QUOTAS.filter((q) => DEVELOPER_QUOTA_KEYS.includes(q.key));
}
