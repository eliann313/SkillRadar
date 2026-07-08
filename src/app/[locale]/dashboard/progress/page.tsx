import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProgressDataAction } from "@/features/cv-analysis/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProgressRecharts } from "@/components/dashboard";
import { TrendingUp, Award, CheckCircle2, ArrowRight, FileText, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
    title: "Progress Analytics | SkillRadar",
    description: "Track your ATS score evolution, completed skills, and job matches history.",
};

export default async function ProgressPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/");
    }

    const res = await getProgressDataAction();
    if (!res.success || !res.data) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6 border rounded-lg border-destructive/20 bg-destructive/5">
                <p className="text-sm font-semibold text-destructive mb-2">Error al cargar el progreso</p>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">
                    {res.error || "Ocurrió un error inesperado."}
                </p>
                <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
                    Volver al Dashboard
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
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Progress</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Evolución de tu perfil y habilidades dominadas</p>
                </div>

                <Card className="border-dashed border-2 border-border flex flex-col items-center justify-center p-12 text-center min-h-[350px]">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary animate-pulse">
                        <FileText className="size-8" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Comienza a trackear tu progreso</h2>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">
                        Sube tu primer currículum para analizar tu nivel de compatibilidad ATS, obtener recomendaciones
                        y ver cómo mejora tu puntuación con el tiempo.
                    </p>
                    <Link
                        href="/dashboard/cv-analysis"
                        className={cn(buttonVariants({ variant: "default" }), "group flex items-center gap-1.5")}
                    >
                        Subir tu primer CV
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Card>
            </div>
        );
    }

    // Preparar datos para el gráfico
    const chartData = resumes.map((r: { createdAt: Date; atsScore: number | null; fileName: string }) => ({
        date: new Date(r.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        score: r.atsScore || 0,
        name: r.fileName,
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Progress</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Historial de optimización del CV, habilidades cerradas y análisis de coincidencias.
                    </p>
                </div>
                <Link
                    href="/dashboard/cv-analysis"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1.5")}
                >
                    <FileText className="size-4" />
                    Subir nueva versión
                </Link>
            </div>

            {/* Malla de Métricas */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Último Score ATS
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
                            Calculado sobre {resumes[resumes.length - 1].fileName}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Total de Job Matches
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{totalMatches}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Análisis de coincidencia con ofertas laborales
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Match Score Promedio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">{averageScore}</span>
                            <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">De los últimos 5 análisis realizados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Progreso */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <TrendingUp className="size-5 text-primary" />
                        Evolución Histórica de Score ATS
                    </CardTitle>
                    <CardDescription>
                        Visualiza cómo ha mejorado el score de optimización de tu CV a lo largo del tiempo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <ProgressRecharts data={chartData} />
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Habilidades Cerradas (Logros) */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm md:col-span-5 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Award className="size-5 text-emerald-500" />
                            Skills Cerrados
                        </CardTitle>
                        <CardDescription>
                            Habilidades que faltaban en tu primer Job Match y que ya has incorporado en tu perfil.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center min-h-[150px] pt-0">
                        {closedSkills.length === 0 ? (
                            <div className="text-center p-4 text-muted-foreground">
                                <div className="size-10 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-2 text-muted-foreground/60">
                                    <Sparkles className="size-5" />
                                </div>
                                <p className="text-xs font-semibold text-foreground/80">Continúa aprendiendo</p>
                                <p className="text-[11px] max-w-xs mx-auto mt-1 leading-normal">
                                    Los skills cerrados se calcularán cuando agregues nuevos skills a tu CV que antes
                                    marcaban como faltantes en tus primeros análisis.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="size-3.5" />
                                    ¡Logro! Has dominado {closedSkills.length}{" "}
                                    {closedSkills.length === 1 ? "habilidad" : "habilidades"}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {closedSkills.map((skill) => (
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
                            Historial de Versiones
                        </CardTitle>
                        <CardDescription>Listado de currículums subidos y puntuados.</CardDescription>
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
                                                {new Date(resume.createdAt).toLocaleDateString("es-ES", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
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
