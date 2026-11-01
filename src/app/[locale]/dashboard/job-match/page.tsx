"use client";

import { logger } from "@/infrastructure/logger";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { JobOfferInput } from "@/features/job-match/presentation/job-offer-input";
import { MatchScoreCard } from "@/components/job-match/match-score-card";
import type { JobMatch } from "@/shared-kernel/types";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchSkeleton } from "@/components/ui/loading-skeletons";
import { getUserResumesAction } from "@/features/cv-analysis/application/cv-analysis.use-cases";
import { createJobMatchAction } from "@/features/job-match/application/job-match.use-cases";
import { toast } from "sonner";
import type { JobMatchAnalysis } from "@/features/job-match/domain/job-match.types";
import { useTranslations } from "next-intl";
import { cn } from "@/shared-kernel/utils";

export default function JobMatchPage() {
    const t = useTranslations("JobMatch");
    const { data: session, status } = useSession();
    const [match, setMatch] = useState<JobMatch | null>(null);
    const [resumes, setResumes] = useState<{ id: string; fileName: string; createdAt: Date }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Cargar historial de CVs del desarrollador
    useEffect(() => {
        let cancelled = false;
        if (status === "authenticated" && session?.user?.id) {
            const loadResumes = async () => {
                try {
                    const result = await getUserResumesAction();
                    if (cancelled) return;
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
                    if (!cancelled) {
                        logger.error("Error al cargar historial de CVs:", error);
                    }
                }
            };
            void loadResumes();
        }
        return () => {
            cancelled = true;
        };
    }, [status, session]);

    if (status === "loading") {
        return (
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="space-y-2 text-center">
                    <Skeleton className="mx-auto h-8 w-48" />
                    <Skeleton className="mx-auto h-4 w-96 max-w-full" />
                </div>
                <Skeleton className="h-[320px] w-full rounded-xl" />
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
                    isSimulated: dbAnalysis?.isSimulated ?? undefined,
                };

                setMatch(mappedMatch);
                toast.success(t("matchSuccess"));
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            logger.error("Error al calcular matching:", error);
            toast.error(t("matchError"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("mx-auto space-y-8 transition-all", match || isLoading ? "max-w-6xl" : "max-w-2xl")}>
            <div className={cn("space-y-1.5", !match && !isLoading ? "text-center" : "text-left")}>
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("description")}</p>
            </div>

            <div className={cn("grid gap-6", match || isLoading ? "items-start lg:grid-cols-2" : "grid-cols-1")}>
                <JobOfferInput
                    resumes={resumes}
                    onMatch={(resumeId, offer) => {
                        void handleMatch(resumeId, offer);
                    }}
                    isLoading={isLoading}
                />

                {isLoading ? <MatchSkeleton /> : match ? <MatchScoreCard match={match} /> : null}
            </div>
        </div>
    );
}
