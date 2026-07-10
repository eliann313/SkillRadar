"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { JobOfferInput, MatchScoreCard } from "@/components/job-match";
import type { JobMatch } from "@/lib/types";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchSkeleton } from "@/components/ui/loading-skeletons";
import { getUserResumesAction } from "@/features/cv-analysis/actions";
import { createJobMatchAction } from "@/features/job-match/actions";
import { toast } from "sonner";
import type { JobMatchAnalysis } from "@/features/job-match/types";
import { useTranslations } from "next-intl";

export default function JobMatchPage() {
    const t = useTranslations("JobMatch");
    const { data: session, status } = useSession();
    const [match, setMatch] = useState<JobMatch | null>(null);
    const [resumes, setResumes] = useState<{ id: string; fileName: string; createdAt: Date }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Cargar historial de CVs del desarrollador
    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            const loadResumes = async () => {
                try {
                    const result = await getUserResumesAction();
                    if (result.success && result.data) {
                        setResumes(
                            result.data.map((r) => ({
                                id: r.id,
                                fileName: r.fileName,
                                createdAt: new Date(r.createdAt),
                            })),
                        );
                    }
                } catch (error) {
                    console.error("Error al cargar historial de CVs:", error);
                }
            };
            void loadResumes();
        }
    }, [status, session]);

    if (status === "loading") {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-[300px]" />
                    <Skeleton className="h-[300px]" />
                </div>
            </div>
        );
    }

    if (status === "unauthenticated" || !session?.user) {
        redirect("/");
    }

    if (session.user.role !== "developer") {
        redirect("/dashboard");
    }

    const handleMatch = async (resumeId: string, offerText: string) => {
        setIsLoading(true);
        setMatch(null); // Ocultar match anterior al empezar una nueva carga
        try {
            const result = await createJobMatchAction({
                resumeId,
                jobOfferText: offerText,
            });

            if (result.success) {
                const dbJobMatch = result.data;
                const dbAnalysis = dbJobMatch.analysis as unknown as JobMatchAnalysis;
                const required = dbAnalysis?.requiredSkills || [];
                const missing = dbAnalysis?.missingSkills || [];
                const aligned = required.filter((s: string) => !missing.includes(s));

                const mappedMatch: JobMatch = {
                    id: dbJobMatch.id,
                    userId: dbJobMatch.userId,
                    jobTitle: t("matchFor", {
                        seniority: dbAnalysis?.seniority ? dbAnalysis.seniority.toUpperCase() : t("profile"),
                    }),
                    company: t("analyzedJob"),
                    matchScore: dbJobMatch.matchScore || 0,
                    alignedSkills: aligned,
                    missingSkills: missing,
                    createdAt: new Date(dbJobMatch.createdAt),
                    recommendations: dbAnalysis?.recommendations || [],
                    explainability: dbAnalysis?.explainability,
                    actionPlan: dbAnalysis?.actionPlan,
                };

                setMatch(mappedMatch);
                toast.success(t("matchSuccess"));
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error("Error al calcular matching:", error);
            toast.error(t("matchError"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <JobOfferInput
                    resumes={resumes}
                    onMatch={(resumeId, offer) => {
                        void handleMatch(resumeId, offer);
                    }}
                    isLoading={isLoading}
                />

                {isLoading ? <MatchSkeleton /> : match ? <MatchScoreCard match={match} /> : null}
            </div>
        </>
    );
}
