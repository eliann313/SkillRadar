"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";

interface AccountTypeCardProps {
    role?: string;
    plan: "free" | "byok";
}

/** Tipo de cuenta + plan real (ex bloque de settings/page; antes hardcodeaba freePlan). */
export function AccountTypeCard({ role, plan }: AccountTypeCardProps) {
    const t = useTranslations("Settings");

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building className="size-5 text-primary" />
                    {t("accountTypeTitle")}
                </CardTitle>
                <CardDescription>{t("accountTypeDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                            {role}
                        </Badge>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                            {plan === "byok" ? t("planByok") : t("freePlan")}
                        </Badge>
                    </div>
                    <Link href="/#pricing">
                        <Button variant="outline">{t("upgradeToPro")}</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
