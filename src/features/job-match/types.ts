import { z } from "zod";

export const jobMatchAnalysisSchema = z.object({
    requiredSkills: z.array(z.string()),
    missingSkills: z.array(z.string()),
    seniority: z.enum(["junior", "mid", "senior", "lead"]),
    recommendations: z.array(z.string()),
});

export type JobMatchAnalysis = z.infer<typeof jobMatchAnalysisSchema>;

export interface CreateJobMatchInput {
    userId: string;
    resumeId?: string;
    jobOfferText: string;
    matchScore?: number;
    analysis?: JobMatchAnalysis;
}

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
