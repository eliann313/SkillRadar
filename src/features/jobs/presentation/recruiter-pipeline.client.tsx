"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/shared-kernel/utils";
import { updateApplicationStatusAction } from "@/features/jobs/application/jobs.use-cases";
import { DEFAULT_PIPELINE_STAGES } from "@/infrastructure/pipeline-stages";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";

export interface PipelineItem {
    id: string;
    status: string;
    matchScore: number;
    anonymousId: string;
    postingId: string;
    postingTitle: string;
    createdAt: string;
}

export interface PipelineSummary {
    id: string;
    title: string;
    status: string;
    total: number;
    hired: number;
    avgMatch: number;
}

export function PipelineClientPage({
    items: initialItems,
    summary,
    columns,
    stagesByPosting,
}: {
    items: PipelineItem[];
    summary: PipelineSummary[];
    columns: string[];
    stagesByPosting: Record<string, string[]>;
}) {
    const t = useTranslations("Pipeline");
    const [items, setItems] = useState(initialItems);
    const [dragId, setDragId] = useState<string | null>(null);

    const colLabel = (col: string) => ((DEFAULT_PIPELINE_STAGES as readonly string[]).includes(col) ? t(col) : col);

    const handleDrop = async (status: string) => {
        if (!dragId) return;
        const item = items.find((i) => i.id === dragId);
        setDragId(null);
        if (!item || item.status === status) return;
        const allowed = stagesByPosting[item.postingId] ?? [];
        if (!allowed.includes(status)) {
            toast.error(t("invalidStage"));
            return;
        }
        const prev = item.status;
        setItems((cur) => cur.map((i) => (i.id === dragId ? { ...i, status } : i)));
        const res = await updateApplicationStatusAction(dragId, status);
        if (!res.success) {
            setItems((cur) => cur.map((i) => (i.id === dragId ? { ...i, status: prev } : i)));
            toast.error(res.error);
        }
    };

    const funnel = columns.map((col) => ({ stage: col, count: items.filter((i) => i.status === col).length }));
    const entered = funnel.reduce((a, f) => a + f.count, 0);
    const hiredCount = items.filter((i) => i.status === "hired").length;
    const conversion = entered > 0 ? Math.round((hiredCount / entered) * 100) : 0;
    const matchScores = items.map((i) => i.matchScore).filter((s) => s > 0);
    const globalAvgMatch =
        matchScores.length > 0 ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length) : 0;
    const activePostings = summary.filter((s) => s.status === "published").length;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            {/* Agregado global: todas las ofertas */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="pt-4">
                        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            {t("totalCandidates", { default: "Candidatos totales" })}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-foreground">{entered}</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="pt-4">
                        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            {t("globalConversion", { default: "Conversión a hire" })}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-500">{conversion}%</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="pt-4">
                        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            {t("globalAvgMatch", { default: "Match promedio" })}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-foreground">{globalAvgMatch}%</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="pt-4">
                        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            {t("activePostings", { default: "Ofertas activas" })}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-foreground">{activePostings}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Reporte de embudo global */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t("funnelTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                        {funnel.map((f) => (
                            <div
                                key={f.stage}
                                className="h-full bg-primary/70 first:bg-primary last:bg-emerald-500"
                                style={{ width: `${entered > 0 ? (f.count / entered) * 100 : 0}%` }}
                                title={`${f.stage}: ${f.count}`}
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                        {funnel.map((f) => (
                            <span key={f.stage}>
                                {colLabel(f.stage)}: <strong className="text-foreground">{f.count}</strong>
                            </span>
                        ))}
                        <span className="ml-auto">
                            {t("conversion")}: <strong className="text-emerald-500">{conversion}%</strong>
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Resumen por oferta (mini analytics) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {summary.map((s) => (
                    <Card key={s.id} className="border-border/50 bg-card/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="truncate text-sm">{s.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                                {t("total")}: <strong className="text-foreground">{s.total}</strong>
                            </span>
                            <span>
                                {t("hired")}: <strong className="text-foreground">{s.hired}</strong>
                            </span>
                            <span>
                                {t("avgMatch")}: <strong className="text-foreground">{s.avgMatch}%</strong>
                            </span>
                            <Link
                                href={`/dashboard/recruiter/postings/${s.id}/applications`}
                                className="ml-auto text-primary hover:underline"
                            >
                                {t("view")}
                            </Link>
                        </CardContent>
                    </Card>
                ))}
                {summary.length === 0 ? (
                    <EmptyState
                        icon={<Search className="size-5 text-muted-foreground" />}
                        title={t("empty")}
                        description={t("subtitle")}
                    />
                ) : null}
            </div>

            {/* Kanban global con drag & drop */}
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                {columns.map((col) => {
                    const colItems = items.filter((i) => i.status === col);
                    return (
                        <div
                            key={col}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => void handleDrop(col)}
                            className={cn(
                                "flex min-h-[120px] flex-col gap-2 rounded-xl border border-border/40 bg-card/30 p-3",
                                dragId && "border-dashed",
                            )}
                        >
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {colLabel(col)}
                                </span>
                                <Badge variant="outline" className="text-[10px]">
                                    {colItems.length}
                                </Badge>
                            </div>
                            {colItems.map((item) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={() => setDragId(item.id)}
                                    onDragEnd={() => setDragId(null)}
                                    className="cursor-grab rounded-lg border border-border/40 bg-card/60 p-2.5 text-xs transition-colors hover:border-primary/40 active:cursor-grabbing"
                                >
                                    <p className="font-mono font-semibold text-foreground">{item.anonymousId}</p>
                                    <p className="mt-0.5 truncate text-muted-foreground">{item.postingTitle}</p>
                                    <p className="mt-1 font-semibold text-primary">{item.matchScore}% match</p>
                                    <Link
                                        href={`/dashboard/recruiter/postings/${item.postingId}/applications`}
                                        className="mt-1 inline-block text-[11px] text-primary hover:underline"
                                        draggable={false}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {t("view")}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
