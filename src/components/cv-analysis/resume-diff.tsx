"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { safeParseJson } from "@/lib/pii";
import { cn } from "@/lib/utils";

export interface DiffableResume {
    id: string;
    fileName: string;
    atsScore: number | null;
    createdAt: Date;
    analysis: unknown;
}

interface ParsedAnalysis {
    keywords?: string[];
    missingKeywords?: string[];
}

function parse(resume: DiffableResume): ParsedAnalysis {
    return safeParseJson<ParsedAnalysis>(resume.analysis, null) ?? {};
}

export function ResumeDiff({ resumes }: { resumes: DiffableResume[] }) {
    const sorted = useMemo(() => [...resumes].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()), [resumes]);
    const [fromId, setFromId] = useState<string>(sorted.length >= 2 ? sorted[sorted.length - 2].id : "");
    const [toId, setToId] = useState<string>(sorted.length >= 1 ? sorted[sorted.length - 1].id : "");

    const from = sorted.find((r) => r.id === fromId);
    const to = sorted.find((r) => r.id === toId);

    const diff = useMemo(() => {
        if (!from || !to || from.id === to.id) return null;
        const a = parse(from);
        const b = parse(to);
        const ak = new Set((a.keywords ?? []).map((k) => k.toLowerCase()));
        const bk = new Set((b.keywords ?? []).map((k) => k.toLowerCase()));
        const added = (b.keywords ?? []).filter((k) => !ak.has(k.toLowerCase()));
        const removed = (a.keywords ?? []).filter((k) => !bk.has(k.toLowerCase()));
        const closedMissing = (a.missingKeywords ?? []).filter(
            (k) => !(b.missingKeywords ?? []).some((x) => x.toLowerCase() === k.toLowerCase()),
        );
        const newMissing = (b.missingKeywords ?? []).filter(
            (k) => !(a.missingKeywords ?? []).some((x) => x.toLowerCase() === k.toLowerCase()),
        );
        return {
            scoreDelta: (to.atsScore ?? 0) - (from.atsScore ?? 0),
            added,
            removed,
            closedMissing,
            newMissing,
        };
    }, [from, to]);

    if (sorted.length < 2) return null;

    const ScoreIcon = !diff ? Minus : diff.scoreDelta > 0 ? TrendingUp : diff.scoreDelta < 0 ? TrendingDown : Minus;

    return (
        <Card className="border-border/50 bg-card/40">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Comparar versiones</CardTitle>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <select
                        value={fromId}
                        onChange={(e) => setFromId(e.target.value)}
                        className="rounded-md border border-border bg-card px-2 py-1.5"
                    >
                        {sorted.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.fileName}
                            </option>
                        ))}
                    </select>
                    <ArrowRight className="size-4 text-muted-foreground" />
                    <select
                        value={toId}
                        onChange={(e) => setToId(e.target.value)}
                        className="rounded-md border border-border bg-card px-2 py-1.5"
                    >
                        {sorted.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.fileName}
                            </option>
                        ))}
                    </select>
                    {diff ? (
                        <span
                            className={cn(
                                "ml-auto flex items-center gap-1 font-bold",
                                diff.scoreDelta > 0 && "text-emerald",
                                diff.scoreDelta < 0 && "text-destructive",
                            )}
                        >
                            <ScoreIcon className="size-4" />
                            {diff.scoreDelta > 0 ? "+" : ""}
                            {diff.scoreDelta} ATS
                        </span>
                    ) : (
                        <span className="ml-auto text-xs text-muted-foreground">Elige dos versiones distintas.</span>
                    )}
                </div>
            </CardHeader>
            {diff ? (
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <p className="mb-2 text-xs font-semibold text-emerald">
                            Skills agregados ({diff.added.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {diff.added.map((k) => (
                                <Badge key={k} className="bg-emerald/10 text-emerald">
                                    + {k}
                                </Badge>
                            ))}
                            {diff.added.length === 0 ? (
                                <span className="text-[11px] text-muted-foreground">Ninguno.</span>
                            ) : null}
                        </div>
                        <p className="mb-2 mt-4 text-xs font-semibold text-emerald">
                            Brechas cerradas ({diff.closedMissing.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {diff.closedMissing.map((k) => (
                                <Badge key={k} variant="outline" className="border-emerald/30 text-emerald">
                                    ✓ {k}
                                </Badge>
                            ))}
                            {diff.closedMissing.length === 0 ? (
                                <span className="text-[11px] text-muted-foreground">Ninguna.</span>
                            ) : null}
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 text-xs font-semibold text-destructive">
                            Skills removidos ({diff.removed.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {diff.removed.map((k) => (
                                <Badge key={k} variant="outline" className="border-destructive/30 text-destructive">
                                    − {k}
                                </Badge>
                            ))}
                            {diff.removed.length === 0 ? (
                                <span className="text-[11px] text-muted-foreground">Ninguno.</span>
                            ) : null}
                        </div>
                        <p className="mb-2 mt-4 text-xs font-semibold text-warning">
                            Brechas nuevas ({diff.newMissing.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {diff.newMissing.map((k) => (
                                <Badge key={k} variant="outline" className="border-warning/30 text-warning">
                                    ! {k}
                                </Badge>
                            ))}
                            {diff.newMissing.length === 0 ? (
                                <span className="text-[11px] text-muted-foreground">Ninguna.</span>
                            ) : null}
                        </div>
                    </div>
                </CardContent>
            ) : null}
        </Card>
    );
}
