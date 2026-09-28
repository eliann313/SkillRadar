/**
 * Puertos del feature jobs (F4.2 — hexagonal).
 *
 * jobs define el CONTRATO que necesita; otros features proveen el ADAPTADOR.
 * El servicio solo conoce este puerto, nunca la clase concreta.
 */

export interface MatchProviderInput {
    userId: string;
    resumeId: string;
    jobOfferText: string;
}

export interface MatchProviderResult {
    matchScore: number | null;
    analysis: unknown;
}

export interface MatchProvider {
    createJobMatch(input: MatchProviderInput): Promise<MatchProviderResult>;
}

/**
 * Resuelve el adaptador por defecto (job-match).
 * Import dinámico a propósito: el borde estático jobs→job-match está cubierto
 * por la excepción explícita `hex-jobs-may-use-jobmatch-adapter` en
 * .dependency-cruiser.cjs (ver ADR-002). La capa de aplicación puede inyectar
 * otro proveedor para tests llamando a los métodos con `provider` explícito.
 */
export async function resolveDefaultMatchProvider(): Promise<MatchProvider> {
    const { JobMatchService } = await import("@/features/job-match/application/job-match.service");
    const adapter: MatchProvider = {
        createJobMatch: (input: MatchProviderInput): Promise<MatchProviderResult> =>
            JobMatchService.createJobMatch(input),
    };
    return adapter;
}
