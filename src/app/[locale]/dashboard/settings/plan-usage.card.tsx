"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { UsageState } from "./settings-cards.types";

const QUOTA_LABEL_KEYS: Record<string, string> = {
    "cv-analysis": "quotaCvAnalysis",
    "job-match": "quotaJobMatch",
    "github-analysis": "quotaGithubAnalysis",
    "ai-sourcing": "quotaAiSourcing",
    "ai-chat": "quotaAiChat",
    "job-postings": "quotaJobPostings",
    "job-applications": "quotaJobApplications",
    writes: "quotaWrites",
};

interface PlanUsageCardProps {
    usage: UsageState | null;
}

function formatCountdown(resetMs: number, nowMs: number, t: (key: string) => string): string {
    const diffMs = resetMs - nowMs;
    if (diffMs <= 0) {
        return t("quotaResetsSoon");
    }
    const totalMinutes = Math.ceil(diffMs / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
        return `${t("quotaResetsIn")} ${hours}h ${minutes}m`;
    }
    return `${t("quotaResetsIn")} ${minutes}m`;
}

/** Uso del plan con barras por cuota y contador dinámico de renovación. */
export function PlanUsageCard({ usage }: PlanUsageCardProps) {
    const t = useTranslations("Settings");
    const [now, setNow] = useState<number>(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gauge className="size-5 text-primary" />
                    {t("usageTitle")}
                    {usage ? (
                        <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">
                            {usage.plan === "byok" ? t("planByok") : t("planFree")}
                        </Badge>
                    ) : null}
                </CardTitle>
                <CardDescription>{t("usageDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                {!usage ? (
                    <p className="text-xs text-muted-foreground">{t("usageLoading")}</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {usage.quotas.map((q) => {
                            const used = q.limit - q.remaining;
                            const pct = q.limit > 0 ? Math.min(100, Math.round((used / q.limit) * 100)) : 0;
                            const isFull = q.remaining >= q.limit;
                            const timeStatus = isFull ? t("quotaAvailable") : formatCountdown(q.reset, now, t);

                            return (
                                <div key={q.key} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-foreground">
                                            {t(QUOTA_LABEL_KEYS[q.key] ?? q.key)}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {q.unlimited === true ? (
                                                t("usageUnlimited")
                                            ) : (
                                                <span
                                                    title={
                                                        isFull
                                                            ? undefined
                                                            : `Reinicio: ${new Date(q.reset).toLocaleTimeString([], {
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                              })}`
                                                    }
                                                >
                                                    {q.remaining}/{q.limit} · {timeStatus}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <Progress value={q.unlimited === true ? 0 : pct} className="h-1.5" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
