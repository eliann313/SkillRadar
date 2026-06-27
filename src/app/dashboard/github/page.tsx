import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GithubAnalysisRepository } from "@/features/github/repository";
import { GitHubDashboardClient } from "./client-page";

export default async function GithubDashboardPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    if (session.user.role !== "developer") {
        redirect("/dashboard");
    }

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
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Análisis de GitHub</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Analiza la calidad de tu código, diversidad técnica y repositorios públicos con IA.
                </p>
            </div>

            <GitHubDashboardClient initialData={initialData} />
        </div>
    );
}
