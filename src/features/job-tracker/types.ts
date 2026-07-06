import { z } from "zod";

export const jobApplicationSchema = z.object({
    title: z.string().min(1, "El cargo es obligatorio"),
    company: z.string().min(1, "La empresa es obligatoria"),
    url: z.string().url("URL inválida").optional().or(z.literal("")),
    status: z.enum(["to_apply", "applied", "interviewing", "offer"]).default("to_apply"),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
