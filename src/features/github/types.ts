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
});

export type GithubAnalysisData = z.infer<typeof githubAnalysisSchema>;
