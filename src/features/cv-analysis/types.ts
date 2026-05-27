import { z } from "zod";

export const atsAnalysisSchema = z.object({
    atsScore: z.number().min(0).max(100),
    keywords: z.array(z.string()),
    missingKeywords: z.array(z.string()),
    formatIssues: z.array(z.string()),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
    estimatedSeniority: z.enum(["junior", "semi-senior", "senior"]),
});

export type ATSAnalysis = z.infer<typeof atsAnalysisSchema>;

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
