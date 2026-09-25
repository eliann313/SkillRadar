import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobPostingService } from "@/features/jobs/service";
import { getTranslations } from "next-intl/server";
import { PipelineClientPage, type PipelineItem } from "./client-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Sidebar" });
    return { title: `${t("pipeline")} | SkillRadar` };
}

export default async function RecruiterPipelinePage() {
    const session = await auth();
    if (!session?.user) redirect("/");
    if (session.user.role !== "recruiter") redirect("/dashboard");

    const postings = await JobPostingService.getRecruiterJobPostings(session.user.id);

    const items: PipelineItem[] = [];
    for (const posting of postings) {
        const apps = await JobPostingService.getJobPostingApplications(session.user.id, posting.id);
        for (const app of apps) {
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

    return <PipelineClientPage items={items} summary={summary} />;
}
