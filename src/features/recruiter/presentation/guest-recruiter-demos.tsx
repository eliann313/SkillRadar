"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Eye, Inbox, Kanban, Lock, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
    demoInboxRequests,
    demoPipelineColumns,
    demoPipelineItems,
    demoPostings,
    demoTemplates,
} from "@/mocks/demo-data";

/**
 * Shell de solo lectura para el guest recruiter.
 * Sin DB, sin Server Actions, sin escrituras: igual que el dev demo,
 * que sí puede navegar progreso / análisis de CV / etc.
 */
function GuestDemoShell({
    title,
    desc,
    testid,
    children,
}: {
    title: string;
    desc: string;
    testid: string;
    children: React.ReactNode;
}) {
    const t = useTranslations("Recruiter");
    return (
        <div className="flex flex-col gap-6" data-testid={testid}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground">{desc}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3.5" aria-hidden />
                    {t("guestReadonlyHint")}
                </p>
            </div>

            {children}

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-base">{t("guestUpsellTitle")}</CardTitle>
                    <CardDescription>{t("guestUpsellDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/login?register=true">
                        <Button className="gap-2">
                            {t("guestUpsellCta")}
                            <ArrowRight className="size-4" aria-hidden />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

function DemoDisabledButton({ label }: { label: string }) {
    const t = useTranslations("Recruiter");
    return (
        <Button variant="outline" size="sm" disabled className="w-fit gap-1.5" title={t("guestReadonlyHint")}>
            <Eye className="size-3.5" aria-hidden />
            {label}
        </Button>
    );
}

export function GuestPostingsPreview() {
    const t = useTranslations("Recruiter");
    return (
        <GuestDemoShell
            title={`${t("talentPoolTitle")} · ${t("jobPostingsFallbackTitle")}`}
            desc={t("jobPostingsFallbackDesc")}
            testid="guest-postings-preview"
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {demoPostings.map((p) => (
                    <Card key={p.id} className="flex flex-col justify-between border-border/50 bg-card/50">
                        <CardHeader className="pb-3">
                            <div className="mb-2 flex items-center justify-between">
                                <Badge variant="outline" className="text-[10px]">
                                    {p.status}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground">
                                    {new Date(p.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <CardTitle className="text-base leading-tight">{p.title}</CardTitle>
                            <CardDescription className="text-xs font-medium text-foreground/80">
                                {p.company} — {p.location}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-3 pb-4">
                            <div className="flex flex-wrap gap-1">
                                {p.requiredSkills.map((s) => (
                                    <Badge key={s} variant="secondary" className="text-[10px]">
                                        {s}
                                    </Badge>
                                ))}
                            </div>
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Briefcase className="size-3.5" aria-hidden />
                                {p.applications} aplicaciones (demo)
                            </p>
                            <DemoDisabledButton label={t("guestPreviewCta")} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </GuestDemoShell>
    );
}

export function GuestPipelinePreview() {
    const t = useTranslations("Recruiter");
    return (
        <GuestDemoShell
            title={`${t("talentPoolTitle")} · ${t("pipelineFallbackTitle")}`}
            desc={t("pipelineFallbackDesc")}
            testid="guest-pipeline-preview"
        >
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                {demoPipelineColumns.map((col) => {
                    const colItems = demoPipelineItems.filter((i) => i.status === col);
                    return (
                        <div
                            key={col}
                            className="flex min-h-[120px] flex-col gap-2 rounded-xl border border-border/40 bg-card/30 p-3"
                        >
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    {col}
                                </span>
                                <Badge variant="outline" className="text-[10px]">
                                    {colItems.length}
                                </Badge>
                            </div>
                            {colItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-border/40 bg-card/60 p-2.5 text-xs"
                                >
                                    <p className="font-mono font-semibold text-foreground">{item.anonymousId}</p>
                                    <p className="mt-0.5 truncate text-muted-foreground">{item.postingTitle}</p>
                                    <p className="mt-1 font-semibold text-primary">{item.matchScore}% match</p>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Kanban className="size-3.5" aria-hidden />
                {t("guestReadonlyHint")}
            </p>
        </GuestDemoShell>
    );
}

export function GuestInboxPreview() {
    const t = useTranslations("Recruiter");
    return (
        <GuestDemoShell
            title={`${t("talentPoolTitle")} · ${t("inboxFallbackTitle")}`}
            desc={t("inboxFallbackDesc")}
            testid="guest-inbox-preview"
        >
            <div className="grid gap-4 md:grid-cols-2">
                {demoInboxRequests.map((r) => (
                    <Card key={r.id} className="border-border/50 bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                            <CardTitle className="font-mono text-sm text-muted-foreground">{r.anonymousId}</CardTitle>
                            <Badge variant="outline" className="text-[10px]">
                                {r.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <p className="line-clamp-2 text-xs text-muted-foreground">{r.message}</p>
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Inbox className="size-3.5" aria-hidden />
                                    {r.messageCount} mensajes
                                </span>
                                <DemoDisabledButton label={t("guestPreviewCta")} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </GuestDemoShell>
    );
}

export function GuestTemplatesPreview() {
    const t = useTranslations("Recruiter");
    return (
        <GuestDemoShell
            title={`${t("talentPoolTitle")} · ${t("templatesFallbackTitle")}`}
            desc={t("templatesFallbackDesc")}
            testid="guest-templates-preview"
        >
            <div className="grid gap-4 md:grid-cols-2">
                {demoTemplates.map((tpl) => (
                    <Card key={tpl.id} className="border-border/50 bg-card/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{tpl.name}</CardTitle>
                            <CardDescription className="text-xs">{tpl.subject}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <p className="line-clamp-4 text-xs whitespace-pre-wrap text-muted-foreground">{tpl.body}</p>
                            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Mail className="size-3.5" aria-hidden />
                                {t("guestReadonlyHint")}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </GuestDemoShell>
    );
}

export function GuestApplicationsPreview({ postingTitle }: { postingTitle: string }) {
    const t = useTranslations("Recruiter");
    return (
        <GuestDemoShell
            title={`${postingTitle} (demo)`}
            desc={t("applicationsFallbackDesc")}
            testid="guest-applications-preview"
        >
            <div className="grid gap-4 md:grid-cols-2">
                {demoPipelineItems.slice(0, 3).map((item) => (
                    <Card key={item.id} className="border-border/50 bg-card/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="font-mono text-sm text-muted-foreground">
                                {item.anonymousId}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <p className="text-xs text-muted-foreground">{item.postingTitle}</p>
                            <p className="text-xs font-semibold text-primary">{item.matchScore}% match</p>
                            <DemoDisabledButton label={t("guestPreviewCta")} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </GuestDemoShell>
    );
}
