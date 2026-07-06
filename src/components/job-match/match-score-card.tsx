"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { JobMatch } from "@/lib/types";
import { Check, X, Target, TrendingUp, AlertCircle, Sparkles, Eye, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExplainabilityPanel } from "@/components/explainability-panel";
import { generateSmartPitchAction } from "@/features/job-match/actions";
import { toast } from "sonner";

interface MatchScoreCardProps {
    match: JobMatch;
}

export function MatchScoreCard({ match }: MatchScoreCardProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [pitch, setPitch] = useState<string | null>(null);
    const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleGeneratePitch = async () => {
        setIsGeneratingPitch(true);
        try {
            const res = await generateSmartPitchAction(match.id);
            if (res.success) {
                setPitch(res.data);
                toast.success("¡Pitch de Valor generado con éxito!");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error al generar el pitch");
        } finally {
            setIsGeneratingPitch(false);
        }
    };

    const handleCopy = async () => {
        if (!pitch) return;
        try {
            await navigator.clipboard.writeText(pitch);
            setIsCopied(true);
            toast.success("Copiado al portapapeles");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error(error);
            toast.error("No se pudo copiar");
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald";
        if (score >= 60) return "text-primary";
        if (score >= 40) return "text-warning";
        return "text-destructive";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent Match";
        if (score >= 60) return "Good Match";
        if (score >= 40) return "Partial Match";
        return "Low Match";
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return "bg-emerald";
        if (score >= 60) return "bg-primary";
        if (score >= 40) return "bg-warning";
        return "bg-destructive";
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="size-5 text-primary" />
                            Match Results
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {match.jobTitle}
                            {match.company && ` at ${match.company}`}
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className={cn("text-4xl font-bold", getScoreColor(match.matchScore))}>
                            {match.matchScore}%
                        </span>
                        <p className="text-xs text-muted-foreground">{getScoreLabel(match.matchScore)}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPanelOpen(true)}
                            className="h-7 px-2 mt-1 gap-1 text-[11px] text-primary hover:bg-primary/10 hover:text-primary"
                        >
                            <Eye className="size-3" />
                            Ver Razonamiento
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                {/* Progress bar */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Compatibility Score</span>
                        <span className="font-medium">{match.matchScore}/100</span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn("h-full transition-all duration-500", getProgressColor(match.matchScore))}
                            style={{ width: `${match.matchScore}%` }}
                        />
                    </div>
                </div>

                <Separator />

                {/* Skills breakdown */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Aligned Skills */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald/10">
                                <Check className="size-4 text-emerald" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Aligned Skills</p>
                                <p className="text-xs text-muted-foreground">
                                    {match.alignedSkills.length} skills match
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {match.alignedSkills.map((skill) => (
                                <Badge key={skill} className="bg-emerald/10 text-emerald hover:bg-emerald/20">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
                                <X className="size-4 text-destructive" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Skill Gaps</p>
                                <p className="text-xs text-muted-foreground">
                                    {match.missingSkills.length} skills to learn
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {match.missingSkills.map((skill) => (
                                <Badge key={skill} variant="outline" className="border-destructive/30 text-destructive">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Recommendation */}
                <div className="flex gap-3 rounded-lg bg-muted/50 p-4">
                    {match.matchScore >= 70 ? (
                        <>
                            <TrendingUp className="size-5 shrink-0 text-emerald" />
                            <div>
                                <p className="font-medium text-foreground">Strong Candidate</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Your profile aligns well with this position. Consider applying and highlighting your{" "}
                                    {match.alignedSkills.slice(0, 3).join(", ")} experience.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="size-5 shrink-0 text-warning" />
                            <div>
                                <p className="font-medium text-foreground">Consider Upskilling</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Focus on learning {match.missingSkills.slice(0, 2).join(" and ")} to improve your
                                    match score for similar positions.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* AI Recommendations */}
                {match.recommendations && match.recommendations.length > 0 && (
                    <>
                        <Separator />
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-5 text-primary animate-pulse" />
                                <p className="font-semibold text-foreground">AI Action Steps</p>
                            </div>
                            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                                {match.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                {/* Tu Ruta de Crecimiento / Action Plan (Tarea 11.2) */}
                {match.actionPlan && match.actionPlan.length > 0 && (
                    <>
                        <Separator />
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="size-5 text-emerald" />
                                <h3 className="font-semibold text-foreground">Tu Ruta de Crecimiento (Action Plan)</h3>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {match.actionPlan.map((plan, idx) => (
                                    <div key={idx} className="rounded-lg border border-border/80 bg-muted/20 p-4">
                                        <Badge className="mb-2 bg-indigo/10 text-indigo hover:bg-indigo/20">
                                            {plan.skill}
                                        </Badge>
                                        <ol className="flex flex-col gap-2 mt-2">
                                            {plan.steps.map((step, sIdx) => (
                                                <li key={sIdx} className="flex gap-2 text-xs text-muted-foreground">
                                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                                        {sIdx + 1}
                                                    </span>
                                                    <span className="leading-5">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <Separator />

                {/* Smart Pitch / Auto-Cover Letter */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Smart Pitch / Carta de Presentación</h3>
                    </div>

                    {!pitch ? (
                        <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 p-6 text-center flex flex-col items-center gap-3">
                            <p className="text-xs text-muted-foreground max-w-md">
                                Genera un pitch de presentación personalizado y honesto para esta oferta. Enfocado en tu
                                valor inmediato y tus brechas.
                            </p>
                            <Button
                                onClick={() => {
                                    void handleGeneratePitch();
                                }}
                                disabled={isGeneratingPitch}
                                size="sm"
                            >
                                {isGeneratingPitch ? (
                                    <>
                                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                                        Redactando Pitch...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-1.5 size-3.5" />
                                        Generar Pitch de Valor
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <textarea
                                    value={pitch}
                                    onChange={(e) => setPitch(e.target.value)}
                                    className="w-full min-h-[160px] p-3 text-xs bg-muted/20 border border-border/80 rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:border-primary font-sans leading-relaxed outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        void handleGeneratePitch();
                                    }}
                                    disabled={isGeneratingPitch}
                                    className="h-8 text-[11px]"
                                >
                                    {isGeneratingPitch ? (
                                        <Loader2 className="size-3 animate-spin" />
                                    ) : (
                                        "Volver a Generar"
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        void handleCopy();
                                    }}
                                    className="h-8 text-[11px] gap-1"
                                >
                                    {isCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
                                    {isCopied ? "Copiado" : "Copiar"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <ExplainabilityPanel
                isOpen={isPanelOpen}
                onOpenChange={setIsPanelOpen}
                title="Explicabilidad de Job Match"
                score={match.matchScore}
                justification={match.explainability?.justification}
                evidenceFound={match.explainability?.evidenceFound}
                missingEvidence={match.explainability?.missingEvidence}
            />
        </Card>
    );
}
