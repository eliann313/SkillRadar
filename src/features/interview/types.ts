import { z } from "zod";

export const interviewDebriefSchema = z.object({
    score: z.number().min(0).max(100),
    communicationScore: z.number().min(0).max(100),
    technicalScore: z.number().min(0).max(100),
    architectureScore: z.number().min(0).max(100),
    feedback: z.string(),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
});

export type InterviewDebriefData = z.infer<typeof interviewDebriefSchema>;

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}
