import { auth } from "@/infrastructure/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GithubAnalysisRepository } from "@/features/github/infrastructure/github.repository";
import { GitHubDashboardClient } from "@/features/github/presentation/github-dashboard.client";

export default async function GithubDashboardPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    if (session.user.role !== "developer") {
        redirect("/dashboard");
    }

    const t = await getTranslations("Github");

    // Obtener último análisis guardado
    const latestAnalysis = await GithubAnalysisRepository.findLatestByUserId(session.user.id);

    // Mapear a formato simple
    const initialData = latestAnalysis
        ? {
              id: latestAnalysis.id,
              githubUser: latestAnalysis.githubUser,
              profileScore: latestAnalysis.profileScore || 0,
              languages: (latestAnalysis.languages as Record<string, number>) || {},
              repos:
                  (latestAnalysis.repos as Array<{
                      name: string;
                      description: string | null;
                      stars: number;
                      language: string | null;
                      url: string;
                  }>) || [],
              analysis: (latestAnalysis.analysis as {
                  strengths: string[];
                  weaknesses: string[];
                  suggestions: string[];
              }) || { strengths: [], weaknesses: [], suggestions: [] },
              createdAt: latestAnalysis.createdAt,
          }
        : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <GitHubDashboardClient initialData={initialData} />
        </div>
    );
}
