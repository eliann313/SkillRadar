/**
 * Puerto del feature cv-analysis (hexagonal).
 *
 * cv-analysis define el CONTRATO de persistencia que necesita; el fichero
 * `cv-analysis.repository.ts` (infrastructure/) es el adaptador por defecto y
 * expone `defaultResumeStore`. El servicio solo conoce este puerto.
 */
import type { Prisma, Resume } from "@prisma/client";
import type { ATSAnalysis } from "./cv-analysis.types";

export interface ResumeCreateData {
    userId: string;
    fileName: string;
    fileUrl: string;
    rawText: string;
}

export interface ResumeAnalysisData {
    atsScore: number;
    analysis: ATSAnalysis;
}

export interface ResumeStore {
    create(data: ResumeCreateData): Promise<Resume>;
    updateAnalysis(id: string, userId: string, data: ResumeAnalysisData): Promise<Resume>;
    findByUserId(userId: string): Promise<Resume[]>;
    delete(id: string, userId: string): Promise<Resume>;
    setActive(id: string, userId: string): Promise<[Prisma.BatchPayload, Resume]>;
    getActive(userId: string): Promise<Resume | null>;
}
