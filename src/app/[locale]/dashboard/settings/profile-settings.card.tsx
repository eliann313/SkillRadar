"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, User as UserIcon } from "lucide-react";
import type { SettingsUser } from "./settings-cards.types";

interface ProfileSettingsCardProps {
    user: SettingsUser;
}

/** Perfil + acceso a gestión de CVs (ex bloque de settings/page). */
export function ProfileSettingsCard({ user }: ProfileSettingsCardProps) {
    const t = useTranslations("Settings");

    return (
        <>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="size-5 text-primary" />
                        {t("profileTitle")}
                    </CardTitle>
                    <CardDescription>{t("profileDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">{t("fullName")}</Label>
                            <Input id="name" defaultValue={user.name || ""} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">{t("email")}</Label>
                            <Input
                                id="email"
                                type="email"
                                defaultValue={user.email || ""}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                        </div>
                    </div>
                    {user.role === "recruiter" && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="company">{t("company")}</Label>
                            <Input id="company" defaultValue="TechCorp" placeholder={t("companyPlaceholder")} />
                        </div>
                    )}
                    <Button className="w-fit">{t("saveChanges")}</Button>
                </CardContent>
            </Card>

            {user.role === "developer" && (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="size-5 text-emerald-500" />
                            {t("resumesTitle")}
                        </CardTitle>
                        <CardDescription>{t("resumesDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/settings/resumes">
                            <Button variant="secondary" className="gap-2">
                                <FileText className="size-4" />
                                {t("manageResumes")}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
