import { auth } from "@/infrastructure/auth";
import { db } from "@/infrastructure/db";
import { redirect } from "next/navigation";
import {
    getProgressDataAction,
    getCareerRecommendationsAction,
} from "@/features/cv-analysis/application/cv-analysis.use-cases";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
    ProgressRecharts,
    RoadmapChecklist,
    ExportReportButton,
    CareerPathPanel,
    SkillRadarChart,
    PublicProfileShareCard,
} from "@/components/dashboard";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Award,
    CheckCircle2,
    ArrowRight,
    FileText,
    Calendar,
    Sparkles,
    Flame,
    Terminal,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared-kernel/utils";
import { getTranslations } from "next-intl/server";

interface PageProps {
    params: Promise<{
        locale: string;
    }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Progress" });
    return {
        title: `${t("title")} | SkillRadar`,
        description: t("subtitle"),
    };
}

export default async function ProgressPage({ params }: PageProps) {
    const [{ locale }, session] = await Promise.all([params, auth()]);
    if (!session?.user) {
        redirect("/");
    }

    const t = await getTranslations("Progress");

    // En paralelo: las recomendaciones IA no deben bloquear el gráfico ni las métricas.
    // getCareerRecommendationsAction ya usa el careerPath guardado como default.
    const [res, recsRes, me] = await Promise.all([
        getProgressDataAction(),
        getCareerRecommendationsAction(),
        session.user.isGuest
            ? Promise.resolve(null)
            : db.user.findUnique({ where: { id: session.user.id }, select: { careerPath: true } }).catch(() => null),
    ]);
    const savedPath = recsRes.success && recsRes.data?.targetPath ? recsRes.data.targetPath : (me?.careerPath ?? null);
    if (!res.success || !res.data) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6 border rounded-lg border-destructive/20 bg-destructive/5">
                <p className="text-sm font-semibold text-destructive mb-2">{t("errorLoading")}</p>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">
                    {res.error || "Ocurrió un error inesperado."}
                </p>
                <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
                    {t("backToDashboard")}
                </Link>
            </div>
        );
    }

    const {
        resumes,
        totalMatches,
        averageScore,
        closedSkills,
        latestKeywords = [],
        publicProfile = null,
        githubLanguages = {},
    } = res.data;

    // Si el usuario no tiene historial de CVs
    if (resumes.length === 0) {
        return (
            <div className="space-y-6 w-full max-w-full overflow-hidden">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>

                <Card className="border-dashed border-2 border-border flex flex-col items-center justify-center p-12 text-center min-h-[350px]">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary animate-pulse">
                        <FileText className="size-8" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">{t("noHistoryTitle")}</h2>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">{t("noHistoryDesc")}</p>
                    <Link
                        href="/dashboard/cv-analysis"
                        className={cn(buttonVariants({ variant: "default" }), "group flex items-center gap-1.5")}
                    >
                        {t("noHistoryCta")}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Card>

                <PublicProfileShareCard publicProfile={publicProfile} />
            </div>
        );
    }

    // Preparar datos para el gráfico agregando versión sequence index (#1, #2...) para evitar superposición
    const chartData = resumes.map(
        (r: { createdAt: Date | string; atsScore: number | null; fileName: string }, index: number) => {
            const parsed = new Date(r.createdAt);
            const dateStr = Number.isNaN(parsed.getTime())
                ? `#${index + 1}`
                : parsed.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                      day: "numeric",
                      month: "short",
                  });
            return {
                date: `${dateStr} (#${index + 1})`,
                score: r.atsScore ?? 0,
                name: r.fileName,
            };
        },
    );

    const initialScore = resumes[0]?.atsScore ?? 0;
    const latestScore = resumes[resumes.length - 1]?.atsScore ?? 0;
    const scoreDelta = latestScore - initialScore;
    const hasMultipleVersions = resumes.length > 1;

    return (
        <div className="space-y-6 w-full max-w-full overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full max-w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <ExportReportButton
                        resumes={resumes.map((r) => ({
                            fileName: r.fileName,
                            atsScore: r.atsScore,
                            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
                        }))}
                        averageScore={averageScore}
                        totalMatches={totalMatches}
                        closedSkills={closedSkills}
                    />
                    <Link
                        href="/dashboard/cv-analysis"
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1.5")}
                    >
                        <FileText className="size-4" />
                        {t("uploadNewVersion")}
                    </Link>
                </div>
            </div>

            {/* Malla de Métricas */}
            <div className="grid gap-4 sm:grid-cols-3 w-full max-w-full">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("cardAts")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">
                                {resumes[resumes.length - 1].atsScore ?? 0}
                            </span>
                            <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {t("cardAtsDesc", { file: resumes[resumes.length - 1].fileName })}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("cardMatches")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{totalMatches}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">{t("cardMatchesDesc")}</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("cardAverage")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">{averageScore}</span>
                            <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{t("cardAverageDesc")}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Racha y mejora */}
            <div className="grid gap-4 sm:grid-cols-2 w-full max-w-full">
                <Card className="border-border/60 bg-card/60 backdrop-blur-sm hover:border-warning/30 transition-colors duration-300 w-full max-w-full overflow-hidden">
                    <CardContent className="p-5 flex items-start gap-4">
                        <div className="size-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0 border border-warning/20 shadow-xs">
                            <Flame className="size-6 text-warning" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-foreground">
                                    {t("streakTitle", { count: resumes.length })}
                                </p>
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-2 py-0.5 bg-warning/5 text-warning border-warning/20 shrink-0 font-medium"
                                >
                                    {t("streakBadge", { count: resumes.length })}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{t("streakDesc")}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={cn(
                        "border-border/60 bg-card/60 backdrop-blur-sm transition-colors duration-300 w-full max-w-full overflow-hidden",
                        scoreDelta > 0 && "hover:border-emerald/30",
                        scoreDelta < 0 && "hover:border-destructive/30",
                        scoreDelta === 0 && "hover:border-primary/30",
                    )}
                >
                    <CardContent className="p-5 flex items-start gap-4">
                        <div
                            className={cn(
                                "size-12 rounded-xl flex items-center justify-center shrink-0 border shadow-xs",
                                scoreDelta > 0 && "bg-emerald/10 text-emerald border-emerald/20",
                                scoreDelta < 0 && "bg-destructive/10 text-destructive border-destructive/20",
                                scoreDelta === 0 && "bg-primary/10 text-primary border-primary/20",
                            )}
                        >
                            {scoreDelta > 0 ? (
                                <TrendingUp className="size-6 text-emerald" />
                            ) : scoreDelta < 0 ? (
                                <TrendingDown className="size-6 text-destructive" />
                            ) : (
                                <Minus className="size-6 text-primary" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-foreground">
                                    {scoreDelta > 0
                                        ? t("improvementPositiveTitle", {
                                              delta: scoreDelta,
                                              default: `+${scoreDelta} puntos de mejora total`,
                                          })
                                        : scoreDelta < 0
                                          ? t("improvementNegativeTitle", {
                                                delta: Math.abs(scoreDelta),
                                                default: `${Math.abs(scoreDelta)} puntos de variación`,
                                            })
                                          : t("improvementNeutralTitle", { default: "Puntaje constante" })}
                                </p>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] px-2 py-0.5 shrink-0 font-mono font-bold",
                                        scoreDelta > 0 && "bg-emerald/10 text-emerald border-emerald/20",
                                        scoreDelta < 0 && "bg-destructive/10 text-destructive border-destructive/20",
                                        scoreDelta === 0 && "bg-muted text-muted-foreground border-border",
                                    )}
                                >
                                    {scoreDelta > 0
                                        ? `+${scoreDelta} pts`
                                        : scoreDelta < 0
                                          ? `${scoreDelta} pts`
                                          : "0 pts"}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {hasMultipleVersions
                                    ? scoreDelta > 0
                                        ? t("improvementDescPositive", {
                                              delta: scoreDelta,
                                              default: `Diferencia acumulada entre tu primera y última versión analizada (+${scoreDelta} pts).`,
                                          })
                                        : scoreDelta < 0
                                          ? t("improvementDescNegative", {
                                                delta: Math.abs(scoreDelta),
                                                default: `Tu última versión está ${Math.abs(scoreDelta)} pts por debajo de la inicial.`,
                                            })
                                          : t("improvementDescNeutral", {
                                                default:
                                                    "Tu puntaje se mantiene igual respecto a la primera versión analizada.",
                                            })
                                    : t("singleVersionDesc", {
                                          default: "Sube nuevas versiones de tu CV para medir tu evolución temporal.",
                                      })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Skill Radar en Vivo y Perfil Público */}
            <div className="grid gap-6 lg:grid-cols-12 w-full max-w-full">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-7 flex flex-col justify-between w-full max-w-full overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Sparkles className="size-5 text-primary shrink-0" />
                                {t("radarSectionTitle", { default: "Tu Skill Radar en Vivo" })}
                            </CardTitle>
                            <Badge
                                variant="outline"
                                className="text-xs bg-primary/10 text-primary border-primary/20 shrink-0"
                            >
                                {t("radarLiveBadge", { default: "En Vivo" })}
                            </Badge>
                        </div>
                        <CardDescription>
                            {t("radarSectionDesc", {
                                default:
                                    "Distribución técnica calculada a partir de tu último CV analizado y proyectos.",
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center pt-2 w-full max-w-full overflow-hidden">
                        <SkillRadarChart keywords={latestKeywords} showBreakdown />
                        {Object.keys(githubLanguages).length > 0 && (
                            <div className="w-full max-w-full overflow-hidden mt-4 pt-3 border-t border-border/30">
                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                                    <Terminal className="size-3.5 text-indigo-400" />
                                    {t("githubLanguages", { default: "Distribución de GitHub detectada:" })}
                                </p>
                                <div className="space-y-1.5">
                                    {Object.entries(githubLanguages)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 3)
                                        .map(([lang, pct]) => (
                                            <div key={lang} className="space-y-0.5">
                                                <div className="flex justify-between text-[11px]">
                                                    <span className="font-medium text-foreground">{lang}</span>
                                                    <span className="font-mono text-muted-foreground">{pct}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-[width] duration-300"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="lg:col-span-5 flex flex-col w-full max-w-full overflow-hidden">
                    <PublicProfileShareCard publicProfile={publicProfile} />
                </div>
            </div>

            {/* Gráfico de Progreso */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm w-full max-w-full overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <TrendingUp className="size-5 text-primary shrink-0" />
                        {t("versionsTitle")}
                    </CardTitle>
                    <CardDescription>{t("versionsDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2 w-full max-w-full overflow-hidden min-w-0">
                    <ProgressRecharts data={chartData} />
                </CardContent>
            </Card>

            {/* Roadmap accionable */}
            <RoadmapChecklist />

            {/* Career Copilot: camino elegible por el usuario (cualquier profesión, no solo IT) */}
            {recsRes.success && recsRes.data ? (
                <CareerPathPanel initial={recsRes.data} initialPath={savedPath} />
            ) : (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background backdrop-blur-sm shadow-xs overflow-hidden relative">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <Sparkles className="size-5 text-primary animate-pulse" />
                            Career Copilot — Recomendaciones de Crecimiento
                        </CardTitle>
                        <CardDescription>
                            Elegí un camino profesional para recibir oportunidades, habilidades, ruta y proyectos
                            generados por IA.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CareerPathPanel initial={null} initialPath={savedPath} />
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-12 w-full max-w-full">
                {/* Habilidades Cerradas (Logros) */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm md:col-span-5 flex flex-col w-full max-w-full overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Award className="size-5 text-emerald-500 shrink-0" />
                            {t("closedSkillsTitle")}
                        </CardTitle>
                        <CardDescription>{t("closedSkillsDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center min-h-[150px] pt-0">
                        {closedSkills.length === 0 ? (
                            <div className="text-center p-4 text-muted-foreground">
                                <div className="size-10 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-2 text-muted-foreground/60">
                                    <TrendingUp className="size-5" />
                                </div>
                                <p className="text-xs font-semibold text-foreground/80">{t("noClosedSkills")}</p>
                                <p className="text-[11px] max-w-xs mx-auto mt-1 leading-normal">
                                    {t("noClosedSkillsDesc")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="size-3.5" />
                                    {t("closedSkillsAchievement", { count: closedSkills.length })}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {closedSkills.map((skill: string) => (
                                        <Badge
                                            key={skill}
                                            variant="secondary"
                                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 px-2.5 py-1 text-xs transition-colors"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Historial de CVs */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm md:col-span-7 w-full max-w-full overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <FileText className="size-5 text-primary shrink-0" />
                            {t("versionsTitle")}
                        </CardTitle>
                        <CardDescription>{t("versionsDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="divide-y divide-border/40">
                            {[...resumes].reverse().map((resume) => (
                                <div
                                    key={resume.id}
                                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-2 min-w-0"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <FileText className="size-5 text-primary" />
                                        </div>
                                        <div className="overflow-hidden min-w-0 flex-1">
                                            <p
                                                className="text-sm font-semibold truncate text-foreground pr-2"
                                                title={resume.fileName}
                                            >
                                                {resume.fileName}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                                <Calendar className="size-3 shrink-0" />
                                                {new Date(resume.createdAt).toLocaleDateString(
                                                    locale === "es" ? "es-ES" : "en-US",
                                                    {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    },
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 pl-2 shrink-0">
                                        <span className="text-sm font-bold text-foreground">{resume.atsScore}</span>
                                        <span className="text-[10px] text-muted-foreground">Score</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
