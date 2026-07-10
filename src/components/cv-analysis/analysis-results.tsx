"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadialProgress } from "@/components/dashboard/radial-progress";
import type { CVAnalysis } from "@/lib/types";
import { Check, AlertTriangle, Lightbulb, Award, Eye, ShieldCheck, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExplainabilityPanel } from "@/components/explainability-panel";
import { useTranslations } from "next-intl";

interface AnalysisResultsProps {
    analysis: CVAnalysis;
}

const seniorityColors: Record<string, string> = {
    junior: "bg-indigo/10 text-indigo border-indigo/20",
    mid: "bg-primary/10 text-primary border-primary/20",
    senior: "bg-emerald/10 text-emerald border-emerald/20",
    lead: "bg-warning/10 text-warning border-warning/20",
};

export function getSeniorityColor(level: string) {
    const normalized = String(level).toLowerCase();
    switch (normalized) {
        case "junior":
            return seniorityColors.junior;
        case "mid":
            return seniorityColors.mid;
        case "senior":
            return seniorityColors.senior;
        case "lead":
            return seniorityColors.lead;
        default:
            return "";
    }
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const t = useTranslations("CVAnalysis");

    // Fallbacks para soporte de datos antiguos/legados en la base de datos
    const atsScore = analysis.atsScore;
    const technicalScore = analysis.technicalScore ?? Math.max(10, Math.min(100, Math.round(atsScore * 0.95)));
    const credibilityScore = analysis.credibilityScore ?? Math.max(10, Math.min(100, Math.round(atsScore * 0.9)));
    const technicalExplanation =
        analysis.technicalExplanation || t("noEvidence", { default: "No se detectó evidencia explícita." });
    const credibilityExplanation =
        analysis.credibilityExplanation || t("noEvidence", { default: "No se detectó evidencia explícita." });

    return (
        <div className="flex flex-col gap-6">
            {/* Tres Anillos de Puntuación (ATS, Tech, Credibilidad) */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col gap-6 py-8 md:flex-row md:justify-around items-center">
                    {/* ATS Score */}
                    <div className="flex flex-col items-center gap-2">
                        <RadialProgress value={atsScore} size={110} strokeWidth={7}>
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-bold text-foreground">{atsScore}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                    ATS
                                </span>
                            </div>
                        </RadialProgress>
                        <div className="flex flex-col items-center gap-0.5 text-center">
                            <p className="text-xs font-semibold text-foreground/90">{t("atsScore")}</p>
                            <span className="text-[10px] text-muted-foreground">
                                {atsScore >= 80 ? "Excellent" : atsScore >= 60 ? "Good" : "Needs Work"}
                            </span>
                        </div>
                    </div>

                    <Separator orientation="vertical" className="hidden h-20 md:block" />
                    <Separator className="md:hidden" />

                    {/* Technical Score */}
                    <div className="flex flex-col items-center gap-2">
                        <RadialProgress value={technicalScore} size={110} strokeWidth={7} className="text-indigo">
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-bold text-foreground">{technicalScore}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                    Tech
                                </span>
                            </div>
                        </RadialProgress>
                        <div className="flex flex-col items-center gap-0.5 text-center">
                            <p className="text-xs font-semibold text-foreground/90">{t("techScore")}</p>
                            <span className="text-[10px] text-muted-foreground">
                                {technicalScore >= 80 ? "Advanced" : technicalScore >= 60 ? "Capable" : "Novice"}
                            </span>
                        </div>
                    </div>

                    <Separator orientation="vertical" className="hidden h-20 md:block" />
                    <Separator className="md:hidden" />

                    {/* Credibility Score */}
                    <div className="flex flex-col items-center gap-2">
                        <RadialProgress value={credibilityScore} size={110} strokeWidth={7} className="text-emerald">
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-bold text-foreground">{credibilityScore}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                    Real
                                </span>
                            </div>
                        </RadialProgress>
                        <div className="flex flex-col items-center gap-0.5 text-center">
                            <p className="text-xs font-semibold text-foreground/90">{t("credibilityScore")}</p>
                            <span className="text-[10px] text-muted-foreground">
                                {credibilityScore >= 80
                                    ? "Verified"
                                    : credibilityScore >= 50
                                      ? "Consistent"
                                      : "Unverified"}
                            </span>
                        </div>
                    </div>

                    <Separator orientation="vertical" className="hidden h-20 md:block" />
                    <Separator className="md:hidden" />

                    {/* Estimated Seniority */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex size-14 items-center justify-center rounded-full bg-muted border border-border">
                            <Award className="size-6 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">{t("level")}</p>
                            <Badge
                                variant="outline"
                                className={`mt-1 text-xs font-bold uppercase tracking-wide ${getSeniorityColor(analysis.estimatedSeniority)}`}
                            >
                                {analysis.estimatedSeniority}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Razonamiento / Explicaciones Cualitativas */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Explicación Técnica */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <Cpu className="size-4 text-indigo-500" />
                            {t("techScoreExplainTitle", { default: "Explicabilidad del Tech Score" })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground leading-relaxed">{technicalExplanation}</p>
                    </CardContent>
                </Card>

                {/* Explicación de Credibilidad */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <ShieldCheck className="size-4 text-emerald-500" />
                            {t("credibilityExplainTitle", { default: "Explicabilidad de Credibilidad" })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground leading-relaxed">{credibilityExplanation}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Keywords Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Detected Keywords */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Check className="size-5 text-emerald" />
                            {t("detectedKeywords")}
                        </CardTitle>
                        <CardDescription>{t("detectedKeywordsDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysis.detectedKeywords.map((keyword) => (
                                <Badge key={keyword} className="bg-emerald/10 text-emerald hover:bg-emerald/20">
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Missing Keywords */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="size-5 text-warning" />
                            {t("missingKeywords")}
                        </CardTitle>
                        <CardDescription>{t("missingKeywordsDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missingKeywords.map((keyword) => (
                                <Badge key={keyword} variant="outline" className="border-warning/30 text-warning">
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Suggestions */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Lightbulb className="size-5 text-primary" />
                        {t("aiSuggestions")}
                    </CardTitle>
                    <CardDescription>{t("aiSuggestionsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="flex flex-col gap-3">
                        {analysis.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex gap-3 text-sm">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                    {index + 1}
                                </span>
                                <span className="text-muted-foreground">{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPanelOpen(true)}
                    className="gap-1 px-4 text-xs hover:bg-primary/10 border-border"
                >
                    <Eye className="size-3.5" />
                    {t("reasoningBtn")}
                </Button>
            </div>

            <ExplainabilityPanel
                isOpen={isPanelOpen}
                onOpenChange={setIsPanelOpen}
                title={t("atsScoreExplainTitle")}
                score={analysis.atsScore}
                justification={analysis.explainability?.justification}
                evidenceFound={analysis.explainability?.evidenceFound}
                missingEvidence={analysis.explainability?.missingEvidence}
            />
        </div>
    );
}
