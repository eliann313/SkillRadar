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
            toast.error("Error al filtrar las ofertas.");
        }
        setLoading(false);
    }, [search, remoteType, seniorityLevel]);

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
            toast.error("El motivo debe tener al menos 5 caracteres.");
            return;
        }
        setIsSubmittingReport(true);
        const res = await createReportAction({
            targetType: "job_posting",
            targetId: reportingJobId,
            reason: reportReason,
        });

        if (res.success) {
            toast.success("El reporte ha sido enviado. Revisaremos el contenido a la brevedad.");
            setReportingJobId(null);
            setReportReason("");
            void fetchJobs(); // Recargar el listado por si se ocultó la oferta
        } else {
            toast.error(res.error || "Error al enviar el reporte.");
        }
        setIsSubmittingReport(false);
    };

    const handleApply = async (jobId: string) => {
        setApplyingId(jobId);
        const res = await applyToJobPostingAction(jobId);
        if (res.success) {
            toast.success("¡Te has postulado con éxito! Se notificó al reclutador y se añadió a tu Kanban.");
            setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, hasApplied: true } : job)));
        } else {
            toast.error(res.error || "Error al postularse.");
        }
        setApplyingId(null);
    };

    const handleWithdraw = async (jobId: string) => {
        setWithdrawingId(jobId);
        const res = await withdrawApplicationAction(jobId);
        if (res.success) {
            toast.success("Has retirado tu postulación con éxito.");
            setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, hasApplied: false } : job)));
        } else {
            toast.error(res.error || "Error al retirar la postulación.");
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
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Bolsa de Empleo (Job Board)</h1>
                <p className="text-sm text-muted-foreground">
                    Explora ofertas laborales internas de SkillRadar y comprueba tu porcentaje de afinidad con la IA.
                </p>
            </div>

            {hasNoResume && (
                <div className="flex gap-3 p-4 rounded-lg bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-sm leading-relaxed items-start">
                    <AlertCircle className="size-5 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold">¡Aviso importante!</span> Para ver tu porcentaje de afinidad con
                        las ofertas laborales, debes subir y analizar al menos un currículum (CV) en la sección de{" "}
                        <Link href="/dashboard/cv-analysis" className="underline font-bold hover:text-yellow-700">
                            CV Analysis
                        </Link>
                        .
                    </div>
                </div>
            )}

            {/* Barra de Filtros */}
            <Card className="border border-border bg-card shadow-xs">
                <CardContent className="pt-6 grid gap-4 sm:grid-cols-4">
                    <div className="relative col-span-2">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por puesto o empresa..."
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
                            <option value="all">Todas las modalidades</option>
                            <option value="remote">Remoto</option>
                            <option value="hybrid">Híbrido</option>
                            <option value="onsite">Presencial</option>
                        </select>
                    </div>

                    <div>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            value={seniorityLevel}
                            onChange={(e) => setSeniorityLevel(e.target.value)}
                        >
                            <option value="all">Todos los seniorities</option>
                            <option value="junior">Junior</option>
                            <option value="mid">Semi-Senior / Mid</option>
                            <option value="senior">Senior</option>
                            <option value="lead">Lead / Principal</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Listado de Ofertas */}
            <div className="grid gap-5 md:grid-cols-1">
                {loading && jobs.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-sm">Cargando ofertas de empleo...</div>
                ) : jobs.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-sm border-dashed border-2 rounded-lg">
                        No se encontraron ofertas que coincidan con tu búsqueda.
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
                                            {job.remoteType}
                                        </span>
                                        <span className="flex items-center gap-1 uppercase">
                                            <Award className="size-3.5" />
                                            {job.seniorityLevel}
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
                                                Afinidad
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Reportar esta oferta"
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
                                                    <span>Postulado</span>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => {
                                                        void handleWithdraw(job.id);
                                                    }}
                                                    disabled={withdrawingId !== null}
                                                    className="w-full md:w-auto"
                                                >
                                                    {withdrawingId === job.id ? "Retirando..." : "Retirar"}
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
                                                {applyingId === job.id ? "Aplicando..." : "Aplicar"}
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
                            <h3 className="text-lg">Reportar Oferta Laboral</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Por favor, describe de forma concisa por qué consideras que esta oferta es spam, inapropiada
                            o fraudulenta.
                        </p>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Escribe tu motivo aquí (mínimo 5 caracteres)..."
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
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    void handleSendReport();
                                }}
                                disabled={isSubmittingReport}
                            >
                                {isSubmittingReport ? "Enviando..." : "Enviar Reporte"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
