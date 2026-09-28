"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function PrivacyCard({ pendingCount }: { pendingCount: number }) {
    const t = useTranslations("Dashboard");

    return (
        <Card className="border-emerald/20 bg-emerald/5">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald/10">
                    <ShieldCheck className="size-5 text-emerald" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{t("privacyTitle")}</p>
                    <p className="text-xs text-muted-foreground">{t("privacyDesc", { count: pendingCount })}</p>
                </div>
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                    {t("privacyCta")}
                    <ArrowRight className="size-3.5" />
                </Link>
            </CardContent>
        </Card>
    );
}
