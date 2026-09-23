"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContactThread } from "@/components/recruiter/contact-thread";
import type { SentContactRequest } from "@/features/recruiter/actions";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const STATUSES = ["all", "pending", "accepted", "declined"] as const;

export function RequestsClientPage({ initial }: { initial: SentContactRequest[] }) {
    const t = useTranslations("Inbox");
    const [filter, setFilter] = useState<(typeof STATUSES)[number]>("all");
    const [openId, setOpenId] = useState<string | null>(null);

    const visible = initial.filter((r) => filter === "all" || r.status === filter);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                    <Button
                        key={s}
                        variant={filter === s ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(s)}
                    >
                        {t(s)}
                        {s !== "all" ? ` (${initial.filter((r) => r.status === s).length})` : ""}
                    </Button>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {visible.map((r) => (
                    <Card key={r.id} className="border-border/50 bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                            <CardTitle className="font-mono text-sm text-muted-foreground">
                                DEV-{r.developerId.slice(-4).toUpperCase()}
                            </CardTitle>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-[10px]",
                                    r.status === "accepted" && "border-emerald/40 text-emerald",
                                    r.status === "declined" && "border-destructive/40 text-destructive",
                                    r.status === "pending" && "border-warning/40 text-warning",
                                )}
                            >
                                {t(r.status as "pending" | "accepted" | "declined")}
                            </Badge>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <p className="line-clamp-2 text-xs text-muted-foreground">{r.message}</p>
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>
                                    {r.messageCount} {t("messages")}
                                    {r.lastMessageAt ? ` · ${new Date(r.lastMessageAt).toLocaleDateString()}` : ""}
                                </span>
                                <Button size="sm" variant="outline" onClick={() => setOpenId(r.id)}>
                                    {t("open")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {visible.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
            </div>

            <Dialog open={openId !== null} onOpenChange={(o) => !o && setOpenId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("threadTitle")}</DialogTitle>
                    </DialogHeader>
                    {openId ? <ContactThread requestId={openId} /> : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
