"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/features/job-match/types";
import { z } from "zod";

export interface SavedSearchDTO {
    id: string;
    name: string;
    scope: string;
    filters: Record<string, unknown>;
    createdAt: string;
}

const saveSchema = z.object({
    name: z.string().min(2).max(60),
    scope: z.enum(["talent_pool", "job_board"]),
    filters: z.record(z.string(), z.unknown()),
});

async function requireUser() {
    const session = await auth();
    if (!session?.user?.id || session.user.isGuest) return null;
    return session;
}

export async function listSavedSearchesAction(
    scope: "talent_pool" | "job_board",
): Promise<ActionResult<SavedSearchDTO[]>> {
    const session = await requireUser();
    if (!session) return { success: false, error: "No autorizado." };
    const items = await db.savedSearch.findMany({
        where: { userId: session.user.id, scope },
        orderBy: { createdAt: "desc" },
    });
    return {
        success: true,
        data: items.map((i) => ({
            id: i.id,
            name: i.name,
            scope: i.scope,
            filters: (i.filters ?? {}) as Record<string, unknown>,
            createdAt: i.createdAt.toISOString(),
        })),
    };
}

export async function saveSearchAction(input: z.infer<typeof saveSchema>): Promise<ActionResult<SavedSearchDTO>> {
    const session = await requireUser();
    if (!session) return { success: false, error: "No autorizado." };
    const parsed = saveSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Datos inválidos." };
    const created = await db.savedSearch.create({
        data: {
            userId: session.user.id,
            name: parsed.data.name.trim(),
            scope: parsed.data.scope,
            filters: parsed.data.filters as object,
        },
    });
    return {
        success: true,
        data: {
            id: created.id,
            name: created.name,
            scope: created.scope,
            filters: parsed.data.filters,
            createdAt: created.createdAt.toISOString(),
        },
    };
}

export async function deleteSavedSearchAction(id: string): Promise<ActionResult<boolean>> {
    const session = await requireUser();
    if (!session) return { success: false, error: "No autorizado." };
    await db.savedSearch.deleteMany({ where: { id, userId: session.user.id } });
    return { success: true, data: true };
}
