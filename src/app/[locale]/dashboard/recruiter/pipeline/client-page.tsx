"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateApplicationStatusAction } from "@/features/jobs/actions";

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

const COLUMNS = ["submitted", "reviewed", "shortlisted", "interview", "offer", "hired"] as const;
type ColumnStatus = (typeof COLUMNS)[number];

export function PipelineClientPage({
    items: initialItems,
    summary,
}: {
    items: PipelineItem[];
    summary: PipelineSummary[];
}) {
    const t = useTranslations("Pipeline");
    const [items, setItems] = useState(initialItems);
    const [dragId, setDragId] = useState<string | null>(null);

    const handleDrop = async (status: ColumnStatus) => {
        if (!dragId) return;
        const item = items.find((i) => i.id === dragId);
        setDragId(null);
        if (!item || item.status === status) return;
        const prev = item.status;
        setItems((cur) => cur.map((i) => (i.id === dragId ? { ...i, status } : i)));
        const res = await updateApplicationStatusAction(dragId, status);
        if (!res.success) {
            setItems((cur) => cur.map((i) => (i.id === dragId ? { ...i, status: prev } : i)));
            toast.error(res.error);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

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
                {summary.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
            </div>

            {/* Kanban global con drag & drop */}
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                {COLUMNS.map((col) => {
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
                                    {t(col)}
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
