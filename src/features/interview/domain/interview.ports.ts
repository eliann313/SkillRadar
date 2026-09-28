/**
 * Puerto del feature interview (hexagonal).
 *
 * `InterviewRepository` (infrastructure/) es el adaptador por defecto y expone
 * `defaultInterviewStore`. El servicio solo conoce este puerto.
 */
import type { InterviewSession, Prisma } from "@prisma/client";
import type { InterviewDebriefData } from "./interview.types";

export interface InterviewStore {
    create(userId: string, resumeId?: string | null, jobMatchId?: string | null): Promise<InterviewSession>;
    findById(id: string, userId: string): Promise<InterviewSession | null>;
    updateMessages(id: string, userId: string, messages: Prisma.InputJsonValue): Promise<Prisma.BatchPayload>;
    saveDebrief(id: string, userId: string, score: number, debrief: InterviewDebriefData): Promise<Prisma.BatchPayload>;
    listByUserId(userId: string): Promise<InterviewSession[]>;
}
