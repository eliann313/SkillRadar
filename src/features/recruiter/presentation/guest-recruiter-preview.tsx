"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Lock, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { demoTalentPool } from "@/mocks/demo-data";
import { getSeniorityColor } from "@/shared-kernel/seniority";
import { cn } from "@/shared-kernel/utils";

/**
 * Preview del Talent Pool para guest recruiter (modo demo).
 * 100% solo lectura con mocks: sin verificación, sin DB, sin Server Actions,
 * sin contacto ni shortlist — igual que el dev demo.
 * Muestra perfiles anonimizados (doble ciego) con CTA a registro.
 */
export function GuestRecruiterPreview() {
    const t = useTranslations("Recruiter");

    return (
        <div className="flex flex-col gap-6" data-testid="guest-recruiter-preview">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t("talentPoolTitle")}</h1>
                <p className="text-sm text-muted-foreground">{t("talentPoolDesc")}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {demoTalentPool.map((talent) => (
                    <Card key={talent.id} className="flex flex-col justify-between border-border/50 bg-card/50">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-indigo/20 bg-indigo/10 text-xs font-bold text-indigo">
                                    <Lock className="size-4" aria-hidden />
                                </div>
                                <div>
                                    <CardTitle className="font-mono text-sm text-muted-foreground">
                                        {talent.anonymousId}
                                    </CardTitle>
                                    <Badge className={cn("mt-1", getSeniorityColor(talent.estimatedSeniority))}>
                                        {talent.estimatedSeniority}
                                    </Badge>
                                </div>
                                <span className="ml-auto text-2xl font-bold text-primary">{talent.averageScore}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <p className="text-xs leading-relaxed text-muted-foreground">{talent.justification}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {talent.topSkills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-[11px]">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="w-fit gap-1.5"
                                title={t("guestReadonlyHint")}
                            >
                                <Eye className="size-3.5" aria-hidden />
                                {t("guestPreviewCta")}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

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
