import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SkillRadarChart } from "@/components/dashboard";
import { Globe, Shield, Calendar, Sparkles, Terminal, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { trackServerEvent } from "@/lib/analytics";
import { getTranslations } from "next-intl/server";

interface PageProps {
    params: Promise<{
        locale: string;
        username: string;
    }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { username, locale } = await params;
    const t = await getTranslations({ locale, namespace: "PublicProfile" });
    const user = await db.user.findUnique({
        where: { publicUsername: username },
        select: {
            name: true,
            isPublicProfile: true,
        },
    });

    if (!user || !user.isPublicProfile) {
        return {
            title: t("privateTitle"),
        };
    }

    const displayName = user.name || username;
    return {
        title: `${displayName} - ${t("title")} | SkillRadar`,
        description: `Visualiza el Skill Radar y tecnologías dominadas de ${displayName} en SkillRadar.`,
        openGraph: {
            title: `${displayName} - ${t("title")} | SkillRadar`,
            description: `Perfil interactivo con Skill Radar y tecnologías de ${displayName}.`,
            type: "profile",
            images: [
                {
                    url: `/api/badge/${username}`,
                    width: 540,
                    height: 180,
                    alt: `SkillRadar Badge para ${displayName}`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${displayName} - ${t("title")} | SkillRadar`,
            description: `Perfil interactivo con Skill Radar y tecnologías de ${displayName}.`,
            images: [`/api/badge/${username}`],
        },
    };
}

export default async function PublicProfilePage({ params }: PageProps) {
    const { username, locale } = await params;
    const t = await getTranslations({ locale, namespace: "PublicProfile" });

    // Cargar datos del usuario
    const user = await db.user.findUnique({
        where: { publicUsername: username },
        include: {
            resumes: {
                where: { atsScore: { not: null } },
                orderBy: { createdAt: "desc" },
                take: 1,
            },
            githubAnalyses: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    // Validar privacidad
    if (!user || !user.isPublicProfile) {
        notFound();
    }

    // Registrar evento de vista de perfil público
    void trackServerEvent("public_profile_viewed", user.id, { username });

    const latestResume = user.resumes[0] || null;
    const latestGithub = user.githubAnalyses[0] || null;

    // Extraer habilidades y seniority del CV
    let keywords: string[] = [];
    let seniority = t("notDefined");
    let resumeUpdatedAt: Date | null = null;

    if (latestResume) {
        const analysis = latestResume.analysis as { keywords?: string[]; estimatedSeniority?: string } | null;
        keywords = Array.isArray(analysis?.keywords) ? analysis.keywords : [];
        seniority = analysis?.estimatedSeniority || t("notDefined");
        resumeUpdatedAt = latestResume.createdAt;
    }

    // Extraer lenguajes de GitHub
    let githubLanguages: Record<string, number> = {};
    let githubUpdatedAt: Date | null = null;

    if (latestGithub) {
        const rawLanguages = (latestGithub.languages as Record<string, number>) || {};
        const totalBytes = Object.values(rawLanguages).reduce((a, b) => a + b, 0);
        if (totalBytes > 0) {
            for (const [lang, bytes] of Object.entries(rawLanguages)) {
                githubLanguages[lang] = (bytes / totalBytes) * 100;
            }
        } else {
            githubLanguages = rawLanguages;
        }
        githubUpdatedAt = latestGithub.createdAt;
    }

    const dateToShow = resumeUpdatedAt || githubUpdatedAt || user.createdAt;
    const dateString = new Date(dateToShow).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full mx-auto space-y-8">
                {/* Header del Perfil */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/25">
                            {user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || username[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {user.name || username}
                            </h1>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                <Globe className="size-4 text-emerald-500" />
                                {t("verifiedProfile")}
                            </p>
                        </div>
                    </div>
                    {user.showSeniority && seniority !== t("notDefined") && (
                        <Badge
                            variant="secondary"
                            className="capitalize text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                            {seniority} Developer
                        </Badge>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    {/* Gráfico de Radar (Core) */}
                    <Card className="border-border/50 bg-card/40 backdrop-blur-sm md:col-span-6 flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Sparkles className="size-5 text-primary" />
                                {t("chartTitle")}
                            </CardTitle>
                            <CardDescription>{t("chartDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-4">
                            <SkillRadarChart keywords={keywords} />
                        </CardContent>
                    </Card>

                    {/* GitHub Languages (Derecha superior) */}
                    {user.showGithub && (
                        <Card className="border-border/50 bg-card/40 backdrop-blur-sm md:col-span-6 flex flex-col justify-between">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Terminal className="size-5 text-indigo-500" />
                                    {t("githubTitle")}
                                </CardTitle>
                                <CardDescription>{t("githubDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-center p-6 pt-0">
                                {Object.keys(githubLanguages).length === 0 ? (
                                    <div className="text-center text-muted-foreground py-6">
                                        <p className="text-xs">{t("noGithubData")}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {Object.entries(githubLanguages)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 5)
                                            .map(([lang, percentage]) => (
                                                <div key={lang} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-semibold">
                                                        <span>{lang}</span>
                                                        <span>{Math.round(percentage)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Top Skills Badges */}
                {user.showSkills && keywords.length > 0 && (
                    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <FileText className="size-5 text-emerald-500" />
                                {t("topSkillsTitle")}
                            </CardTitle>
                            <CardDescription>{t("topSkillsDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2 pt-0">
                            {keywords.slice(0, 15).map((skill) => (
                                <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 px-2.5 py-1 text-xs transition-colors capitalize"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Footer Metadata */}
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border/20">
                    <p className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {t("lastSync", { date: dateString })}
                    </p>
                    <p className="flex items-center gap-1">
                        <Shield className="size-3.5" />
                        {t("protectedProfile")}
                    </p>
                </div>
            </div>

            {/* CTA Viral Growth Loop */}
            <div className="mt-16 text-center max-w-sm mx-auto">
                <Card className="border-primary/25 bg-primary/5 backdrop-blur-md p-6 flex flex-col items-center gap-4">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="size-5" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground">{t("ctaTitle")}</h3>
                        <p className="text-[11px] text-muted-foreground leading-normal">{t("ctaDesc")}</p>
                    </div>
                    <Link
                        href="/"
                        className={cn(
                            buttonVariants({ variant: "default", size: "sm" }),
                            "w-full group flex items-center justify-center gap-1",
                        )}
                    >
                        {t("ctaButton")}
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </Card>
            </div>
        </div>
    );
}
