"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, Award, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    getDeveloperJobBoardAction,
    applyToJobPostingAction,
    createReportAction,
    withdrawApplicationAction,
} from "@/features/jobs/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";

interface JobPosting {
    id: string;
    recruiterId: string;
    title: string;
    company: string;
    location: string;
    remoteType: string;
    description: string;
    requiredSkills: unknown;
    seniorityLevel: string;
    status: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    matchScore: number | null;
    hasApplied: boolean;
}

interface JobsClientPageProps {
    initialJobs: JobPosting[];
}

export function JobsClientPage({ initialJobs }: JobsClientPageProps) {
    const t = useTranslations("Jobs");
    const [jobs, setJobs] = useState<JobPosting[]>(initialJobs);
    const [search, setSearch] = useState("");
    const [remoteType, setRemoteType] = useState("all");
    const [seniorityLevel, setSeniorityLevel] = useState("all");
    const [loading, setLoading] = useState(false);
    const [applyingId, setApplyingId] = useState<string | null>(null);
    const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

    // Indica si el desarrollador no tiene ningún CV subido
    // Si en todas las ofertas matchScore es null, probablemente no tenga CV activo
    const hasNoResume = jobs.length > 0 && jobs.every((job) => job.matchScore === null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        const filters = {
            search: search || undefined,
            remoteType: remoteType !== "all" ? remoteType : undefined,
            seniorityLevel: seniorityLevel !== "all" ? seniorityLevel : undefined,
        };
        const res = await getDeveloperJobBoardAction(filters);
        if (res.success && res.data) {
            setJobs(res.data);
        } else {
            toast.error(t("filterError"));
        }
        setLoading(false);
    }, [search, remoteType, seniorityLevel, t]);

    // Filtrar ofertas cuando cambien los filtros
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            void fetchJobs();
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [fetchJobs]);

    const [reportingJobId, setReportingJobId] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const handleSendReport = async () => {
        if (!reportingJobId) return;
        if (reportReason.trim().length < 5) {
            toast.error(t("reportLengthError"));
            return;
        }
        setIsSubmittingReport(true);
        const res = await createReportAction({
            targetType: "job_posting",
            targetId: reportingJobId,
            reason: reportReason,
        });

        if (res.success) {
            toast.success(t("reportSuccess"));
            setReportingJobId(null);
            setReportReason("");
            void fetchJobs(); // Recargar el listado por si se ocultó la oferta
        } else {
            toast.error(res.error || t("reportError"));
        }
        setIsSubmittingReport(false);
    };

    const handleApply = async (jobId: string) => {
        setApplyingId(jobId);
        const res = await applyToJobPostingAction(jobId);
        if (res.success) {
            toast.success(t("applySuccess"));
            setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, hasApplied: true } : job)));
        } else {
            toast.error(res.error || t("applyError"));
        }
        setApplyingId(null);
    };

    const handleWithdraw = async (jobId: string) => {
        setWithdrawingId(jobId);
        const res = await withdrawApplicationAction(jobId);
        if (res.success) {
            toast.success(t("withdrawSuccess"));
            setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, hasApplied: false } : job)));
        } else {
            toast.error(res.error || t("withdrawError"));
        }
        setWithdrawingId(null);
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        if (score >= 70) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
        if (score >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
        return "text-muted-foreground bg-muted border-muted-foreground/10";
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            {hasNoResume && (
                <div className="flex gap-3 p-4 rounded-lg bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-sm leading-relaxed items-start">
                    <AlertCircle className="size-5 shrink-0 mt-0.5" />
                    <div>
                        {t.rich("noResumeWarning", {
                            link: () => (
                                <Link
                                    href="/dashboard/cv-analysis"
                                    className="underline font-bold hover:text-yellow-700"
                                >
                                    CV Analysis
                                </Link>
                            ),
                        })}
                    </div>
                </div>
            )}

            {/* Barra de Filtros */}
            <Card className="border border-border bg-card shadow-xs">
                <CardContent className="pt-6 grid gap-4 sm:grid-cols-4">
                    <div className="relative col-span-2">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder={t("searchPlaceholder")}
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            value={remoteType}
                            onChange={(e) => setRemoteType(e.target.value)}
                        >
                            <option value="all">{t("allFormats")}</option>
                            <option value="remote">{t("remote")}</option>
                            <option value="hybrid">{t("hybrid")}</option>
                            <option value="onsite">{t("onsite")}</option>
                        </select>
                    </div>

                    <div>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            value={seniorityLevel}
                            onChange={(e) => setSeniorityLevel(e.target.value)}
                        >
                            <option value="all">{t("allSeniorities")}</option>
                            <option value="junior">{t("junior")}</option>
                            <option value="mid">{t("mid")}</option>
                            <option value="senior">{t("senior")}</option>
                            <option value="lead">{t("lead")}</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Listado de Ofertas */}
            <div className="grid gap-5 md:grid-cols-1">
                {loading && jobs.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-sm">
                        {t("loading", { default: "Cargando..." })}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-sm border-dashed border-2 rounded-lg">
                        {t("noOffers")}
                    </div>
                ) : (
                    jobs.map((job) => {
                        const skills: string[] = Array.isArray(job.requiredSkills)
                            ? job.requiredSkills
                            : typeof job.requiredSkills === "string"
                              ? JSON.parse(job.requiredSkills)
                              : [];

                        return (
                            <Card
                                key={job.id}
                                className="border border-border flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-6 hover:shadow-md transition-shadow"
                            >
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-bold leading-tight text-foreground">{job.title}</h2>
                                        <span className="text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded-md bg-muted">
                                            {job.company}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="size-3.5" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center gap-1 uppercase">
                                            <Briefcase className="size-3.5" />
                                            {t(job.remoteType, { default: job.remoteType })}
                                        </span>
                                        <span className="flex items-center gap-1 uppercase">
                                            <Award className="size-3.5" />
                                            {t(job.seniorityLevel, { default: job.seniorityLevel })}
                                        </span>
                                    </div>

                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl whitespace-pre-line">
                                        {job.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {skills.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="text-[10px]">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end w-full md:w-auto shrink-0 gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                                    {job.matchScore !== null && (
                                        <div
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-lg border text-center shrink-0 w-24 h-20",
                                                getScoreColor(job.matchScore),
                                            )}
                                        >
                                            <span className="text-xl font-extrabold">{job.matchScore}%</span>
                                            <span className="text-[9px] uppercase font-bold tracking-wider">
                                                {t("affinity")}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title={t("report")}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                            onClick={() => setReportingJobId(job.id)}
                                        >
                                            <Flag className="size-4" />
                                        </Button>

                                        {job.hasApplied ? (
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <Button
                                                    disabled
                                                    variant="outline"
                                                    className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/5 border-emerald-500/20 w-full md:w-auto"
                                                >
                                                    <CheckCircle2 className="size-4 text-emerald-500" />
                                                    <span>{t("applied")}</span>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => {
                                                        void handleWithdraw(job.id);
                                                    }}
                                                    disabled={withdrawingId !== null}
                                                    className="w-full md:w-auto"
                                                >
                                                    {withdrawingId === job.id ? t("withdrawing") : t("withdraw")}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    void handleApply(job.id);
                                                }}
                                                disabled={applyingId !== null || withdrawingId !== null}
                                                className="w-full md:w-auto"
                                            >
                                                {applyingId === job.id ? t("applying") : t("apply")}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Modal de Reporte */}
            {reportingJobId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2 text-destructive font-semibold">
                            <Flag className="size-5" />
                            <h3 className="text-lg">{t("report")}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{t("reportDescription")}</p>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={t("reportPlaceholder")}
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            disabled={isSubmittingReport}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setReportingJobId(null);
                                    setReportReason("");
                                }}
                                disabled={isSubmittingReport}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    void handleSendReport();
                                }}
                                disabled={isSubmittingReport}
                            >
                                {isSubmittingReport ? t("submittingReport") : t("submitReport")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
