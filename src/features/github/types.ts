import { z } from "zod";

export const githubAnalysisSchema = z.object({
    profileScore: z.number().min(0).max(100),
    languages: z.record(z.string(), z.number()),
    repos: z.array(
        z.object({
            name: z.string(),
            description: z.string().nullable(),
            stars: z.number(),
            language: z.string().nullable(),
            url: z.string(),
        }),
    ),
    analysis: z.object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        suggestions: z.array(z.string()),
    }),
    // 18.1: Seniority Signals — Evidence-based Skills
    commitFrequency: z.enum(["daily", "weekly", "sporadic", "inactive"]).optional().default("sporadic"),
    readmeQualityScore: z.number().min(0).max(100).optional().default(0),
    longestStreakDays: z.number().optional().default(0),
    topRepoTopics: z.array(z.string()).optional().default([]),
    senioritySignals: z.array(z.string()).optional().default([]), // evidencia cualitativa detectada por IA
    detectedPatterns: z
        .object({
            hasCI: z.boolean(),
            hasTesting: z.boolean(),
            hasDocker: z.boolean(),
            hasAuthImplementation: z.boolean(),
            hasCaching: z.boolean(),
            hasObservability: z.boolean(),
        })
        .optional()
        .default({
            hasCI: false,
            hasTesting: false,
            hasDocker: false,
            hasAuthImplementation: false,
            hasCaching: false,
            hasObservability: false,
        }),
});

export type GithubAnalysisData = z.infer<typeof githubAnalysisSchema>;

export type DetectedPatterns = NonNullable<GithubAnalysisData["detectedPatterns"]>;
