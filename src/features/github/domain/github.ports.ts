/**
 * Puerto del feature github (hexagonal).
 *
 * `GithubAnalysisRepository` (infrastructure/) es el adaptador por defecto y
 * expone `defaultGithubAnalysisStore`. El servicio solo conoce este puerto.
 */
import type { GithubAnalysis, Prisma } from "@prisma/client";
import type { GithubAnalysisData } from "./github.types";

export interface GithubAnalysisStore {
    createOrUpdate(userId: string, githubUser: string, data: GithubAnalysisData): Promise<GithubAnalysis>;
    findLatestByUserId(userId: string): Promise<GithubAnalysis | null>;
    delete(id: string, userId: string): Promise<Prisma.BatchPayload>;
}
