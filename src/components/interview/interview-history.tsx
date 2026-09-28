"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { getInterviewHistoryAction, type InterviewHistoryItem } from "@/features/interview/actions";

export function InterviewHistory() {
    const t = useTranslations("MockInterview");
    const [items, setItems] = useState<InterviewHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getInterviewHistoryAction()
            .then((res) => {
                if (!cancelled && res.success) setItems(res.data);
            })
            .catch(() => undefined)
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading || items.length === 0) return null;

    return (
        <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">
                    {t("historyTitle", { default: "Historial de entrevistas" })}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs"
                    >
                        <span className="text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.company ? <span className="font-semibold text-foreground">{item.company}</span> : null}
                        {item.mode ? (
                            <Badge variant="outline" className="text-[10px] capitalize">
                                {item.mode.replace(/_/g, " ")}
                            </Badge>
                        ) : null}
                        <span className="ml-auto font-bold text-primary">
                            {item.score !== null ? `${item.score}/100` : "—"}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
