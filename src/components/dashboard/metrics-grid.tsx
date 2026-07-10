"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadialProgress } from "./radial-progress";
import { FileText, Briefcase, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";

interface MetricsGridProps {
    latestResume: {
        id: string;
        fileName: string;
        atsScore: number | null;
        createdAt: Date | string;
    } | null;
    latestJobMatch: {
        id: string;
        matchScore: number | null;
        createdAt: Date | string;
        analysis: unknown;
    } | null;
    limits: {
        cvAnalysis: { used: number; limit: number };
        jobMatch: { used: number; limit: number };
        mockInterview: { used: number; limit: number };
    };
}

export function MetricsGrid({ latestResume, latestJobMatch, limits }: MetricsGridProps) {
    const t = useTranslations("Dashboard");
    const locale = useLocale();

    const atsScore = latestResume?.atsScore ?? 0;
    const matchScore = latestJobMatch?.matchScore ?? 0;

    // Procesar habilidades del match
    interface JobAnalysisData {
        requiredSkills?: string[];
        missingSkills?: string[];
        seniority?: string;
    }
    const jobAnalysis = latestJobMatch?.analysis as JobAnalysisData | null;
    const requiredSkills: string[] = jobAnalysis?.requiredSkills || [];
    const missingSkills: string[] = jobAnalysis?.missingSkills || [];
    const alignedSkills = requiredSkills.filter((s) => !missingSkills.includes(s));
    const seniority = jobAnalysis?.seniority || "N/A";

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* ATS Score Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">{t("atsScoreCardTitle")}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                            {latestResume ? t("lastAnalysis") : t("noCv")}
                        </Badge>
                    </div>
                    <CardDescription className="truncate max-w-[220px]">
                        {latestResume ? latestResume.fileName : t("atsScoreCardDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 pt-4">
                    <RadialProgress value={atsScore} size={140} strokeWidth={10}>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-foreground">{atsScore}</span>
                            <span className="text-xs text-muted-foreground">{t("atsScoreCardLabel")}</span>
                        </div>
                    </RadialProgress>
                    {latestResume && (
                        <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="size-4 text-emerald" />
                            <span className="text-muted-foreground text-xs">
                                {locale === "es" ? "Subido el" : "Uploaded on"}{" "}
                                {new Date(latestResume.createdAt).toLocaleDateString(
                                    locale === "es" ? "es-ES" : "en-US",
                                )}
                            </span>
                        </div>
                    )}
                    <Link
                        href="/dashboard/cv-analysis"
                        className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "w-full",
                        })}
                    >
                        {latestResume ? t("atsScoreImprove") : t("atsScoreUpload")}
                    </Link>
                </CardContent>
            </Card>

            {/* Recent Job Match Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">{t("jobMatchCardTitle")}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                            {latestJobMatch ? t("latestMatch") : t("noMatches")}
                        </Badge>
                    </div>
                    <CardDescription>
                        {latestJobMatch
                            ? `${t("jobMatchCardDesc")} (${seniority.toUpperCase()})`
                            : t("jobMatchCardDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4 justify-between h-[210px]">
                    {latestJobMatch ? (
                        <>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                                        {t("jobMatchCardLabel")}
                                    </span>
                                    <span className="text-2xl font-bold text-foreground">{matchScore}%</span>
                                </div>
                                <Progress value={matchScore} className="h-2" />
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto">
                                {alignedSkills.slice(0, 3).map((skill, i) => (
                                    <Badge key={i} className="bg-emerald/10 text-emerald hover:bg-emerald/20 text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                                {missingSkills.length > 0 && (
                                    <Badge className="bg-warning/10 text-warning hover:bg-warning/20 text-xs">
                                        +{missingSkills.length} gaps
                                    </Badge>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6 text-xs text-muted-foreground flex flex-col items-center justify-center flex-1">
                            {locale === "es"
                                ? "Compara tu CV con ofertas reales para medir afinidad técnica."
                                : "Compare your CV with real offers to measure technical affinity."}
                        </div>
                    )}
                    <Link
                        href="/dashboard/job-match"
                        className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "w-full",
                        })}
                    >
                        {latestJobMatch ? t("jobMatchCardNew") : t("jobMatchCardAnalyze")}
                    </Link>
                </CardContent>
            </Card>

            {/* Account Limits Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">{t("limitsCardTitle")}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                            {t("limitsCardCta")}
                        </Badge>
                    </div>
                    <CardDescription>{t("limitsCardDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4">
                    {/* CV Analysis */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <FileText className="size-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{t("limitsCardCv")}</span>
                            </div>
                            <span className="font-medium">
                                {limits.cvAnalysis.used}/{limits.cvAnalysis.limit}
                            </span>
                        </div>
                        <Progress value={(limits.cvAnalysis.used / limits.cvAnalysis.limit) * 100} className="h-1.5" />
                    </div>

                    {/* Job Match */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Briefcase className="size-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{t("limitsCardMatch")}</span>
                            </div>
                            <span className="font-medium">
                                {limits.jobMatch.used}/{limits.jobMatch.limit}
                            </span>
                        </div>
                        <Progress value={(limits.jobMatch.used / limits.jobMatch.limit) * 100} className="h-1.5" />
                    </div>

                    {/* Mock Interview */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="size-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{t("limitsCardInterview")}</span>
                            </div>
                            <span className="font-medium">
                                {limits.mockInterview.used}/{limits.mockInterview.limit}
                            </span>
                        </div>
                        <Progress
                            value={(limits.mockInterview.used / limits.mockInterview.limit) * 100}
                            className="h-1.5"
                        />
                    </div>

                    <button
                        className={buttonVariants({
                            variant: "default",
                            size: "sm",
                            className: "mt-2 w-full cursor-not-allowed opacity-80",
                        })}
                        disabled
                    >
                        {t("limitsCardCta")}
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}
