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
