/**
 * Puerto del feature job-tracker (hexagonal).
 *
 * `JobTrackerRepository` (infrastructure/) es el adaptador por defecto y
 * expone `defaultJobTrackerStore`. El servicio solo conoce este puerto.
 */
import type { JobApplication } from "@prisma/client";

export interface JobTrackerCreateData {
    userId: string;
    title: string;
    company: string;
    url?: string;
    status?: string;
}

export interface JobTrackerStore {
    listByUserId(userId: string): Promise<JobApplication[]>;
    create(data: JobTrackerCreateData): Promise<JobApplication>;
    updateStatus(id: string, userId: string, status: string): Promise<JobApplication>;
    delete(id: string, userId: string): Promise<JobApplication>;
}
