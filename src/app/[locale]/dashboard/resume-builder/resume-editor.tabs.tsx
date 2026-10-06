"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PersonalInfo, ExperienceItem, ProjectItem, LanguageItem, EducationItem } from "./resume-builder.types";
import { ResumeInfoSection } from "./resume-info.section";
import { ResumeExperienceSection } from "./resume-experience.section";
import { ResumeProjectsSection } from "./resume-projects.section";
import { ResumeLanguagesSection } from "./resume-languages.section";
import { ResumeEducationSection } from "./resume-education.section";
import { ResumeSkillsSection } from "./resume-skills.section";

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

/** Shell de tabs del editor (las secciones viven en sus propios ficheros). */
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
                                onClick={() => onSectionChange(tab.id as ResumeSection)}
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
                {activeSection === "info" && (
                    <ResumeInfoSection
                        personalInfo={personalInfo}
                        onPersonalInfo={onPersonalInfo}
                        noExperience={noExperience}
                        onNoExperience={onNoExperience}
                    />
                )}
                {activeSection === "experience" && !noExperience && (
                    <ResumeExperienceSection experience={experience} onExperience={onExperience} />
                )}
                {activeSection === "projects" && <ResumeProjectsSection projects={projects} onProjects={onProjects} />}
                {activeSection === "languages" && (
                    <ResumeLanguagesSection languages={languages} onLanguages={onLanguages} />
                )}
                {activeSection === "education" && (
                    <ResumeEducationSection education={education} onEducation={onEducation} />
                )}
                {activeSection === "skills" && (
                    <ResumeSkillsSection
                        skills={skills}
                        newSkill={newSkill}
                        onNewSkill={onNewSkill}
                        onAddSkill={onAddSkill}
                        onRemoveSkill={onRemoveSkill}
                    />
                )}
            </CardContent>
        </Card>
    );
}
