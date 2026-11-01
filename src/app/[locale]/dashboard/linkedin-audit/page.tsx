"use client";
import { logger } from "@/infrastructure/logger";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, CheckCircle2, XCircle, TrendingUp, History } from "lucide-react";
import {
    auditLinkedinProfileAction,
    getLinkedinAuditHistoryAction,
    type LinkedinAuditResult,
    type LinkedinAuditHistoryItem,
} from "@/features/linkedin-audit/application/linkedin-audit.use-cases";
import { cn } from "@/shared-kernel/utils";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);

export default function LinkedinAuditPage() {
    const t = useTranslations("LinkedInAudit");
    const locale = useLocale();
    const [profileText, setProfileText] = useState("");
    const [auditResult, setAuditResult] = useState<LinkedinAuditResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [history, setHistory] = useState<LinkedinAuditHistoryItem[]>([]);

    useEffect(() => {
        getLinkedinAuditHistoryAction()
            .then((res) => {
                if (res.success) setHistory(res.data);
            })
            .catch(() => undefined);
    }, []);

    const handleRunAudit = async () => {
        if (!profileText.trim()) {
            toast.error(t("emptyInputError"));
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await auditLinkedinProfileAction(profileText);
            if (result.success) {
                setAuditResult(result.data);
                toast.success(t("auditSuccess"));
                getLinkedinAuditHistoryAction()
                    .then((res) => {
                        if (res.success) setHistory(res.data);
                    })
                    .catch(() => undefined);
            } else {
                toast.error(result.error || t("auditError"));
            }
        } catch (e) {
            logger.error(e);
            toast.error(t("networkError"));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return "text-emerald border-emerald/20 bg-emerald/5";
        if (score >= 70) return "text-primary border-primary/20 bg-primary/5";
        if (score >= 50) return "text-warning border-warning/20 bg-warning/5";
        return "text-destructive border-destructive/20 bg-destructive/5";
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className={cn("flex flex-col gap-1", !auditResult && "text-center items-center")}>
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl flex items-center gap-2">
                    <LinkedinIcon className="size-8 text-primary fill-primary/10" />
                    {t("title")}
                </h1>
                <p className="text-sm text-muted-foreground max-w-xl">{t("subtitle")}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-12 items-start">
                {history.length > 0 ? (
                    <div className="md:col-span-12">
                        <Card className="border-border/50 bg-card/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <History className="size-4 text-primary" />
                                    {t("historyTitle")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {history.map((h) => (
                                    <Badge key={h.id} variant="outline" className="gap-1.5 text-[11px]">
                                        {new Date(h.createdAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-US")}{" "}
                                        · SEO {h.seo}%
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                ) : null}
                {/* Input Panel */}
                <div
                    className={cn(
                        "md:col-span-5 space-y-4",
                        auditResult ? "md:col-span-5" : "md:col-span-12 max-w-2xl mx-auto w-full",
                    )}
                >
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">{t("inputCardTitle")}</CardTitle>
                            <CardDescription>{t("inputCardDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder={t("inputPlaceholder")}
                                value={profileText}
                                onChange={(e) => setProfileText(e.target.value)}
                                className="min-h-[220px] bg-background border-border text-sm"
                                disabled={isAnalyzing}
                            />
                            <Button
                                onClick={() => {
                                    void handleRunAudit();
                                }}
                                disabled={isAnalyzing || !profileText.trim()}
                                className="w-full gap-1.5"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                        {t("analyzing")}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-4" />
                                        {t("submitBtn")}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Audit Results Panel */}
                {auditResult && (
                    <div className="md:col-span-7 space-y-6 animate-fade-in">
                        {/* Summary Card with circular scores */}
                        <Card className="border-primary/20 bg-primary/5 dark:bg-primary/5 backdrop-blur-xs glow-emerald">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <TrendingUp className="size-5 text-primary" />
                                    {t("scoreSummaryTitle")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                                {/* Overall circular score */}
                                <div className="relative flex items-center justify-center">
                                    <svg className="size-24 transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="38"
                                            className="stroke-muted"
                                            strokeWidth="6"
                                            fill="transparent"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="38"
                                            className="stroke-emerald transition-all duration-1000 ease-out"
                                            strokeWidth="6"
                                            fill="transparent"
                                            strokeDasharray={2 * Math.PI * 38}
                                            strokeDashoffset={
                                                2 * Math.PI * 38 - (auditResult.seoScore / 100) * (2 * Math.PI * 38)
                                            }
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-slate-100">
                                            {auditResult.seoScore}%
                                        </span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                            {t("seoScoreLabel")}
                                        </span>
                                    </div>
                                </div>

                                {/* Component scores list */}
                                <div className="space-y-2.5 w-full sm:w-1/2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">{t("headlineLabel")}</span>
                                        <span className="font-bold text-foreground">{auditResult.headlineScore}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5">
                                        <div
                                            className="bg-primary h-1.5 rounded-full"
                                            style={{ width: `${auditResult.headlineScore}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">{t("aboutLabel")}</span>
                                        <span className="font-bold text-foreground">{auditResult.aboutScore}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5">
                                        <div
                                            className="bg-emerald h-1.5 rounded-full"
                                            style={{ width: `${auditResult.aboutScore}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">{t("experienceLabel")}</span>
                                        <span className="font-bold text-foreground">
                                            {auditResult.experienceScore}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5">
                                        <div
                                            className="bg-indigo-500 h-1.5 rounded-full"
                                            style={{ width: `${auditResult.experienceScore}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Suggestions and Improvements */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("suggestionsTitle")}
                            </h3>
                            {auditResult.suggestions.map((s) => (
                                <Card key={s.section} className="border-border bg-card">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-sm font-bold text-foreground">
                                                {s.section}
                                            </CardTitle>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-[10px] px-1.5 py-0.5", getScoreColor(s.score))}
                                            >
                                                {t("scoreBadge", { score: s.score })}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-xs space-y-3">
                                        <p className="text-muted-foreground leading-relaxed">{s.feedback}</p>
                                        <div className="p-3 rounded-lg border border-primary/10 bg-primary/5 text-primary-foreground font-sans">
                                            <p className="font-semibold text-primary mb-1">
                                                {t("recommendedProposal")}
                                            </p>
                                            <p className="leading-relaxed text-foreground/90 font-medium italic">
                                                &ldquo;{s.improvedExample}&rdquo;
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* SEO Checklists */}
                        <Card className="border-border bg-card">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">{t("checklistTitle")}</CardTitle>
                                <CardDescription className="text-xs">{t("checklistDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {auditResult.checklist.map((item) => (
                                    <div
                                        key={item.item}
                                        className="flex gap-3 items-start border-b border-border/50 pb-2.5 last:border-0 last:pb-0 text-xs"
                                    >
                                        {item.status ? (
                                            <CheckCircle2 className="size-4 text-emerald shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                                        )}
                                        <div className="space-y-0.5">
                                            <p className="font-semibold text-foreground">{item.item}</p>
                                            <p className="text-muted-foreground">
                                                <span className="text-[10px] uppercase font-bold text-primary mr-1">
                                                    {t("impactLabel")}
                                                </span>{" "}
                                                {item.impact}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
