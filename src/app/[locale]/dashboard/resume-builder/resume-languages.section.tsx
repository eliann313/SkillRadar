"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { LanguageItem } from "./resume-builder.types";

interface ResumeLanguagesSectionProps {
    languages: LanguageItem[];
    onLanguages: (list: LanguageItem[]) => void;
}

/** Seccion de languages (ex bloque de resume-editor.tabs). */
export function ResumeLanguagesSection({ languages, onLanguages }: ResumeLanguagesSectionProps) {
    const t = useTranslations("ResumeBuilder");

    const handleAddLanguage = () => onLanguages([...languages, { id: Date.now().toString(), name: "", level: "" }]);
    const handleRemoveLanguage = (id: string) => onLanguages(languages.filter((l) => l.id !== id));

    return (
        <div className="space-y-4">
            {languages.map((l, index) => (
                <div
                    key={l.id}
                    className="flex gap-3 items-end relative p-3 rounded-lg border border-border bg-muted/5"
                >
                    <div className="flex-1 grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">
                                {t("languagesName")}
                            </Label>
                            <Input
                                value={l.name}
                                onChange={(e) => {
                                    const copy = [...languages];
                                    copy[index].name = e.target.value;
                                    onLanguages(copy);
                                }}
                                className="h-8 bg-background border-border text-xs"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">
                                {t("languagesLevel")}
                            </Label>
                            <Input
                                value={l.level}
                                onChange={(e) => {
                                    const copy = [...languages];
                                    copy[index].level = e.target.value;
                                    onLanguages(copy);
                                }}
                                className="h-8 bg-background border-border text-xs"
                            />
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveLanguage(l.id)}
                        aria-label="Eliminar idioma"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            ))}
            <Button
                onClick={handleAddLanguage}
                variant="outline"
                size="sm"
                className="w-full gap-1.5 border-dashed border-border hover:bg-muted/40"
            >
                <Plus className="size-4" />
                {t("addLanguageBtn")}
            </Button>
        </div>
    );
}
