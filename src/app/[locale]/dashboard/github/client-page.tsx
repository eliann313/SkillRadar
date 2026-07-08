"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageChart } from "@/components/github/language-chart";
import { RepoList } from "@/components/github/repo-list";
import { AnalysisCards } from "@/components/github/analysis-cards";
import { analyzeGithubUserAction } from "@/features/github/actions";
import { toast } from "sonner";
import {
    Loader2,
    RefreshCw,
    Calendar,
    Sparkles,
    CheckCircle2,
    XCircle,
    TrendingUp,
    GitCommit,
    Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

interface GitHubRepo {
    name: string;
    description: string | null;
    stars: number;
    language: string | null;
    url: string;
}

interface DetectedPatterns {
    hasCI: boolean;
    hasTesting: boolean;
    hasDocker: boolean;
    hasAuthImplementation: boolean;
    hasCaching: boolean;
    hasObservability: boolean;
}

interface GitHubDashboardClientProps {
    initialData: {
        id: string;
        githubUser: string;
        profileScore: number;
        languages: Record<string, number>;
        repos: GitHubRepo[];
        analysis: {
            strengths: string[];
            weaknesses: string[];
            suggestions: string[];
        };
        createdAt: Date;
        // 18.1: Seniority Signals
        commitFrequency?: string | null;
        readmeQualityScore?: number | null;
        longestStreakDays?: number | null;
        topRepoTopics?: string[] | null;
        senioritySignals?: string[] | null;
        detectedPatterns?: DetectedPatterns | null;
    } | null;
}

export function GitHubDashboardClient({ initialData }: GitHubDashboardClientProps) {
    const [data, setData] = useState(initialData);
    const [usernameInput, setUsernameInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const targetUsername = data ? data.githubUser : usernameInput;

        if (!targetUsername.trim()) {
            toast.error("El nombre de usuario es requerido.");
            return;
        }

        setIsLoading(true);
        const promise = analyzeGithubUserAction(targetUsername);

        toast.promise(promise, {
            loading: "Analizando perfil y repositorios de GitHub...",
            success: (res: {
                success: boolean;
                data?: {
                    id: string;
                    githubUser: string;
                    profileScore: number | null;
                    languages: unknown;
                    repos: unknown;
                    analysis: unknown;
                    createdAt: Date;
                };
                error?: string;
            }) => {
                if (res.success && res.data) {
                    const mappedData = {
                        id: res.data.id,
                        githubUser: res.data.githubUser,
                        profileScore: res.data.profileScore || 0,
                        languages: (res.data.languages as Record<string, number>) || {},
                        repos: (res.data.repos as GitHubRepo[]) || [],
                        analysis: (res.data.analysis as {
                            strengths: string[];
                            weaknesses: string[];
                            suggestions: string[];
                        }) || { strengths: [], weaknesses: [], suggestions: [] },
                        createdAt: new Date(res.data.createdAt),
                    };
                    setData(mappedData);
                    setIsLoading(false);
                    return "¡Análisis de GitHub completado con éxito!";
                } else {
                    setIsLoading(false);
                    throw new Error(res.error || "Ocurrió un error al analizar.");
                }
            },
            error: (err: Error) => {
                setIsLoading(false);
                return err.message;
            },
        });
    };

    if (!data) {
        return (
            <Card className="max-w-md mx-auto border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <GitHubLogoIcon className="size-6 text-primary" />
                    </div>
                    <CardTitle>Vincular Perfil GitHub</CardTitle>
                    <CardDescription>
                        Ingresa tu nombre de usuario para importar y evaluar tus contribuciones y proyectos de código.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => void handleAnalyze(e)} className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="github-username">Usuario de GitHub</Label>
                            <Input
                                id="github-username"
                                type="text"
                                placeholder="ej: octocat"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Analizando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4 animate-pulse" />
                                    Analizar Perfil
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header del Perfil */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                        <GitHubLogoIcon className="size-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">@{data.githubUser}</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Calendar className="size-3.5" />
                            Último análisis: {data.createdAt.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Score Circular / Badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">Portfolio Score:</span>
                        <span className="text-xl font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">
                            {data.profileScore}
                        </span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleAnalyze()}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
                        Sincronizar
                    </Button>
                </div>
            </div>

            {/* Fortalezas y Debilidades de la IA */}
            <AnalysisCards analysis={data.analysis} />

            {/* 18.1: Seniority Signals Panel */}
            {data.detectedPatterns && (
                <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="size-5 text-primary" />
                        <h3 className="text-base font-semibold text-foreground">Seniority Intelligence</h3>
                        <span className="text-xs text-muted-foreground ml-auto">Evidence-based Skills</span>
                    </div>

                    {/* Métricas rápidas */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {data.commitFrequency && (
                            <div className="flex flex-col gap-1 rounded-lg bg-muted/30 p-3">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <GitCommit className="size-3" /> Commit Frequency
                                </span>
                                <Badge variant="outline" className="w-fit capitalize text-xs">
                                    {data.commitFrequency}
                                </Badge>
                            </div>
                        )}
                        {data.readmeQualityScore !== null && (
                            <div className="flex flex-col gap-1 rounded-lg bg-muted/30 p-3">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Star className="size-3" /> README Quality
                                </span>
                                <span className="text-lg font-bold text-primary">
                                    {data.readmeQualityScore}
                                    <span className="text-xs text-muted-foreground">/100</span>
                                </span>
                            </div>
                        )}
                        {data.longestStreakDays !== null && (
                            <div className="flex flex-col gap-1 rounded-lg bg-muted/30 p-3">
                                <span className="text-xs text-muted-foreground">Longest Streak</span>
                                <span className="text-lg font-bold text-primary">
                                    {data.longestStreakDays}
                                    <span className="text-xs text-muted-foreground"> days</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Detected Patterns Checklist */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                            Detected Patterns
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {(
                                [
                                    { key: "hasCI", label: "CI/CD" },
                                    { key: "hasTesting", label: "Testing" },
                                    { key: "hasDocker", label: "Docker" },
                                    { key: "hasAuthImplementation", label: "Auth Flow" },
                                    { key: "hasCaching", label: "Caching" },
                                    { key: "hasObservability", label: "Observability" },
                                ] as const
                            ).map(({ key, label }) => {
                                const detected = data.detectedPatterns?.[key] ?? false;
                                return (
                                    <div
                                        key={key}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                            detected
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                : "bg-muted/20 text-muted-foreground border border-border/30"
                                        }`}
                                    >
                                        {detected ? (
                                            <CheckCircle2 className="size-3.5 shrink-0" />
                                        ) : (
                                            <XCircle className="size-3.5 shrink-0 opacity-40" />
                                        )}
                                        {label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Seniority Signals */}
                    {data.senioritySignals && data.senioritySignals.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                Seniority Evidence
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {data.senioritySignals.map((signal, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                        {signal}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top Topics */}
                    {data.topRepoTopics && data.topRepoTopics.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                Top Topics
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {data.topRepoTopics.map((topic, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Distribución de Lenguajes */}
                <LanguageChart languages={data.languages} />

                {/* Repositorios */}
                <RepoList repos={data.repos} />
            </div>
        </div>
    );
}
