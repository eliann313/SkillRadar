"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CVUploadForm, AnalysisResults } from "@/components/cv-analysis";
import type { CVAnalysis } from "@/lib/types";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadAndParseCVAction } from "@/features/cv-analysis/actions";
import { toast } from "sonner";
import type { ATSAnalysis } from "@/features/cv-analysis/types";

export default function CVAnalysisPage() {
    const { data: session, status } = useSession();
    const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
        try {
            const isUrl = content.startsWith("http://") || content.startsWith("https://");

            if (isUrl) {
                const result = await uploadAndParseCVAction({
                    fileUrl: content,
                    fileName: fileName || "curriculum.pdf",
                });

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
                        detectedKeywords: dbAnalysis?.keywords || [],
                        missingKeywords: dbAnalysis?.missingKeywords || [],
                        estimatedSeniority: mappedSeniority,
                        suggestions: [...(dbAnalysis?.improvements || []), ...(dbAnalysis?.formatIssues || [])],
                        createdAt: new Date(dbResume.createdAt),
                    };

                    setAnalysis(mappedAnalysis);
                    toast.success("¡Análisis de CV completado con éxito!");
                } else {
                    toast.error(result.error || "Ocurrió un error al procesar el archivo.");
                }
            } else {
                toast.error(
                    "El análisis mediante texto pegado estará disponible próximamente. Por favor sube un archivo PDF.",
                );
            }
        } catch (error) {
            console.error("Error al analizar el CV:", error);
            toast.error("Ocurrió un error inesperado al analizar el CV.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">CV Analysis</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Upload your CV and get AI-powered insights to improve your ATS score
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <CVUploadForm
                    onAnalyze={(content, name) => {
                        void handleAnalyze(content, name);
                    }}
                    isLoading={isLoading}
                />

                {analysis && (
                    <div className="lg:col-span-2">
                        <AnalysisResults analysis={analysis} />
                    </div>
                )}
            </div>
        </>
    );
}
