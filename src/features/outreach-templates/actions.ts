"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/features/job-match/types";
import { RecruiterService } from "@/features/recruiter/service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const templateSchema = z.object({
    name: z.string().min(2).max(80),
    subject: z.string().max(140).optional(),
    body: z.string().min(10).max(5000),
});

export interface OutreachTemplateDTO {
    id: string;
    name: string;
    subject: string | null;
    body: string;
    createdAt: string;
}

function toDTO(t: {
    id: string;
    name: string;
    subject: string | null;
    body: string;
    createdAt: Date;
}): OutreachTemplateDTO {
    return { id: t.id, name: t.name, subject: t.subject, body: t.body, createdAt: t.createdAt.toISOString() };
}

async function requireRecruiter() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "recruiter" || session.user.isGuest) return null;
    return session;
}

export async function listTemplatesAction(): Promise<ActionResult<OutreachTemplateDTO[]>> {
    const session = await requireRecruiter();
    if (!session) return { success: false, error: "No autorizado." };
    const items = await db.outreachTemplate.findMany({
        where: { recruiterId: session.user.id },
        orderBy: { createdAt: "desc" },
    });
    return { success: true, data: items.map(toDTO) };
}

export async function createTemplateAction(
    input: z.infer<typeof templateSchema>,
): Promise<ActionResult<OutreachTemplateDTO>> {
    const session = await requireRecruiter();
    if (!session) return { success: false, error: "No autorizado." };
    const { checkWriteRateLimit } = await import("@/lib/rate-limit");
    if (!(await checkWriteRateLimit(`user:${session.user.id}`)).success) {
        return { success: false, error: "Límite diario de escritura alcanzado." };
    }
    const parsed = templateSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Datos inválidos." };
    const created = await db.outreachTemplate.create({
        data: {
            recruiterId: session.user.id,
            name: RecruiterService.sanitize(parsed.data.name),
            subject: parsed.data.subject ? RecruiterService.sanitize(parsed.data.subject) : null,
            body: RecruiterService.sanitize(parsed.data.body),
        },
    });
    revalidatePath("/dashboard/recruiter/templates");
    return { success: true, data: toDTO(created) };
}

export async function deleteTemplateAction(id: string): Promise<ActionResult<boolean>> {
    const session = await requireRecruiter();
    if (!session) return { success: false, error: "No autorizado." };
    await db.outreachTemplate.deleteMany({ where: { id, recruiterId: session.user.id } });
    revalidatePath("/dashboard/recruiter/templates");
    return { success: true, data: true };
}
