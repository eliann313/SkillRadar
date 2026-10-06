"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface ResumeSkillsSectionProps {
    skills: string[];
    newSkill: string;
    onNewSkill: (v: string) => void;
    onAddSkill: (e: React.FormEvent) => void;
    onRemoveSkill: (s: string) => void;
}

/** Seccion de skills (ex bloque de resume-editor.tabs). */
export function ResumeSkillsSection({
    skills,
    newSkill,
    onNewSkill,
    onAddSkill,
    onRemoveSkill,
}: ResumeSkillsSectionProps) {
    const t = useTranslations("ResumeBuilder");

    const handleAddSkill = (e: React.FormEvent) => onAddSkill(e);
    const handleRemoveSkill = (s: string) => onRemoveSkill(s);

    return (
        <div className="space-y-4">
            <form onSubmit={handleAddSkill} className="flex gap-2">
                <Input
                    value={newSkill}
                    onChange={(e) => onNewSkill(e.target.value)}
                    placeholder="Ej: Kubernetes, Jest, GraphQL..."
                    className="bg-background border-border"
                />
                <Button type="submit" size="sm" className="gap-1">
                    <Plus className="size-4" />
                    {t("addSkillBtn")}
                </Button>
            </form>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-border bg-muted/10 min-h-[100px]">
                {skills.map((skill) => (
                    <Badge
                        key={skill}
                        variant="secondary"
                        className="gap-1 bg-secondary/80 text-secondary-foreground text-xs py-1 px-2.5"
                    >
                        {skill}
                        <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            aria-label={"Eliminar " + skill}
                            className="text-muted-foreground hover:text-foreground transition-colors font-bold ml-0.5"
                        >
                            ×
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
}
