import { z } from "zod";

export const jobMatchAnalysisSchema = z.object({
    requiredSkills: z.array(z.string()),
    missingSkills: z.array(z.string()),
    seniority: z.enum(["junior", "mid", "senior", "lead"]),
    recommendations: z.array(z.string()),
    matchScore: z.number().min(0).max(100),
    explainability: z
        .object({
            justification: z.string(),
            evidenceFound: z.array(z.string()),
            missingEvidence: z.array(z.string()),
        })
        .optional(),
    actionPlan: z
        .array(
            z.object({
                skill: z.string(),
                steps: z.array(z.string()),
            }),
        )
        .optional(),
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
