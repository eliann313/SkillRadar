/**
 * Etapas del pipeline de selección.
 * Cada oferta puede definir las suyas (pipelineStages); vacío = default.
 */

export const DEFAULT_PIPELINE_STAGES = ["submitted", "reviewed", "shortlisted", "interview", "offer", "hired"] as const;

const STAGE_KEY_REGEX = /^[a-z0-9_]{1,24}$/;

export function resolveStages(custom: string[] | null | undefined): string[] {
    const cleaned = (custom ?? []).map((s) => s.trim().toLowerCase()).filter((s) => STAGE_KEY_REGEX.test(s));
    const unique = [...new Set(cleaned)];
    return unique.length > 0 ? unique : [...DEFAULT_PIPELINE_STAGES];
}

/** Unión ordenada de etapas para el tablero global (default primero, luego extras). */
export function unionStages(all: string[][]): string[] {
    const seen = new Set<string>();
    for (const s of DEFAULT_PIPELINE_STAGES) seen.add(s);
    for (const list of all) for (const s of list) seen.add(s);
    return [...seen];
}

export function isValidStage(stage: string, custom: string[] | null | undefined): boolean {
    return resolveStages(custom).includes(stage.trim().toLowerCase());
}
