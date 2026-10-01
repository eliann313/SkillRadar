"use client";

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

/** Uso del plan con barras por cuota (ex bloque Fase 5 de settings/page). */
export function PlanUsageCard({ usage }: PlanUsageCardProps) {
    const t = useTranslations("Settings");

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
                                                <>
                                                    {q.remaining}/{q.limit} · {t("usageResets")}{" "}
                                                    {new Date(q.reset).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </>
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
