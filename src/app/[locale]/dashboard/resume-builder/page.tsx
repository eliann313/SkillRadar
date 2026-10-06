"use client";
import { logger } from "@/infrastructure/logger";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Printer, Save } from "lucide-react";
import { toast } from "sonner";
import {
    analyzeImpactVerbsAction,
    saveResumeDataAction,
} from "@/features/resume-builder/application/resume-builder.use-cases";
import { getUserResumesAction } from "@/features/cv-analysis/application/cv-analysis.use-cases";
import { safeParseJson } from "@/shared-kernel/pii";
import { useTranslations } from "next-intl";
import { ResumePreview } from "./resume-preview";
import { ResumeEditorTabs, type ResumeSection } from "./resume-editor.tabs";
import { VerbAnalysisPanel, type ImpactVerbAnalysis } from "./verb-analysis.panel";
import type { EducationItem, ExperienceItem, LanguageItem, PersonalInfo, ProjectItem } from "./resume-builder.types";

// Lucide Icon Mocks moved to resume-preview.tsx (single use in the A4 preview).

export default function ResumeBuilderPage() {
    const t = useTranslations("ResumeBuilder");
    const { data: session } = useSession();

    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        name: "Jane Doe",
        title: "Senior Full Stack Engineer",
        email: "jane.doe@example.com",
        phone: "+1 (555) 123-4567",
        website: "https://janedoe.dev",
        github: "github.com/janedoe",
        linkedin: "linkedin.com/in/janedoe",
        summary:
            "Desarrollador Full Stack con más de 5 años de experiencia diseñando y escalando arquitecturas de software modernas con React, Next.js y Node.js. Apasionado por la optimización del rendimiento frontend y la resiliencia en la nube.",
    });

    const [noExperience, setNoExperience] = useState(false);

    const [experience, setExperience] = useState<ExperienceItem[]>([
        {
            id: "1",
            company: "Tech Solutions Inc.",
            role: "Lead Developer",
            dates: "2023 - Presente",
            description:
                "Fui parte del equipo que desarrolló el nuevo panel SaaS. Ayudé a mejorar la velocidad de carga de la página optimizando imágenes. Me encargaba de liderar los deploys semanales y coordinar las tareas con el equipo frontend.",
        },
        {
            id: "2",
            company: "Code Creators",
            role: "Full Stack Engineer",
            dates: "2021 - 2023",
            description:
                "Trabajé creando integraciones con pasarelas de pago como Stripe. Ayudé a estructurar la base de datos PostgreSQL y escribí documentación técnica para las APIs internas.",
        },
    ]);

    const [projects, setProjects] = useState<ProjectItem[]>([
        {
            id: "1",
            name: "SkillRadar Optimizer",
            role: "Creator & Lead Developer",
            dates: "2026",
            description:
                "Diseñé e implementé una plataforma con arquitectura Onion y Next.js 16 para analizar compatibilidad ATS de currículums. Reduje tiempos de respuesta integrando APIs optimizadas de Vercel AI SDK.",
        },
    ]);

    const [languages, setLanguages] = useState<LanguageItem[]>([
        { id: "1", name: "Español", level: "Nativo" },
        { id: "2", name: "Inglés", level: "C1" },
    ]);

    const [education, setEducation] = useState<EducationItem[]>([
        {
            id: "1",
            institution: "Universidad Nacional de Ingeniería",
            degree: "Licenciatura en Ciencias de la Computación",
            dates: "2016 - 2020",
            description: "Especialización en Ingeniería de Software y Sistemas Distribuidos.",
        },
    ]);

    const [skills, setSkills] = useState<string[]>([
        "React",
        "Next.js",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "Tailwind CSS",
        "Docker",
        "Git",
    ]);

    // Precargar desde el CV activo y la sesión (en lugar de datos de ejemplo).
    useEffect(() => {
        let cancelled = false;
        void (async () => {
            if (session?.user?.name) {
                const userName = session.user.name;
                if (!cancelled) {
                    setPersonalInfo((prev) => (prev.name === "Jane Doe" ? { ...prev, name: userName } : prev));
                }
            }
            if (session?.user?.email) {
                const userEmail = session.user.email;
                if (!cancelled) {
                    setPersonalInfo((prev) =>
                        prev.email === "jane.doe@example.com" ? { ...prev, email: userEmail } : prev,
                    );
                }
            }
            try {
                const res = await getUserResumesAction();
                if (!res.success || cancelled) return;
                const active =
                    res.data.find((r) => (r as { isActive?: boolean }).isActive) ??
                    [...res.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                if (!active) return;
                const parsed = safeParseJson<{ keywords?: string[] }>(
                    (active as { analysis?: unknown }).analysis ?? null,
                    null,
                );
                if (parsed?.keywords && parsed.keywords.length > 0) {
                    if (!cancelled) {
                        setSkills(parsed.keywords.slice(0, 15));
                    }
                }
            } catch {
                // Precarga opcional: el builder funciona con defaults
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [session?.user?.id, session?.user?.name, session?.user?.email]);
    const [newSkill, setNewSkill] = useState("");

    // IA Verb analysis state
    const [verbAnalysis, setVerbAnalysis] = useState<ImpactVerbAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form editing tabs (los handlers add/remove viven en ResumeEditorTabs)
    const [activeSection, setActiveSection] = useState<ResumeSection>("info");

    const addSkill = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter((s) => s !== skillToRemove));
    };

    // Analyze bullet points using AI
    const handleAnalyzeVerbs = async () => {
        const concatenatedExp = noExperience
            ? projects.map((proj) => `${proj.role} en ${proj.name}:\n${proj.description}`).join("\n\n")
            : experience.map((exp) => `${exp.role} en ${exp.company}:\n${exp.description}`).join("\n\n");

        if (!concatenatedExp.trim()) {
            toast.error(t("addDetailsError"));
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await analyzeImpactVerbsAction(concatenatedExp);
            if (result.success) {
                setVerbAnalysis(result.data);
                toast.success("¡Análisis de impacto de verbos completado!");
            } else {
                toast.error(result.error || "Fallo en el análisis de verbos.");
            }
        } catch (e) {
            logger.error(e);
            toast.error("Ocurrió un error al procesar el análisis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Generate plain text structure
    const getRawTextRepresentation = () => {
        let text = `${personalInfo.name}\n${personalInfo.title}\n${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.website}\nGitHub: ${personalInfo.github} | LinkedIn: ${personalInfo.linkedin}\n\n`;
        if (personalInfo.summary) {
            text += `${t("summaryLabel")}\n${personalInfo.summary}\n\n`;
        }

        if (!noExperience && experience.length > 0) {
            text += `${t("professionalExperience")}\n`;
            experience.forEach((exp) => {
                text += `- ${exp.role} en ${exp.company} (${exp.dates})\n  ${exp.description}\n\n`;
            });
        }

        if (projects.length > 0) {
            text += `${t("personalProjects")}\n`;
            projects.forEach((p) => {
                text += `- ${p.role} en ${p.name} (${p.dates})\n  ${p.description}\n\n`;
            });
        }

        if (languages.length > 0) {
            text += `${t("languagesLabelTitle")}\n`;
            languages.forEach((l) => {
                text += `- ${l.name}: ${l.level}\n`;
            });
            text += "\n";
        }

        text += `${t("educationLabel")}\n`;
        education.forEach((edu) => {
            text += `- ${edu.degree} en ${edu.institution} (${edu.dates})\n  ${edu.description}\n\n`;
        });

        text += `${t("skillsLabelTitle")}\n${skills.join(", ")}\n`;
        return text;
    };

    // Save/Publish constructed CV
    const handleSaveResume = async () => {
        setIsSaving(true);
        try {
            const resumeJson = JSON.stringify({
                personalInfo,
                experience: noExperience ? [] : experience,
                projects,
                languages,
                education,
                skills,
                noExperience,
            });
            const rawText = getRawTextRepresentation();

            const result = await saveResumeDataAction(resumeJson, rawText);
            if (result.success) {
                toast.success(t("saveSuccess"));
            } else {
                toast.error(result.error || "Fallo al guardar el currículum.");
            }
        } catch (e) {
            logger.error(e);
            toast.error("Error al guardar el currículum.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto printable-area">
            {/* Scoped CSS styling for ATS-friendly A4 print layout */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-area,
                    .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .a4-preview-card {
                        border: none !important;
                        box-shadow: none !important;
                        background: white !important;
                        color: black !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
            `}</style>

            {/* Header / Actions bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                        className="gap-1.5 border-border"
                    >
                        <Printer className="size-4" />
                        {t("downloadPdf")}
                    </Button>
                    <Button
                        onClick={() => {
                            void handleSaveResume();
                        }}
                        size="sm"
                        disabled={isSaving}
                        className="gap-1.5"
                    >
                        {isSaving ? (
                            <>
                                <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                {t("publishBtnLoading")}
                            </>
                        ) : (
                            <>
                                <Save className="size-4" />
                                {t("publishBtn")}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* Left Side: Forms Editor & Verb analysis */}
                <div className="lg:col-span-6 space-y-6 no-print">
                    <ResumeEditorTabs
                        activeSection={activeSection}
                        onSectionChange={setActiveSection}
                        personalInfo={personalInfo}
                        onPersonalInfo={(patch) => setPersonalInfo((prev) => ({ ...prev, ...patch }))}
                        noExperience={noExperience}
                        onNoExperience={setNoExperience}
                        experience={experience}
                        onExperience={setExperience}
                        projects={projects}
                        onProjects={setProjects}
                        languages={languages}
                        onLanguages={setLanguages}
                        education={education}
                        onEducation={setEducation}
                        skills={skills}
                        newSkill={newSkill}
                        onNewSkill={setNewSkill}
                        onAddSkill={addSkill}
                        onRemoveSkill={removeSkill}
                    />

                    <VerbAnalysisPanel
                        analysis={verbAnalysis}
                        isAnalyzing={isAnalyzing}
                        analyzeDisabled={noExperience ? projects.length === 0 : experience.length === 0}
                        onAnalyze={() => void handleAnalyzeVerbs()}
                    />
                </div>

                <ResumePreview
                    personalInfo={personalInfo}
                    noExperience={noExperience}
                    experience={experience}
                    projects={projects}
                    education={education}
                    skills={skills}
                    languages={languages}
                />
            </div>
        </div>
    );
}
