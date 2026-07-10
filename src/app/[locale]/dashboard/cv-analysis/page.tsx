"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CVUploadForm, AnalysisResults } from "@/components/cv-analysis";
import type { CVAnalysis } from "@/lib/types";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisSkeleton } from "@/components/ui/loading-skeletons";
import { uploadAndParseCVAction } from "@/features/cv-analysis/actions";
import { toast } from "sonner";
import type { ATSAnalysis } from "@/features/cv-analysis/types";
import { useTranslations } from "next-intl";

export default function CVAnalysisPage() {
    const { data: session, status } = useSession();
    const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations("CVAnalysis");

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

    const handleAnalyze = async (content: string, fileName?: string) => {
        setIsLoading(true);
        setAnalysis(null); // Ocultar el anterior al empezar una nueva carga
        try {
            const isUrl = content.startsWith("http://") || content.startsWith("https://");

            let result;
            if (isUrl) {
                result = await uploadAndParseCVAction({
                    fileUrl: content,
                    fileName: fileName || "curriculum.pdf",
                });
            } else {
                result = await uploadAndParseCVAction({
                    rawText: content,
                    fileName: fileName || "curriculum_texto.txt",
                });
            }

            if (result.success) {
                const dbResume = result.data;
                const dbAnalysis = dbResume.analysis as ATSAnalysis | null;

                const rawSeniority = dbAnalysis?.estimatedSeniority || "mid";
                const mappedSeniority: "junior" | "mid" | "senior" | "lead" =
                    rawSeniority === "semi-senior" ? "mid" : (rawSeniority as "junior" | "mid" | "senior" | "lead");

                const mappedAnalysis: CVAnalysis = {
                    id: dbResume.id,
                    userId: session.user.id,
                    atsScore: dbResume.atsScore ?? (dbAnalysis?.atsScore || 0),
                    technicalScore: dbAnalysis?.technicalScore ?? undefined,
                    credibilityScore: dbAnalysis?.credibilityScore ?? undefined,
                    technicalExplanation: dbAnalysis?.technicalExplanation ?? undefined,
                    credibilityExplanation: dbAnalysis?.credibilityExplanation ?? undefined,
                    detectedKeywords: dbAnalysis?.keywords || [],
                    missingKeywords: dbAnalysis?.missingKeywords || [],
                    estimatedSeniority: mappedSeniority,
                    suggestions: [...(dbAnalysis?.improvements || []), ...(dbAnalysis?.formatIssues || [])],
                    createdAt: new Date(dbResume.createdAt),
                    explainability: dbAnalysis?.explainability,
                };

                setAnalysis(mappedAnalysis);
                toast.success(t("successToast"));
            } else {
                if (result.error === "PDF_NOT_READABLE") {
                    toast.error(t("readableToast"), { duration: 8000 });
                    window.dispatchEvent(new CustomEvent("cv-pdf-not-readable"));
                } else {
                    toast.error(result.error || t("errorToast"));
                }
            }
        } catch (error) {
            console.error("Error al analizar el CV:", error);
            toast.error(t("unexpectedError"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <CVUploadForm
                    onAnalyze={(content, name) => {
                        void handleAnalyze(content, name);
                    }}
                    isLoading={isLoading}
                />

                {isLoading ? (
                    <AnalysisSkeleton />
                ) : analysis ? (
                    <div className="lg:col-span-2">
                        <AnalysisResults analysis={analysis} />
                    </div>
                ) : null}
            </div>
        </>
    );
}
