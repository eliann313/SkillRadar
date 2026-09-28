/**
 * Puerto del feature job-match (hexagonal).
 *
 * `JobMatchRepository` (infrastructure/) es el adaptador por defecto y expone
 * `defaultJobMatchStore`. El servicio solo conoce este puerto. Este mismo
 * repositorio también actúa como adaptador del puerto `MatchProvider` que
 * expone jobs (ver `src/features/jobs/domain/jobs.ports.ts` y ADR-002).
 */
import type { JobMatch, Prisma } from "@prisma/client";
import type { CreateJobMatchInput, JobMatchAnalysis } from "./job-match.types";

export type JobMatchWithResume = Prisma.JobMatchGetPayload<{ include: { resume: true } }>;

export interface JobMatchStore {
    create(data: CreateJobMatchInput): Promise<JobMatch>;
    updateAnalysis(id: string, userId: string, matchScore: number, analysis: JobMatchAnalysis): Promise<JobMatch>;
    findById(id: string, userId: string): Promise<JobMatchWithResume | null>;
}
