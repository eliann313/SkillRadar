"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/features/job-match/types";
import { RecruiterService } from "@/features/recruiter/service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const idSchema = z.string().cuid();

export interface CandidateNoteDTO {
    id: string;
    body: string;
    createdAt: string;
}

export interface ScorecardDTO {
    id: string;
    criteria: Array<{ question: string; score: number; note: string }>;
    overall: number;
    comment: string | null;
    updatedAt: string;
}

const criteriaSchema = z
    .array(
        z.object({ question: z.string().min(1).max(500), score: z.number().min(1).max(5), note: z.string().max(1000) }),
    )
    .min(1)
    .max(20);

async function assertOwnership(applicationId: string, recruiterId: string) {
    const app = await db.jobPostingApplication.findUnique({
        where: { id: applicationId },
        include: { jobPosting: { select: { recruiterId: true } } },
    });
    if (!app || app.jobPosting.recruiterId !== recruiterId) return null;
    return app;
}

async function requireRecruiter() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "recruiter" || session.user.isGuest) return null;
    return session;
}

export async function listNotesAction(applicationId: string): Promise<ActionResult<CandidateNoteDTO[]>> {
    if (!idSchema.safeParse(applicationId).success) return { success: false, error: "No autorizado." };
    const session = await requireRecruiter();
    if (!session || !(await assertOwnership(applicationId, session.user.id))) {
        return { success: false, error: "No autorizado." };
    }
    const notes = await db.candidateNote.findMany({
        where: { applicationId },
        orderBy: { createdAt: "desc" },
    });
    return {
        success: true,
        data: notes.map((n) => ({ id: n.id, body: n.body, createdAt: n.createdAt.toISOString() })),
    };
}

export async function createNoteAction(applicationId: string, body: string): Promise<ActionResult<CandidateNoteDTO>> {
    if (!idSchema.safeParse(applicationId).success) return { success: false, error: "No autorizado." };
    const session = await requireRecruiter();
    if (!session || !(await assertOwnership(applicationId, session.user.id))) {
        return { success: false, error: "No autorizado." };
    }
    const { checkWriteRateLimit } = await import("@/lib/rate-limit");
    if (!(await checkWriteRateLimit(`user:${session.user.id}`)).success) {
        return { success: false, error: "Límite diario de escritura alcanzado." };
    }
    const clean = RecruiterService.sanitize(body).trim().slice(0, 2000);
    if (!clean) return { success: false, error: "La nota no puede estar vacía." };
    const note = await db.candidateNote.create({ data: { applicationId, recruiterId: session.user.id, body: clean } });
    revalidatePath("/dashboard/recruiter/postings");
    return { success: true, data: { id: note.id, body: note.body, createdAt: note.createdAt.toISOString() } };
}

export async function deleteNoteAction(noteId: string): Promise<ActionResult<boolean>> {
    if (!idSchema.safeParse(noteId).success) return { success: false, error: "No autorizado." };
    const session = await requireRecruiter();
    if (!session) return { success: false, error: "No autorizado." };
    await db.candidateNote.deleteMany({ where: { id: noteId, recruiterId: session.user.id } });
    return { success: true, data: true };
}

export async function getScorecardAction(applicationId: string): Promise<ActionResult<ScorecardDTO | null>> {
    if (!idSchema.safeParse(applicationId).success) return { success: false, error: "No autorizado." };
    const session = await requireRecruiter();
    if (!session || !(await assertOwnership(applicationId, session.user.id))) {
        return { success: false, error: "No autorizado." };
    }
    const sc = await db.interviewScorecard.findUnique({ where: { applicationId } });
    if (!sc) return { success: true, data: null };
    return {
        success: true,
        data: {
            id: sc.id,
            criteria: sc.criteria as ScorecardDTO["criteria"],
            overall: sc.overall,
            comment: sc.comment,
            updatedAt: sc.updatedAt.toISOString(),
        },
    };
}

export async function saveScorecardAction(
    applicationId: string,
    criteria: Array<{ question: string; score: number; note: string }>,
    comment: string,
): Promise<ActionResult<ScorecardDTO>> {
    if (!idSchema.safeParse(applicationId).success) return { success: false, error: "No autorizado." };
    const session = await requireRecruiter();
    if (!session) return { success: false, error: "No autorizado." };
    const app = await assertOwnership(applicationId, session.user.id);
    if (!app) return { success: false, error: "No autorizado." };
    const { checkWriteRateLimit } = await import("@/lib/rate-limit");
    if (!(await checkWriteRateLimit(`user:${session.user.id}`)).success) {
        return { success: false, error: "Límite diario de escritura alcanzado." };
    }
    const parsed = criteriaSchema.safeParse(criteria);
    if (!parsed.success) return { success: false, error: "Criterios inválidos (1-5 por pregunta)." };
    const overall = Math.round((parsed.data.reduce((a, c) => a + c.score, 0) / parsed.data.length / 5) * 100);
    const sc = await db.interviewScorecard.upsert({
        where: { applicationId },
        create: {
            applicationId,
            recruiterId: session.user.id,
            developerId: app.developerId,
            jobPostingId: app.jobPostingId,
            criteria: parsed.data,
            overall,
            comment: RecruiterService.sanitize(comment).slice(0, 2000),
        },
        update: {
            criteria: parsed.data,
            overall,
            comment: RecruiterService.sanitize(comment).slice(0, 2000),
        },
    });
    revalidatePath("/dashboard/recruiter/postings");
    return {
        success: true,
        data: {
            id: sc.id,
            criteria: sc.criteria as ScorecardDTO["criteria"],
            overall: sc.overall,
            comment: sc.comment,
            updatedAt: sc.updatedAt.toISOString(),
        },
    };
}
