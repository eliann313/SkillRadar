import { logger } from "@/infrastructure/logger";
import { NextResponse } from "next/server";
import { db } from "@/infrastructure/db";
import { createNotification } from "@/infrastructure/notifications";
import { safeParseJson } from "@/shared-kernel/pii";

interface JobFilters {
    query?: string;
    search?: string;
    seniority?: string[];
    seniorityLevel?: string;
    remoteType?: string;
    field?: string;
}

/**
 * Alertas de empleo: evalúa búsquedas guardadas (job_board) contra ofertas
 * publicadas recientes y notifica al developer. Sin IA (matching por keywords
 * para no quemar cuota de LLM en background). Espejo de talent-alerts.
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
        const startedAt = Date.now();
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const searches = await db.savedSearch.findMany({
            where: {
                scope: "job_board",
                user: { role: "developer" },
            },
            include: { user: { select: { id: true } } },
        });

        let created = 0;
        const CHUNK_SIZE = 5;
        for (let i = 0; i < searches.length; i += CHUNK_SIZE) {
            const chunkResults = await Promise.all(
                searches.slice(i, i + CHUNK_SIZE).map((search) => processSearch(search, since)),
            );
            created += chunkResults.reduce((a, b) => a + b, 0);
        }

        async function processSearch(search: (typeof searches)[number], since: Date): Promise<number> {
            const filters = safeParseJson<JobFilters>(search.filters, {}) ?? {};
            const queryText = filters.query ?? filters.search ?? "";
            const terms = queryText
                .toLowerCase()
                .split(/[\s,]+/)
                .map((t) => t.trim())
                .filter((t) => t.length > 2);
            if (terms.length === 0) return 0;

            const postings = await db.jobPosting.findMany({
                where: {
                    status: "published",
                    createdAt: { gte: since },
                    ...(filters.field ? { field: filters.field } : {}),
                    ...(filters.seniorityLevel ? { seniorityLevel: filters.seniorityLevel } : {}),
                    ...(filters.remoteType ? { remoteType: filters.remoteType } : {}),
                },
                select: { id: true, title: true, company: true, description: true, requiredSkills: true },
                take: 50,
            });

            let local = 0;
            for (const posting of postings) {
                const skills = Array.isArray(posting.requiredSkills)
                    ? posting.requiredSkills.map((s) => String(s)).join(" ")
                    : "";
                const haystack = `${posting.title} ${posting.company} ${posting.description} ${skills}`.toLowerCase();
                const hits = terms.filter((t) => haystack.includes(t)).length;
                if (hits === 0) continue;

                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const dup = await db.notification.findFirst({
                    where: {
                        userId: search.userId,
                        type: "job_alert",
                        createdAt: { gte: weekAgo },
                    },
                    select: { id: true, metadata: true },
                });
                const meta = safeParseJson<{ searchId?: string; postingId?: string }>(dup?.metadata, {}) ?? {};
                if (dup && meta.searchId === search.id && meta.postingId === posting.id) continue;

                await createNotification({
                    userId: search.userId,
                    type: "job_alert",
                    title: `Nueva oferta para "${search.name}"`,
                    message: `${posting.title} en ${posting.company} (${hits}/${terms.length} términos).`,
                    link: "/dashboard/jobs",
                    metadata: { searchId: search.id, postingId: posting.id },
                });
                local += 1;
            }
            return local;
        }

        const durationMs = Date.now() - startedAt;
        logger.warn(
            `[Cron Job Alerts] Éxito: ${created} alertas creadas sobre ${searches.length} búsquedas en ${durationMs}ms.`,
        );
        return NextResponse.json({ success: true, created, searches: searches.length, durationMs });
    } catch (error) {
        logger.error("[Cron Job Alerts] Error:", error);
        return NextResponse.json(
            { success: false, error: (error as Error).message || "Error al procesar el cron job" },
            { status: 500 },
        );
    }
}
