"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export interface ImpactVerbSuggestion {
    original: string;
    suggestion: string;
    reason: string;
}

export interface ImpactVerbAnalysis {
    impactScore: number;
    passiveVerbsCount: number;
    activeVerbsCount: number;
    passiveVerbsFound: string[];
    suggestions: ImpactVerbSuggestion[];
    recommendations: string[];
}

interface VerbAnalysisPanelProps {
    analysis: ImpactVerbAnalysis | null;
    isAnalyzing: boolean;
    analyzeDisabled: boolean;
    onAnalyze: () => void;
}

const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
};

/** Panel del analizador de verbos de impacto (ex bloque de resume-builder/page). */
export function VerbAnalysisPanel({ analysis, isAnalyzing, analyzeDisabled, onAnalyze }: VerbAnalysisPanelProps) {
    const t = useTranslations("ResumeBuilder");

    return (
        <Card className="border-primary/20 bg-primary/5 dark:bg-primary/5 backdrop-blur-xs glow-indigo">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                    <Sparkles className="size-5 text-primary" />
                    {t("atsAnalysisTitle")}
                </CardTitle>
                <CardDescription>{t("atsAnalysisDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Button
                    onClick={() => {
                        void onAnalyze();
                    }}
                    disabled={isAnalyzing || analyzeDisabled}
                    className="w-full gap-1.5"
                    size="sm"
                >
                    {isAnalyzing ? (
                        <>
                            <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            {t("analyzingVerbs")}
                        </>
                    ) : (
                        <>
                            <Sparkles className="size-4" />
                            {t("analyzeVerbsBtn")}
                        </>
                    )}
                </Button>

                {analysis && (
                    <div className="space-y-4 pt-2 animate-fade-in text-xs border-t border-primary/10">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">Action/Impact Score:</span>
                            <span className={`text-lg font-bold ${getScoreColor(analysis.impactScore)}`}>
                                {analysis.impactScore}%
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-2 rounded bg-background border border-border">
                                <p className="text-muted-foreground">Verbos Pasivos</p>
                                <p className="text-base font-bold text-warning">{analysis.passiveVerbsCount}</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border">
                                <p className="text-muted-foreground">Verbos Activos</p>
                                <p className="text-base font-bold text-emerald">{analysis.activeVerbsCount}</p>
                            </div>
                        </div>

                        {analysis.passiveVerbsFound.length > 0 && (
                            <div>
                                <p className="font-semibold text-foreground mb-1">Verbos pasivos a evitar:</p>
                                <div className="flex flex-wrap gap-1">
                                    {analysis.passiveVerbsFound.map((v) => (
                                        <Badge
                                            key={v}
                                            className="bg-destructive/10 text-destructive border-none text-[10px]"
                                        >
                                            {v}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.suggestions.length > 0 && (
                            <div className="space-y-2">
                                <p className="font-semibold text-foreground">Sugerencias Antes / Después:</p>
                                <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin pr-1">
                                    {analysis.suggestions.map((s) => (
                                        <div
                                            key={`${s.original}-${s.suggestion}`}
                                            className="p-2.5 rounded-lg border border-border/60 bg-background/50 space-y-1"
                                        >
                                            <p className="text-destructive line-through leading-relaxed">
                                                &ldquo;{s.original}&rdquo;
                                            </p>
                                            <p className="text-emerald font-medium leading-relaxed">
                                                &ldquo;{s.suggestion}&rdquo;
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                                Razón: {s.reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.recommendations.length > 0 && (
                            <div className="rounded-lg border border-primary/10 bg-primary/0 p-2.5 space-y-1">
                                <p className="font-semibold text-primary">Consejos de Optimización:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-0.5 leading-relaxed pl-1">
                                    {analysis.recommendations.map((r) => (
                                        <li key={r}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
