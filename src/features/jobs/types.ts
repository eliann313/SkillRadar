import { z } from "zod";
import type { JobPosting } from "@prisma/client";

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

// Zod Schema para validación de datos de oferta laboral
export const jobPostingSchema = z.object({
    title: z.string().min(2, "El título es obligatorio y debe tener al menos 2 caracteres.").max(150),
    company: z.string().min(2, "El nombre de la empresa es obligatorio.").max(100),
    location: z.string().min(2, "La ubicación es obligatoria.").max(100),
    remoteType: z.enum(["remote", "hybrid", "onsite"], {
        errorMap: () => ({ message: "Tipo de trabajo inválido." }),
    }),
    description: z.string().min(10, "La descripción es obligatoria y debe tener al menos 10 caracteres."),
    requiredSkills: z.array(z.string()).min(1, "Debe agregar al menos una habilidad requerida."),
    seniorityLevel: z.string().min(2, "El nivel de seniority es obligatorio."),
});

export type JobPostingWithCount = JobPosting & {
    _count: {
        applications: number;
    };
};

export type JobPostingWithMatch = JobPosting & {
    matchScore: number | null;
    hasApplied: boolean;
};
