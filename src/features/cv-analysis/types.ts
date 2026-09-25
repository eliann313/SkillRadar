import { z } from "zod";

export const scoreBreakdownSchema = z.object({
    contacto: z.number().min(0).max(15),
    secciones: z.number().min(0).max(25),
    legibilidad: z.number().min(0).max(20),
    keywordsContexto: z.number().min(0).max(20),
    cuantificacion: z.number().min(0).max(20),
});

export const atsAnalysisSchema = z.object({
    atsScore: z.number().min(0).max(100),
    technicalScore: z.number().min(0).max(100),
    credibilityScore: z.number().min(0).max(100),
    credibilityExplanation: z.string(),
    technicalExplanation: z.string(),
    keywords: z.array(z.string()),
    missingKeywords: z.array(z.string()),
    formatIssues: z.array(z.string()),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
    estimatedSeniority: z.enum(["junior", "semi-senior", "senior"]),
    atsBreakdown: scoreBreakdownSchema.optional(),
    evidenceQuotes: z.array(z.string()).max(6).optional(),
    credibilityDeductions: z.array(z.string()).optional(),
    isSimulated: z.boolean().optional(),
    explainability: z
        .object({
            justification: z.string(),
            evidenceFound: z.array(z.string()),
            missingEvidence: z.array(z.string()),
        })
        .optional(),
});

export type ATSAnalysis = z.infer<typeof atsAnalysisSchema>;

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
