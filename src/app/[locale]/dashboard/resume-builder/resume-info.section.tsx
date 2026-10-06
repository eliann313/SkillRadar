"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PersonalInfo } from "./resume-builder.types";

interface ResumeInfoSectionProps {
    personalInfo: PersonalInfo;
    onPersonalInfo: (patch: Partial<PersonalInfo>) => void;
    noExperience: boolean;
    onNoExperience: (v: boolean) => void;
}

/** Seccion de info (ex bloque de resume-editor.tabs). */
export function ResumeInfoSection({
    personalInfo,
    onPersonalInfo,
    noExperience,
    onNoExperience,
}: ResumeInfoSectionProps) {
    const t = useTranslations("ResumeBuilder");

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
                <input
                    type="checkbox"
                    id="no-experience"
                    checked={noExperience}
                    onChange={(e) => {
                        onNoExperience(e.target.checked);
                    }}
                    className="size-4 accent-primary rounded border-border"
                />
                <Label htmlFor="no-experience" className="text-xs font-semibold cursor-pointer">
                    {t("noExperienceCheckbox")}
                </Label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">{t("personalName")}</Label>
                    <Input
                        value={personalInfo.name}
                        onChange={(e) => onPersonalInfo({ name: e.target.value })}
                        className="bg-background border-border"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">{t("personalTitle")}</Label>
                    <Input
                        value={personalInfo.title}
                        onChange={(e) => onPersonalInfo({ title: e.target.value })}
                        className="bg-background border-border"
                    />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">{t("personalEmail")}</Label>
                    <Input
                        value={personalInfo.email}
                        onChange={(e) => onPersonalInfo({ email: e.target.value })}
                        className="bg-background border-border"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">{t("personalPhone")}</Label>
                    <Input
                        value={personalInfo.phone}
                        onChange={(e) => onPersonalInfo({ phone: e.target.value })}
                        className="bg-background border-border"
                    />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">{t("personalWebsite")}</Label>
                    <Input
                        value={personalInfo.website}
                        onChange={(e) => onPersonalInfo({ website: e.target.value })}
                        className="bg-background border-border"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">GitHub</Label>
                    <Input
                        value={personalInfo.github}
                        onChange={(e) => onPersonalInfo({ github: e.target.value })}
                        className="bg-background border-border"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">LinkedIn</Label>
                    <Input
                        value={personalInfo.linkedin}
                        onChange={(e) => onPersonalInfo({ linkedin: e.target.value })}
                        className="bg-background border-border"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">{t("summaryLabel")}</Label>
                <Textarea
                    value={personalInfo.summary}
                    onChange={(e) => onPersonalInfo({ summary: e.target.value })}
                    rows={3}
                    className="bg-background border-border"
                />
            </div>
        </div>
    );
}
