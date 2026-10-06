"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { PersonalInfo, ExperienceItem, ProjectItem, LanguageItem, EducationItem } from "./resume-builder.types";

export type ResumeSection = "info" | "experience" | "projects" | "languages" | "education" | "skills";

interface ResumeEditorTabsProps {
    activeSection: ResumeSection;
    onSectionChange: (s: ResumeSection) => void;
    personalInfo: PersonalInfo;
    onPersonalInfo: (patch: Partial<PersonalInfo>) => void;
    noExperience: boolean;
    onNoExperience: (v: boolean) => void;
    experience: ExperienceItem[];
    onExperience: (list: ExperienceItem[]) => void;
    projects: ProjectItem[];
    onProjects: (list: ProjectItem[]) => void;
    languages: LanguageItem[];
    onLanguages: (list: LanguageItem[]) => void;
    education: EducationItem[];
    onEducation: (list: EducationItem[]) => void;
    skills: string[];
    newSkill: string;
    onNewSkill: (v: string) => void;
    onAddSkill: (e: React.FormEvent) => void;
    onRemoveSkill: (s: string) => void;
}

/** Editor por tabs (ex bloque de resume-builder/page; handlers add/remove locales). */
export function ResumeEditorTabs({
    activeSection,
    onSectionChange,
    personalInfo,
    onPersonalInfo,
    noExperience,
    onNoExperience,
    experience,
    onExperience,
    projects,
    onProjects,
    languages,
    onLanguages,
    education,
    onEducation,
    skills,
    newSkill,
    onNewSkill,
    onAddSkill,
    onRemoveSkill,
}: ResumeEditorTabsProps) {
    const t = useTranslations("ResumeBuilder");

    const handleAddExperience = () =>
        onExperience([...experience, { id: Date.now().toString(), company: "", role: "", dates: "", description: "" }]);
    const handleRemoveExperience = (id: string) => onExperience(experience.filter((e) => e.id !== id));
    const handleAddProject = () =>
        onProjects([...projects, { id: Date.now().toString(), name: "", role: "", dates: "", description: "" }]);
    const handleRemoveProject = (id: string) => onProjects(projects.filter((p) => p.id !== id));
    const handleAddLanguage = () => onLanguages([...languages, { id: Date.now().toString(), name: "", level: "" }]);
    const handleRemoveLanguage = (id: string) => onLanguages(languages.filter((l) => l.id !== id));
    const handleAddEducation = () =>
        onEducation([
            ...education,
            { id: Date.now().toString(), institution: "", degree: "", dates: "", description: "" },
        ]);
    const handleRemoveEducation = (id: string) => onEducation(education.filter((e) => e.id !== id));
    const handleAddSkill = (e: React.FormEvent) => onAddSkill(e);
    const handleRemoveSkill = (s: string) => onRemoveSkill(s);

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex flex-wrap gap-1 border-b border-border pb-2">
                    {[
                        { id: "info", label: t("tabPersonalInfo") },
                        { id: "experience", label: t("tabExperience"), hide: noExperience },
                        { id: "projects", label: t("tabProjects") },
                        { id: "languages", label: t("tabLanguages") },
                        { id: "education", label: t("tabEducation") },
                        { id: "skills", label: t("tabSkills") },
                    ]
                        .filter((tab) => !tab.hide)
                        .map((tab) => (
                            <Button
                                key={tab.id}
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    onSectionChange(
                                        tab.id as
                                            "info" | "experience" | "projects" | "languages" | "education" | "skills",
                                    )
                                }
                                className={`px-3 py-1.5 text-xs font-semibold ${
                                    activeSection === tab.id
                                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {tab.label}
                            </Button>
                        ))}
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                {/* Personal Info Tab */}
                {activeSection === "info" && (
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
                                <Label className="text-xs font-semibold text-muted-foreground">
                                    {t("personalName")}
                                </Label>
                                <Input
                                    value={personalInfo.name}
                                    onChange={(e) => onPersonalInfo({ name: e.target.value })}
                                    className="bg-background border-border"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">
                                    {t("personalTitle")}
                                </Label>
                                <Input
                                    value={personalInfo.title}
                                    onChange={(e) => onPersonalInfo({ title: e.target.value })}
                                    className="bg-background border-border"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">
                                    {t("personalEmail")}
                                </Label>
                                <Input
                                    value={personalInfo.email}
                                    onChange={(e) => onPersonalInfo({ email: e.target.value })}
                                    className="bg-background border-border"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">
                                    {t("personalPhone")}
                                </Label>
                                <Input
                                    value={personalInfo.phone}
                                    onChange={(e) => onPersonalInfo({ phone: e.target.value })}
                                    className="bg-background border-border"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">
                                    {t("personalWebsite")}
                                </Label>
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
                )}

                {/* Experience Tab */}
                {activeSection === "experience" && !noExperience && (
                    <div className="space-y-6">
                        {experience.map((exp, index) => (
                            <div
                                key={exp.id}
                                className="space-y-4 p-4 rounded-lg border border-border bg-muted/10 relative"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => handleRemoveExperience(exp.id)}
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
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                            {t("experienceRole")}
                                        </Label>
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
                                    <Label className="text-xs font-semibold text-muted-foreground">
                                        {t("experienceDesc")}
                                    </Label>
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
                )}

                {/* Projects Tab */}
                {activeSection === "projects" && (
                    <div className="space-y-6">
                        {projects.map((proj, index) => (
                            <div
                                key={proj.id}
                                className="space-y-4 p-4 rounded-lg border border-border bg-muted/10 relative"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => handleRemoveProject(proj.id)}
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                >
                                    <X className="size-4" />
                                </Button>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                            {t("projectsName")}
                                        </Label>
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
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                            {t("projectsRole")}
                                        </Label>
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
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                            {t("projectsDates")}
                                        </Label>
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
                                    <Label className="text-xs font-semibold text-muted-foreground">
                                        {t("projectsDesc")}
                                    </Label>
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
                )}

                {/* Languages Tab */}
                {activeSection === "languages" && (
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
                )}

                {/* Education Tab */}
                {activeSection === "education" && (
                    <div className="space-y-6">
                        {education.map((edu, index) => (
                            <div
                                key={edu.id}
                                className="space-y-4 p-4 rounded-lg border border-border bg-muted/10 relative"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => handleRemoveEducation(edu.id)}
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
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                            {t("educationDates")}
                                        </Label>
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
                                    <Label className="text-xs font-semibold text-muted-foreground">
                                        {t("educationDesc")}
                                    </Label>
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
                )}

                {/* Skills Tab */}
                {activeSection === "skills" && (
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
                                        className="text-muted-foreground hover:text-foreground transition-colors font-bold ml-0.5"
                                    >
                                        ×
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
