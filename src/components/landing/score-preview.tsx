"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadialProgress } from "@/components/dashboard/radial-progress";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { demoCvNumbers } from "@/mocks/demo-data";

const RINGS = [
    { value: demoCvNumbers.atsScore, label: "ATS", className: "" },
    { value: demoCvNumbers.technicalScore, label: "Tech", className: "text-indigo" },
    { value: demoCvNumbers.credibilityScore, label: "Real", className: "text-emerald" },
] as const;

export function ScorePreview() {
    const t = useTranslations("Home");

    return (
        <div className="w-full rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
                <Badge variant="outline" className="gap-1.5 border-warning/40 text-warning text-[10px]">
                    {t("demoBadge")}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">DEV-9B1C27</span>
            </div>
            <div className="flex items-center justify-around gap-4">
                {RINGS.map((ring) => (
                    <RadialProgress
                        key={ring.label}
                        value={ring.value}
                        size={92}
                        strokeWidth={7}
                        className={ring.className}
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-foreground">{ring.value}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                {ring.label}
                            </span>
                        </div>
                    </RadialProgress>
                ))}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">{t("heroVisualCaption")}</p>
            <div className="mt-3 flex justify-center">
                <Link href="/demo">
                    <Button variant="outline" size="sm" className="gap-1.5">
                        {t("heroVisualCta")}
                        <ArrowRight className="size-3.5" aria-hidden />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
