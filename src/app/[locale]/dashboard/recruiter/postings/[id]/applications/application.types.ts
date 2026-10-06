"use client";

/** Tipos de la pantalla de postulaciones (ex interface del screen monolítico). */

export interface Application {
    id: string;
    jobPostingId: string;
    developerId: string;
    resumeId: string | null;
    status: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    matchScore: number;
    contactStatus: string;
    contactRequestId: string | null;
    analysis: {
        explainability?: string;
        requiredSkills?: string[];
        missingSkills?: string[];
        recommendations?: string[] | string;
    } | null;
    developer: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        isPublicProfile: boolean;
        publicUsername: string | null;
        anonymousId: string;
    };
    resume: {
        id: string;
        fileName: string;
        fileUrl: string;
        atsScore: number | null;
        analysis: {
            keywords?: string[];
        } | null;
    } | null;
}
