"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/features/job-match/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface RoadmapTaskDTO {
    id: string;
    skill: string;
    step: string;
    done: boolean;
    source: string;
    createdAt: string;
}

const createSchema = z.object({
    skill: z.string().min(1).max(80),
    step: z.string().min(3).max(500),
    source: z.enum(["manual", "job_match", "copilot"]).default("manual"),
});

const idSchema = z.string().cuid();

function toDTO(t: {
    id: string;
    skill: string;
    step: string;
    done: boolean;
    source: string;
    createdAt: Date;
}): RoadmapTaskDTO {
    return {
        id: t.id,
        skill: t.skill,
        step: t.step,
        done: t.done,
        source: t.source,
        createdAt: t.createdAt.toISOString(),
    };
}

async function requireUser() {
    const session = await auth();
    if (!session?.user?.id || session.user.isGuest) return null;
    return session;
}

export async function listRoadmapTasksAction(): Promise<ActionResult<RoadmapTaskDTO[]>> {
    const session = await requireUser();
    if (!session) return { success: false, error: "No autorizado." };
    const items = await db.roadmapTask.findMany({
        where: { userId: session.user.id },
        orderBy: [{ done: "asc" }, { createdAt: "desc" }],
        take: 50,
    });
    return { success: true, data: items.map(toDTO) };
}

export async function createRoadmapTaskAction(
    input: z.infer<typeof createSchema>,
): Promise<ActionResult<RoadmapTaskDTO>> {
    const session = await requireUser();
    if (!session) return { success: false, error: "No autorizado." };
    const { checkWriteRateLimit } = await import("@/lib/rate-limit");
    if (!(await checkWriteRateLimit(`user:${session.user.id}`)).success) {
        return { success: false, error: "Límite diario de escritura alcanzado." };
    }
    const parsed = createSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Datos inválidos." };
    const created = await db.roadmapTask.create({
        data: {
            userId: session.user.id,
            skill: parsed.data.skill.trim(),
            step: parsed.data.step.trim(),
            source: parsed.data.source,
        },
    });
    revalidatePath("/dashboard/progress");
    return { success: true, data: toDTO(created) };
}

export async function toggleRoadmapTaskAction(id: string): Promise<ActionResult<RoadmapTaskDTO>> {
    if (!idSchema.safeParse(id).success) return { success: false, error: "Tarea no encontrada." };
    const session = await requireUser();
    if (!session) return { success: false, error: "No autorizado." };
    const existing = await db.roadmapTask.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return { success: false, error: "Tarea no encontrada." };
    const updated = await db.roadmapTask.update({ where: { id }, data: { done: !existing.done } });
    revalidatePath("/dashboard/progress");
    return { success: true, data: toDTO(updated) };
}

export async function deleteRoadmapTaskAction(id: string): Promise<ActionResult<boolean>> {
    if (!idSchema.safeParse(id).success) return { success: false, error: "Tarea no encontrada." };
    const session = await requireUser();
    if (!session) return { success: false, error: "No autorizado." };
    await db.roadmapTask.deleteMany({ where: { id, userId: session.user.id } });
    revalidatePath("/dashboard/progress");
    return { success: true, data: true };
}

/**
 * Auto-crea tareas desde los missingSkills de un JobMatch (sin duplicar las existentes).
 */
export async function importMissingSkillsAction(jobMatchId: string): Promise<ActionResult<number>> {
    if (!idSchema.safeParse(jobMatchId).success) return { success: false, error: "No autorizado." };
    const session = await requireUser();
    if (!session) return { success: false, error: "No autorizado." };
    const { db: database } = await import("@/lib/db");
    const match = await database.jobMatch.findFirst({ where: { id: jobMatchId, userId: session.user.id } });
    if (!match?.analysis || typeof match.analysis !== "object") {
        return { success: false, error: "Sin análisis para importar." };
    }
    const missing = (match.analysis as { missingSkills?: unknown }).missingSkills;
    if (!Array.isArray(missing) || missing.length === 0) return { success: true, data: 0 };

    const existing = await database.roadmapTask.findMany({
        where: { userId: session.user.id, done: false },
        select: { skill: true, step: true },
    });
    const seen = new Set(existing.map((t) => `${t.skill.toLowerCase()}|${t.step.toLowerCase()}`));

    const toCreate = missing
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
        .slice(0, 8)
        .map((skill) => ({
            userId: session.user.id,
            skill: skill.trim().slice(0, 80),
            step: `Crear un proyecto o estudio enfocado en ${skill.trim().slice(0, 80)}`,
            source: "job_match",
        }))
        .filter((t) => !seen.has(`${t.skill.toLowerCase()}|${t.step.toLowerCase()}`));

    if (toCreate.length > 0) {
        await database.roadmapTask.createMany({ data: toCreate });
    }
    revalidatePath("/dashboard/progress");
    return { success: true, data: toCreate.length };
}
