"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Award, Briefcase, Calendar, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/shared-kernel/utils";
import {
    getCareerRecommendationsAction,
    type CareerRecommendations,
} from "@/features/cv-analysis/application/cv-analysis.use-cases";
import { CAREER_PATHS, MAX_CAREER_PATH_LENGTH } from "@/features/cv-analysis/domain/career-paths";
import { toast } from "sonner";

interface CareerPathPanelProps {
    initial: CareerRecommendations | null;
}

function ImportanceBadge({ level }: { level: "high" | "medium" | "low" }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "shrink-0 border-none px-2 py-0.5 text-[10px] font-medium capitalize",
                level === "high"
                    ? "bg-rose-500/10 text-rose-500"
                    : level === "medium"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-blue-500/10 text-blue-500",
            )}
        >
            {level === "high" ? "Alta" : level === "medium" ? "Media" : "Baja"}
        </Badge>
    );
}

export function CareerPathPanel({ initial }: CareerPathPanelProps) {
    const locale = useLocale();
    const [selected, setSelected] = useState(initial?.targetPath ?? "");
    const [custom, setCustom] = useState("");
    const [data, setData] = useState<CareerRecommendations | null>(initial);
    const [isPending, startTransition] = useTransition();

    const handleGenerate = () => {
        const path = (custom.trim() || selected).trim();
        if (!path) {
            toast.error(locale === "en" ? "Choose or type a career path." : "Elegí o escribí un camino profesional.");
            return;
        }
        startTransition(async () => {
            const res = await getCareerRecommendationsAction(path);
            if (!res.success) {
                toast.error(res.error || "Error al generar recomendaciones.");
                return;
            }
            setData(res.data);
            setSelected(path);
        });
    };

    const handleReset = () => {
        setCustom("");
        setSelected("");
        startTransition(async () => {
            const res = await getCareerRecommendationsAction();
            if (res.success) setData(res.data);
        });
    };

    return (
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background shadow-xs backdrop-blur-sm">
            <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Sparkles className="size-5 animate-pulse text-primary" />
                    Career Copilot — Recomendaciones de Crecimiento
                </CardTitle>
                <CardDescription>
                    {locale === "en"
                        ? "Pick a career path (any field, not just IT) and the AI reasons about it: opportunities, skills, roadmap and projects."
                        : "Elegí un camino profesional (cualquier campo, no solo IT) y la IA razona sobre él: oportunidades, habilidades, ruta y proyectos."}
                </CardDescription>

                {/* Selector: dropdown predefinido + input libre */}
                <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-1.5">
                        <label htmlFor="career-path-select" className="text-[11px] font-semibold text-muted-foreground">
                            {locale === "en" ? "Predefined path" : "Camino predefinido"}
                        </label>
                        <select
                            id="career-path-select"
                            value={CAREER_PATHS.some((p) => p.value === selected) ? selected : ""}
                            onChange={(e) => {
                                setSelected(e.target.value);
                                setCustom("");
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden"
                        >
                            <option value="">{locale === "en" ? "Select a path…" : "Seleccioná un camino…"}</option>
                            {CAREER_PATHS.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {locale === "en" ? p.labelEn : p.labelEs}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <label htmlFor="career-path-custom" className="text-[11px] font-semibold text-muted-foreground">
                            {locale === "en" ? "Or type your own" : "O escribí el tuyo"}
                        </label>
                        <Input
                            id="career-path-custom"
                            list="career-path-options"
                            value={custom}
                            onChange={(e) => setCustom(e.target.value.slice(0, MAX_CAREER_PATH_LENGTH))}
                            placeholder={
                                locale === "en" ? "e.g. Sociology, Data Science…" : "Ej: Sociología, Ciencia de Datos…"
                            }
                            maxLength={MAX_CAREER_PATH_LENGTH}
                        />
                        <datalist id="career-path-options">
                            {CAREER_PATHS.map((p) => (
                                <option key={p.value} value={locale === "en" ? p.labelEn : p.labelEs} />
                            ))}
                        </datalist>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleGenerate} disabled={isPending} className="gap-1.5">
                            {isPending && <Loader2 className="size-4 animate-spin" />}
                            {locale === "en" ? "Generate" : "Generar"}
                        </Button>
                        {data?.targetPath && (
                            <Button variant="ghost" size="sm" onClick={handleReset} disabled={isPending}>
                                {locale === "en" ? "General" : "General"}
                            </Button>
                        )}
                    </div>
                </div>
                {data?.targetPath && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        {locale === "en" ? "Showing path: " : "Mostrando camino: "}
                        <strong className="text-foreground">{data.targetPath}</strong>
                    </p>
                )}
            </CardHeader>

            {!data ? (
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {locale === "en"
                            ? "Upload a CV to get smart recommendations."
                            : "Subí un currículum para recibir sugerencias inteligentes."}
                    </p>
                </CardContent>
            ) : (
                <CardContent className="space-y-6">
                    {/* Oportunidades del camino elegido */}
                    {data.opportunities && data.opportunities.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="flex items-center gap-1.5 border-b border-border pb-1.5 text-sm font-semibold text-foreground">
                                <Briefcase className="size-4 text-primary" />
                                {locale === "en" ? "Opportunities in this path" : "Oportunidades en este camino"}
                            </h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                {data.opportunities.map((opp) => (
                                    <div
                                        key={opp.title}
                                        className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
                                    >
                                        <ImportanceBadge level={opp.demand} />
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-foreground">{opp.title}</h4>
                                            <p className="text-xs leading-normal text-muted-foreground">
                                                {opp.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <h3 className="flex items-center gap-1.5 border-b border-border pb-1.5 text-sm font-semibold text-foreground">
                                <Award className="size-4 text-primary" />
                                {locale === "en" ? "Recommended skills" : "Tecnologías Recomendadas"}
                            </h3>
                            <div className="space-y-3">
                                {data.technologies.map((tech) => (
                                    <div
                                        key={tech.name}
                                        className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
                                    >
                                        <ImportanceBadge level={tech.importance} />
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-foreground">{tech.name}</h4>
                                            <p className="text-xs leading-normal text-muted-foreground">
                                                {tech.reason}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="flex items-center gap-1.5 border-b border-border pb-1.5 text-sm font-semibold text-foreground">
                                <Calendar className="size-4 text-primary" />
                                {locale === "en" ? "Suggested learning path" : "Ruta de Aprendizaje Sugerida"}
                            </h3>
                            {data.roadmaps.map((map) => (
                                <div
                                    key={map.title}
                                    className="relative space-y-3 overflow-hidden rounded-lg border border-border bg-card/60 p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-foreground">{map.title}</h4>
                                        <Badge
                                            variant="outline"
                                            className="border-primary/10 bg-primary/5 font-mono text-[10px] text-primary"
                                        >
                                            {map.duration}
                                        </Badge>
                                    </div>
                                    <ol className="relative mt-2 ml-2 space-y-3.5 border-l border-border/80">
                                        {map.steps.map((step, sIdx) => (
                                            <li key={sIdx} className="mb-0 ml-4">
                                                <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background font-mono text-[10px] font-semibold text-primary">
                                                    {sIdx + 1}
                                                </span>
                                                <p className="text-xs leading-normal text-muted-foreground">{step}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                    </div>

                    {data.projects && data.projects.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <h3 className="flex items-center gap-1.5 border-b border-border pb-1.5 text-sm font-semibold text-foreground">
                                <Sparkles className="size-4 text-primary" />
                                {locale === "en" ? "Suggested projects" : "Proyectos Sugeridos para Potenciar tu CV"}
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                {data.projects.map((proj) => (
                                    <div
                                        key={proj.title}
                                        className="flex flex-col justify-between gap-3 rounded-lg border border-border/60 bg-muted/10 p-4 transition-all hover:border-primary/30"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="text-sm font-bold text-foreground">{proj.title}</h4>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "border-none text-[10px] font-medium capitalize",
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
                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                {proj.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {proj.technologies.map((t) => (
                                                <Badge
                                                    key={t}
                                                    variant="secondary"
                                                    className="bg-secondary/80 text-[10px] text-secondary-foreground"
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
            )}
        </Card>
    );
}
