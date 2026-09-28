import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { safeParseJson } from "@/lib/pii";

interface TalentFilters {
    query?: string;
    seniority?: string[];
    minScore?: number;
}

/**
 * Alertas de talento: evalúa búsquedas guardadas (talent_pool) contra CVs
 * recientes y notifica al recruiter verificado. Sin IA (matching por keywords
 * para no quemar cuota de LLM en background).
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return new NextResponse("Cron no configurado", { status: 503 });
    }
    if (authHeader !== `Bearer ${secret}`) {
        return new NextResponse("No autorizado", { status: 401 });
    }

    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const searches = await db.savedSearch.findMany({
            where: {
                scope: "talent_pool",
                user: { role: "recruiter", recruiterVerified: true },
            },
            include: { user: { select: { id: true } } },
        });

        let created = 0;
        for (const search of searches) {
            const filters = safeParseJson<TalentFilters>(search.filters, {}) ?? {};
            const terms = (filters.query ?? "")
                .toLowerCase()
                .split(/[\s,]+/)
                .map((t) => t.trim())
                .filter((t) => t.length > 2);
            if (terms.length === 0) continue;

            const resumes = await db.resume.findMany({
                where: { createdAt: { gte: since } },
                select: { id: true, userId: true, rawText: true, fileName: true },
                take: 50,
            });

            for (const resume of resumes) {
                const haystack = (resume.rawText || "").toLowerCase();
                const hits = terms.filter((t) => haystack.includes(t)).length;
                if (hits === 0) continue;

                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const dup = await db.notification.findFirst({
                    where: {
                        userId: search.userId,
                        type: "talent_alert",
                        createdAt: { gte: weekAgo },
                    },
                    select: { id: true, metadata: true },
                });
                const meta = safeParseJson<{ searchId?: string; developerId?: string }>(dup?.metadata, {}) ?? {};
                if (dup && meta.searchId === search.id && meta.developerId === resume.userId) continue;

                await createNotification({
                    userId: search.userId,
                    type: "talent_alert",
                    title: `Nuevo talento para "${search.name}"`,
                    message: `${hits}/${terms.length} términos coinciden en ${resume.fileName}.`,
                    link: "/dashboard",
                    metadata: { searchId: search.id, developerId: resume.userId },
                });
                created += 1;
            }
        }

        logger.warn(`[Cron Talent Alerts] Éxito: ${created} alertas creadas.`);
        return NextResponse.json({ success: true, created });
    } catch (error) {
        logger.error("[Cron Talent Alerts] Error:", error);
        return NextResponse.json(
            { success: false, error: (error as Error).message || "Error al procesar el cron job" },
            { status: 500 },
        );
    }
}
