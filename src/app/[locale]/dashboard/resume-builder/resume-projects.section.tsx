"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import type { ProjectItem } from "./resume-builder.types";

interface ResumeProjectsSectionProps {
    projects: ProjectItem[];
    onProjects: (list: ProjectItem[]) => void;
}

/** Seccion de projects (ex bloque de resume-editor.tabs). */
export function ResumeProjectsSection({ projects, onProjects }: ResumeProjectsSectionProps) {
    const t = useTranslations("ResumeBuilder");

    const handleAddProject = () =>
        onProjects([...projects, { id: Date.now().toString(), name: "", role: "", dates: "", description: "" }]);
    const handleRemoveProject = (id: string) => onProjects(projects.filter((p) => p.id !== id));

    return (
        <div className="space-y-6">
            {projects.map((proj, index) => (
                <div key={proj.id} className="space-y-4 p-4 rounded-lg border border-border bg-muted/10 relative">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveProject(proj.id)}
                        aria-label="Eliminar proyecto"
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    >
                        <X className="size-4" />
                    </Button>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">{t("projectsName")}</Label>
                            <Input
                                value={proj.name}
                                onChange={(e) => {
                                    const copy = [...projects];
                                    copy[index].name = e.target.value;
                                    onProjects(copy);
                                }}
                                className="bg-background border-border"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">{t("projectsRole")}</Label>
                            <Input
                                value={proj.role}
                                onChange={(e) => {
                                    const copy = [...projects];
                                    copy[index].role = e.target.value;
                                    onProjects(copy);
                                }}
                                className="bg-background border-border"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">{t("projectsDates")}</Label>
                            <Input
                                value={proj.dates}
                                onChange={(e) => {
                                    const copy = [...projects];
                                    copy[index].dates = e.target.value;
                                    onProjects(copy);
                                }}
                                placeholder="Ej: 2026"
                                className="bg-background border-border"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">{t("projectsDesc")}</Label>
                        <Textarea
                            value={proj.description}
                            onChange={(e) => {
                                const copy = [...projects];
                                copy[index].description = e.target.value;
                                onProjects(copy);
                            }}
                            rows={3}
                            className="bg-background border-border min-h-[80px]"
                        />
                    </div>
                </div>
            ))}
            <Button
                onClick={handleAddProject}
                variant="outline"
                size="sm"
                className="w-full gap-1.5 border-dashed border-border hover:bg-muted/40"
            >
                <Plus className="size-4" />
                {t("addProjectBtn")}
            </Button>
        </div>
    );
}
