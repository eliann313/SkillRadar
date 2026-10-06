"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import type { ExperienceItem } from "./resume-builder.types";

interface ResumeExperienceSectionProps {
    experience: ExperienceItem[];
    onExperience: (list: ExperienceItem[]) => void;
}

/** Seccion de experience (ex bloque de resume-editor.tabs). */
export function ResumeExperienceSection({ experience, onExperience }: ResumeExperienceSectionProps) {
    const t = useTranslations("ResumeBuilder");

    const handleAddExperience = () =>
        onExperience([...experience, { id: Date.now().toString(), company: "", role: "", dates: "", description: "" }]);
    const handleRemoveExperience = (id: string) => onExperience(experience.filter((e) => e.id !== id));

    return (
        <div className="space-y-6">
            {experience.map((exp, index) => (
                <div key={exp.id} className="space-y-4 p-4 rounded-lg border border-border bg-muted/10 relative">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveExperience(exp.id)}
                        aria-label="Eliminar experiencia"
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    >
                        <X className="size-4" />
                    </Button>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">
                                {t("experienceCompany")}
                            </Label>
                            <Input
                                value={exp.company}
                                onChange={(e) => {
                                    const copy = [...experience];
                                    copy[index].company = e.target.value;
                                    onExperience(copy);
                                }}
                                className="bg-background border-border"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">{t("experienceRole")}</Label>
                            <Input
                                value={exp.role}
                                onChange={(e) => {
                                    const copy = [...experience];
                                    copy[index].role = e.target.value;
                                    onExperience(copy);
                                }}
                                className="bg-background border-border"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">
                                {t("experienceDates")}
                            </Label>
                            <Input
                                value={exp.dates}
                                onChange={(e) => {
                                    const copy = [...experience];
                                    copy[index].dates = e.target.value;
                                    onExperience(copy);
                                }}
                                placeholder="Ej: 2021 - 2023"
                                className="bg-background border-border"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">{t("experienceDesc")}</Label>
                        <Textarea
                            value={exp.description}
                            onChange={(e) => {
                                const copy = [...experience];
                                copy[index].description = e.target.value;
                                onExperience(copy);
                            }}
                            rows={3}
                            className="bg-background border-border min-h-[80px]"
                        />
                    </div>
                </div>
            ))}
            <Button
                onClick={handleAddExperience}
                variant="outline"
                size="sm"
                className="w-full gap-1.5 border-dashed border-border hover:bg-muted/40"
            >
                <Plus className="size-4" />
                {t("addExperienceBtn")}
            </Button>
        </div>
    );
}
