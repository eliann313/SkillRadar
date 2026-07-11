import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProgressDataAction, getCareerRecommendationsAction } from "@/features/cv-analysis/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProgressRecharts } from "@/components/dashboard";
import { TrendingUp, Award, CheckCircle2, ArrowRight, FileText, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
    const { locale } = await params;
    const session = await auth();
    if (!session?.user) {
        redirect("/");
    }

    const t = await getTranslations("Progress");

    const res = await getProgressDataAction();
    const recsRes = await getCareerRecommendationsAction();
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

    const { resumes, totalMatches, averageScore, closedSkills } = res.data;

    // Si el usuario no tiene historial de CVs
    if (resumes.length === 0) {
        return (
            <div className="space-y-6">
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
            </div>
        );
    }

    // Preparar datos para el gráfico agregando versión sequence index (#1, #2...) para evitar superposición
    const chartData = resumes.map(
        (r: { createdAt: Date | string; atsScore: number | null; fileName: string }, index: number) => {
            const dateStr = new Date(r.createdAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                day: "numeric",
                month: "short",
            });
            return {
                date: `${dateStr} (#${index + 1})`,
                score: r.atsScore || 0,
                name: r.fileName,
            };
        },
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <Link
                    href="/dashboard/cv-analysis"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1.5")}
                >
                    <FileText className="size-4" />
                    {t("uploadNewVersion")}
                </Link>
            </div>

            {/* Malla de Métricas */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("cardAts")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">
                                {resumes[resumes.length - 1].atsScore}
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

            {/* Gráfico de Progreso */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <TrendingUp className="size-5 text-primary" />
                        {t("versionsTitle")}
                    </CardTitle>
                    <CardDescription>{t("versionsDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <ProgressRecharts data={chartData} />
                </CardContent>
            </Card>

            {/* Career Copilot Recommendations */}
            {recsRes.success && recsRes.data && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background backdrop-blur-sm shadow-xs overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <Sparkles className="size-5 text-primary animate-pulse" />
                            Career Copilot — Recomendaciones de Crecimiento
                        </CardTitle>
                        <CardDescription>
                            Sugerencias de tecnologías, proyectos y roadmaps para cerrar brechas técnicas frente a las
                            vacantes del Job Board.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Tecnologías sugeridas */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b pb-1.5 border-border">
                                    <Award className="size-4 text-primary" />
                                    Tecnologías Recomendadas
                                </h3>
                                <div className="space-y-3">
                                    {recsRes.data.technologies.map((tech, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-3"
                                        >
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "capitalize shrink-0 text-[10px] font-medium px-2 py-0.5 border-none",
                                                    tech.importance === "high"
                                                        ? "bg-rose-500/10 text-rose-500"
                                                        : tech.importance === "medium"
                                                          ? "bg-amber-500/10 text-amber-500"
                                                          : "bg-blue-500/10 text-blue-500",
                                                )}
                                            >
                                                {tech.importance === "high"
                                                    ? "Alta"
                                                    : tech.importance === "medium"
                                                      ? "Media"
                                                      : "Baja"}
                                            </Badge>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-bold text-foreground">{tech.name}</h4>
                                                <p className="text-xs text-muted-foreground leading-normal">
                                                    {tech.reason}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Roadmaps sugeridos */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b pb-1.5 border-border">
                                    <Calendar className="size-4 text-primary" />
                                    Ruta de Aprendizaje Sugerida
                                </h3>
                                {recsRes.data.roadmaps.map((map, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-lg border border-border bg-card/60 space-y-3 relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-bold text-foreground">{map.title}</h4>
                                            <Badge
                                                variant="outline"
                                                className="bg-primary/5 text-primary border-primary/10 text-[10px] font-mono"
                                            >
                                                {map.duration}
                                            </Badge>
                                        </div>
                                        <ol className="relative border-l border-border/80 ml-2 space-y-3.5 mt-2">
                                            {map.steps.map((step, sIdx) => (
                                                <li key={sIdx} className="mb-0 ml-4">
                                                    <span className="absolute flex items-center justify-center w-5 h-5 bg-background rounded-full -left-2.5 border border-border text-[10px] font-mono font-semibold text-primary">
                                                        {sIdx + 1}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground leading-normal">
                                                        {step}
                                                    </p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Proyectos sugeridos */}
                        {recsRes.data.projects && recsRes.data.projects.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b pb-1.5 border-border">
                                    <Sparkles className="size-4 text-primary" />
                                    Proyectos Sugeridos para Potenciar tu CV
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {recsRes.data.projects.map((proj, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-lg border border-border/60 bg-muted/10 flex flex-col justify-between gap-3 hover:border-primary/30 transition-all"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center gap-2">
                                                    <h4 className="text-sm font-bold text-foreground">{proj.title}</h4>
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            "capitalize text-[10px] font-medium border-none",
                                                            proj.difficulty === "advanced"
                                                                ? "bg-rose-500/10 text-rose-500"
                                                                : proj.difficulty === "intermediate"
                                                                  ? "bg-amber-500/10 text-amber-500"
                                                                  : "bg-emerald-500/10 text-emerald-500",
                                                        )}
                                                    >
                                                        {proj.difficulty === "beginner"
                                                            ? "Principiante"
                                                            : proj.difficulty === "intermediate"
                                                              ? "Intermedio"
                                                              : "Avanzado"}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {proj.description}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {proj.technologies.map((t) => (
                                                    <Badge
                                                        key={t}
                                                        variant="secondary"
                                                        className="text-[10px] bg-secondary/80 text-secondary-foreground"
                                                    >
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-12">
                {/* Habilidades Cerradas (Logros) */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm md:col-span-5 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Award className="size-5 text-emerald-500" />
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
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm md:col-span-7">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <FileText className="size-5 text-primary" />
                            {t("versionsTitle")}
                        </CardTitle>
                        <CardDescription>{t("versionsDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="divide-y divide-border/40">
                            {[...resumes].reverse().map((resume) => (
                                <div
                                    key={resume.id}
                                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <FileText className="size-5 text-primary" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p
                                                className="text-sm font-semibold truncate text-foreground pr-4"
                                                title={resume.fileName}
                                            >
                                                {resume.fileName}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Calendar className="size-3" />
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
