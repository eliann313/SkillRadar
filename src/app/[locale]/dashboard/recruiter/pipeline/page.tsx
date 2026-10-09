import { auth } from "@/infrastructure/auth";
import { isGuestSession } from "@/infrastructure/guest-guard";
import { redirect } from "next/navigation";
import { JobPostingService } from "@/features/jobs/application/jobs.service";
import { getTranslations } from "next-intl/server";
import { resolveStages, unionStages } from "@/infrastructure/pipeline-stages";
import { PipelineClientPage, type PipelineItem } from "@/features/jobs/presentation/recruiter-pipeline.client";
import { GuestPipelinePreview } from "@/features/recruiter/presentation/guest-recruiter-demos";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Sidebar" });
    return { title: `${t("pipeline")} | SkillRadar` };
}

export default async function RecruiterPipelinePage() {
    const session = await auth();
    if (!session?.user) redirect("/");
    if (session.user.role !== "recruiter") redirect("/dashboard");
    // Modo Guest: preview de solo lectura con mocks (sin DB ni acciones).
    if (isGuestSession(session)) return <GuestPipelinePreview />;

    const postings = await JobPostingService.getRecruiterJobPostings(session.user.id);

    const stagesByPosting: Record<string, string[]> = {};
    for (const posting of postings) {
        stagesByPosting[posting.id] = resolveStages(posting.pipelineStages);
    }
    const columns = unionStages(Object.values(stagesByPosting));

    const items: PipelineItem[] = [];
    // Lecturas independientes por oferta en paralelo (solo queries, sin IA).
    const appsByPosting = await Promise.all(
        postings.map((posting) => JobPostingService.getJobPostingApplications(session.user.id, posting.id)),
    );
    for (const [idx, posting] of postings.entries()) {
        for (const app of appsByPosting[idx]) {
            items.push({
                id: app.id,
                status: app.status,
                matchScore: app.matchScore,
                anonymousId: app.developer.anonymousId,
                postingId: posting.id,
                postingTitle: posting.title,
                createdAt: app.createdAt.toISOString(),
            });
        }
    }

    const summary = postings.map((p) => {
        const papps = items.filter((i) => i.postingId === p.id);
        const scores = papps.map((i) => i.matchScore).filter((s) => s > 0);
        return {
            id: p.id,
            title: p.title,
            status: p.status,
            total: papps.length,
            hired: papps.filter((i) => i.status === "hired").length,
            avgMatch: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        };
    });

    return <PipelineClientPage items={items} summary={summary} columns={columns} stagesByPosting={stagesByPosting} />;
}
