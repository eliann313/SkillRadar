"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Mail, Phone, Globe } from "lucide-react";
import type { PersonalInfo, ExperienceItem, ProjectItem, LanguageItem, EducationItem } from "./resume-builder.types";

const GithubIcon = () => (
    <svg className="size-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const LinkedinIcon = () => (
    <svg className="size-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);

interface ResumePreviewProps {
    personalInfo: PersonalInfo;
    noExperience: boolean;
    experience: ExperienceItem[];
    projects: ProjectItem[];
    education: EducationItem[];
    skills: string[];
    languages: LanguageItem[];
}

/** Vista previa A4 en vivo (ex bloque de resume-builder/page). */
export function ResumePreview({
    personalInfo,
    noExperience,
    experience,
    projects,
    education,
    skills,
    languages,
}: ResumePreviewProps) {
    const t = useTranslations("ResumeBuilder");

    return (
        <div className="lg:col-span-6 lg:sticky lg:top-20">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider no-print">
                {t("atsAnalysisTitle")} (ATS A4)
            </h2>

            <Card className="a4-preview-card border border-border bg-white text-slate-800 font-sans shadow-lg mx-auto p-8 rounded-none w-full max-w-[210mm] min-h-[297mm] flex flex-col justify-between select-none">
                <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="text-center border-b border-slate-200 pb-5">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {personalInfo.name || "Jane Doe"}
                        </h1>
                        <p className="text-sm font-semibold text-indigo-600 mt-1 uppercase tracking-wide">
                            {personalInfo.title || "Professional Title"}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center items-center text-xs text-slate-500 mt-3.5 font-medium">
                            {personalInfo.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="size-3 text-slate-400" />
                                    {personalInfo.email}
                                </span>
                            )}
                            {personalInfo.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="size-3 text-slate-400" />
                                    {personalInfo.phone}
                                </span>
                            )}
                            {personalInfo.website && (
                                <span className="flex items-center gap-1">
                                    <Globe className="size-3 text-slate-400" />
                                    {personalInfo.website}
                                </span>
                            )}
                            {personalInfo.github && (
                                <span className="flex items-center gap-1">
                                    <GithubIcon />
                                    {personalInfo.github}
                                </span>
                            )}
                            {personalInfo.linkedin && (
                                <span className="flex items-center gap-1">
                                    <LinkedinIcon />
                                    {personalInfo.linkedin}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Summary Section */}
                    {personalInfo.summary && (
                        <div className="space-y-2">
                            <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
                                {t("summaryLabel")}
                            </h2>
                            <p className="text-xs leading-relaxed text-slate-600 font-sans text-justify">
                                {personalInfo.summary}
                            </p>
                        </div>
                    )}

                    {/* Experience Section */}
                    {!noExperience && experience.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
                                {t("professionalExperience")}
                            </h2>
                            <div className="space-y-4">
                                {experience.map((exp) => (
                                    <div key={exp.id} className="space-y-1.5">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-xs font-bold text-slate-900">
                                                {exp.role || "Cargo"}{" "}
                                                <span className="text-slate-400 font-normal">at</span>{" "}
                                                {exp.company || "Empresa"}
                                            </h3>
                                            <span className="text-[10px] font-semibold text-slate-500 font-mono">
                                                {exp.dates || "Fechas"}
                                            </span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-slate-600 font-sans whitespace-pre-line text-justify pl-3 border-l border-slate-200">
                                            {exp.description || "Describe tus logros..."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects Section */}
                    {projects.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
                                {t("personalProjects")}
                            </h2>
                            <div className="space-y-4">
                                {projects.map((proj) => (
                                    <div key={proj.id} className="space-y-1.5">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-xs font-bold text-slate-900">
                                                {proj.role || "Rol"}{" "}
                                                <span className="text-slate-400 font-normal">in</span>{" "}
                                                {proj.name || "Proyecto"}
                                            </h3>
                                            <span className="text-[10px] font-semibold text-slate-500 font-mono">
                                                {proj.dates || "Fechas"}
                                            </span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-slate-600 font-sans whitespace-pre-line text-justify pl-3 border-l border-slate-200">
                                            {proj.description || "Describe el desarrollo..."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education Section */}
                    {education.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
                                {t("educationLabel")}
                            </h2>
                            <div className="space-y-3">
                                {education.map((edu) => (
                                    <div key={edu.id} className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-xs font-bold text-slate-900">
                                                {edu.degree || "Título"}
                                            </h3>
                                            <span className="text-[10px] font-semibold text-slate-500 font-mono">
                                                {edu.dates || "Fechas"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 pl-3 border-l border-slate-200 font-sans">
                                            {edu.institution || "Institución"}
                                            {edu.description && ` — ${edu.description}`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        {/* Skills Section */}
                        {skills.length > 0 && (
                            <div className="space-y-2">
                                <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
                                    {t("skillsLabelTitle")}
                                </h2>
                                <div className="flex flex-wrap gap-x-2 gap-y-1 pl-3 border-l border-slate-200">
                                    {skills.map((skill, index) => (
                                        <span key={skill} className="text-[11px] text-slate-700 font-sans font-medium">
                                            {skill}
                                            {index < skills.length - 1 ? "," : ""}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Languages Section */}
                        {languages.length > 0 && (
                            <div className="space-y-2">
                                <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
                                    {t("languagesLabelTitle")}
                                </h2>
                                <div className="space-y-1 pl-3 border-l border-slate-200">
                                    {languages.map((l) => (
                                        <div key={l.id} className="text-[11px] text-slate-700 font-sans font-medium">
                                            <span className="font-bold">{l.name || "Idioma"}:</span>{" "}
                                            <span className="text-slate-500">{l.level || "Nivel"}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer (ATS friendly tag) */}
                <div className="border-t border-slate-100 pt-3 mt-6 text-center">
                    <p className="text-[9px] text-slate-400 font-mono tracking-wider">
                        Optimized for ATS Parsing • Built with SkillRadar AI
                    </p>
                </div>
            </Card>
        </div>
    );
}
