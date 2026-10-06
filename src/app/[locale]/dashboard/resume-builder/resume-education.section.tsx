"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import type { EducationItem } from "./resume-builder.types";

interface ResumeEducationSectionProps {
    education: EducationItem[];
    onEducation: (list: EducationItem[]) => void;
}

/** Seccion de education (ex bloque de resume-editor.tabs). */
export function ResumeEducationSection({ education, onEducation }: ResumeEducationSectionProps) {
    const t = useTranslations("ResumeBuilder");

    const handleAddEducation = () =>
        onEducation([
            ...education,
            { id: Date.now().toString(), institution: "", degree: "", dates: "", description: "" },
        ]);
    const handleRemoveEducation = (id: string) => onEducation(education.filter((e) => e.id !== id));

    return (
        <div className="space-y-6">
            {education.map((edu, index) => (
                <div key={edu.id} className="space-y-4 p-4 rounded-lg border border-border bg-muted/10 relative">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveEducation(edu.id)}
                        aria-label="Eliminar educacion"
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    >
                        <X className="size-4" />
                    </Button>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">
                                {t("educationInstitution")}
                            </Label>
                            <Input
                                value={edu.institution}
                                onChange={(e) => {
                                    const copy = [...education];
                                    copy[index].institution = e.target.value;
                                    onEducation(copy);
                                }}
                                className="bg-background border-border"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">
                                {t("educationDegree")}
                            </Label>
                            <Input
                                value={edu.degree}
                                onChange={(e) => {
                                    const copy = [...education];
                                    copy[index].degree = e.target.value;
                                    onEducation(copy);
                                }}
                                className="bg-background border-border"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">{t("educationDates")}</Label>
                            <Input
                                value={edu.dates}
                                onChange={(e) => {
                                    const copy = [...education];
                                    copy[index].dates = e.target.value;
                                    onEducation(copy);
                                }}
                                placeholder="Ej: 2016 - 2020"
                                className="bg-background border-border"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">{t("educationDesc")}</Label>
                        <Textarea
                            value={edu.description}
                            onChange={(e) => {
                                const copy = [...education];
                                copy[index].description = e.target.value;
                                onEducation(copy);
                            }}
                            rows={2}
                            className="bg-background border-border min-h-[60px]"
                        />
                    </div>
                </div>
            ))}
            <Button
                onClick={handleAddEducation}
                variant="outline"
                size="sm"
                className="w-full gap-1.5 border-dashed border-border hover:bg-muted/40"
            >
                <Plus className="size-4" />
                {t("addEducationBtn")}
            </Button>
        </div>
    );
}
