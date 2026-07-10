"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Printer, Save, Mail, Phone, Globe, X } from "lucide-react";
import { toast } from "sonner";
import { analyzeImpactVerbsAction, saveResumeDataAction } from "@/features/resume-builder/actions";
import { useTranslations } from "next-intl";

// Lucide Icon Mocks because simple svg icons are cleaner for PDF exports
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

interface ExperienceItem {
    id: string;
    company: string;
    role: string;
    dates: string;
    description: string;
}

interface ProjectItem {
    id: string;
    name: string;
    role: string;
    dates: string;
    description: string;
}

interface LanguageItem {
    id: string;
    name: string;
    level: string;
}

interface EducationItem {
    id: string;
    institution: string;
    degree: string;
    dates: string;
    description: string;
}

interface ImpactVerbSuggestion {
    original: string;
    suggestion: string;
    reason: string;
}

interface ImpactVerbAnalysis {
    impactScore: number;
    passiveVerbsCount: number;
    activeVerbsCount: number;
    passiveVerbsFound: string[];
    suggestions: ImpactVerbSuggestion[];
    recommendations: string[];
}

export default function ResumeBuilderPage() {
    const t = useTranslations("ResumeBuilder");

    const [personalInfo, setPersonalInfo] = useState({
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
    const [newSkill, setNewSkill] = useState("");

    // IA Verb analysis state
    const [verbAnalysis, setVerbAnalysis] = useState<ImpactVerbAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form editing tabs
    const [activeSection, setActiveSection] = useState<
        "info" | "experience" | "projects" | "languages" | "education" | "skills"
    >("info");

    const addExperience = () => {
        setExperience([
            ...experience,
            { id: Date.now().toString(), company: "", role: "", dates: "", description: "" },
        ]);
    };

    const removeExperience = (id: string) => {
        setExperience(experience.filter((exp) => exp.id !== id));
    };

    const addProject = () => {
        setProjects([...projects, { id: Date.now().toString(), name: "", role: "", dates: "", description: "" }]);
    };

    const removeProject = (id: string) => {
        setProjects(projects.filter((p) => p.id !== id));
    };

    const addLanguage = () => {
        setLanguages([...languages, { id: Date.now().toString(), name: "", level: "" }]);
    };

    const removeLanguage = (id: string) => {
        setLanguages(languages.filter((l) => l.id !== id));
    };

    const addEducation = () => {
        setEducation([
            ...education,
            { id: Date.now().toString(), institution: "", degree: "", dates: "", description: "" },
        ]);
    };

    const removeEducation = (id: string) => {
        setEducation(education.filter((edu) => edu.id !== id));
    };

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
            console.error(e);
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
            console.error(e);
            toast.error("Error al guardar el currículum.");
        } finally {
            setIsSaving(false);
        }
    };

    // Action score color
    const getScoreColor = (score: number) => {
        if (score >= 85) return "text-emerald";
        if (score >= 70) return "text-primary";
        if (score >= 50) return "text-warning";
        return "text-destructive";
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
                    {/* Forms Editor Tabs */}
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
                                                setActiveSection(
                                                    tab.id as
                                                        | "info"
                                                        | "experience"
                                                        | "projects"
                                                        | "languages"
                                                        | "education"
                                                        | "skills",
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
                                                setNoExperience(e.target.checked);
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
                                                onChange={(e) =>
                                                    setPersonalInfo({ ...personalInfo, name: e.target.value })
                                                }
                                                className="bg-background border-border"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                {t("personalTitle")}
                                            </Label>
                                            <Input
                                                value={personalInfo.title}
                                                onChange={(e) =>
                                                    setPersonalInfo({ ...personalInfo, title: e.target.value })
                                                }
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
                                                onChange={(e) =>
                                                    setPersonalInfo({ ...personalInfo, email: e.target.value })
                                                }
                                                className="bg-background border-border"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                {t("personalPhone")}
                                            </Label>
                                            <Input
                                                value={personalInfo.phone}
                                                onChange={(e) =>
                                                    setPersonalInfo({ ...personalInfo, phone: e.target.value })
                                                }
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
                                                onChange={(e) =>
                                                    setPersonalInfo({ ...personalInfo, website: e.target.value })
                                                }
                                                className="bg-background border-border"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                GitHub
                                            </Label>
                                            <Input
                                                value={personalInfo.github}
                                                onChange={(e) =>
                                                    setPersonalInfo({ ...personalInfo, github: e.target.value })
                                                }
                                                className="bg-background border-border"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                LinkedIn
                                            </Label>
                                            <Input
                                                value={personalInfo.linkedin}
                                                onChange={(e) =>
                                                    setPersonalInfo({ ...personalInfo, linkedin: e.target.value })
                                                }
                                                className="bg-background border-border"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                            {t("summaryLabel")}
                                        </Label>
                                        <Textarea
                                            value={personalInfo.summary}
                                            onChange={(e) =>
                                                setPersonalInfo({ ...personalInfo, summary: e.target.value })
                                            }
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
                                                onClick={() => removeExperience(exp.id)}
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
                                                            setExperience(copy);
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
                                                            setExperience(copy);
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
                                                            setExperience(copy);
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
                                                        setExperience(copy);
                                                    }}
                                                    rows={3}
                                                    className="bg-background border-border min-h-[80px]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={addExperience}
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
                                                onClick={() => removeProject(proj.id)}
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
                                                            setProjects(copy);
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
                                                            setProjects(copy);
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
                                                            setProjects(copy);
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
                                                        setProjects(copy);
                                                    }}
                                                    rows={3}
                                                    className="bg-background border-border min-h-[80px]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={addProject}
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
                                                            setLanguages(copy);
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
                                                            setLanguages(copy);
                                                        }}
                                                        className="h-8 bg-background border-border text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => removeLanguage(l.id)}
                                                className="text-muted-foreground hover:text-destructive shrink-0"
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={addLanguage}
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
                                                onClick={() => removeEducation(edu.id)}
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
                                                            setEducation(copy);
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
                                                            setEducation(copy);
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
                                                            setEducation(copy);
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
                                                        setEducation(copy);
                                                    }}
                                                    rows={2}
                                                    className="bg-background border-border min-h-[60px]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={addEducation}
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
                                    <form onSubmit={addSkill} className="flex gap-2">
                                        <Input
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
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
                                                    onClick={() => removeSkill(skill)}
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

                    {/* Impact Verb Analyzer Panel (13.2) */}
                    <Card className="border-primary/20 bg-primary/5 dark:bg-primary/5 backdrop-blur-xs glow-indigo">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                                <Sparkles className="size-5 text-primary" />
                                {t("atsAnalysisTitle")}
                            </CardTitle>
                            <CardDescription>{t("atsAnalysisDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Button
                                onClick={() => {
                                    void handleAnalyzeVerbs();
                                }}
                                disabled={
                                    isAnalyzing || (noExperience ? projects.length === 0 : experience.length === 0)
                                }
                                className="w-full gap-1.5"
                                size="sm"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                        {t("analyzingVerbs")}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-4" />
                                        {t("analyzeVerbsBtn")}
                                    </>
                                )}
                            </Button>

                            {verbAnalysis && (
                                <div className="space-y-4 pt-2 animate-fade-in text-xs border-t border-primary/10">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-foreground">Action/Impact Score:</span>
                                        <span
                                            className={`text-lg font-bold ${getScoreColor(verbAnalysis.impactScore)}`}
                                        >
                                            {verbAnalysis.impactScore}%
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-center">
                                        <div className="p-2 rounded bg-background border border-border">
                                            <p className="text-muted-foreground">Verbos Pasivos</p>
                                            <p className="text-base font-bold text-warning">
                                                {verbAnalysis.passiveVerbsCount}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded bg-background border border-border">
                                            <p className="text-muted-foreground">Verbos Activos</p>
                                            <p className="text-base font-bold text-emerald">
                                                {verbAnalysis.activeVerbsCount}
                                            </p>
                                        </div>
                                    </div>

                                    {verbAnalysis.passiveVerbsFound.length > 0 && (
                                        <div>
                                            <p className="font-semibold text-foreground mb-1">
                                                Verbos pasivos a evitar:
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {verbAnalysis.passiveVerbsFound.map((v) => (
                                                    <Badge
                                                        key={v}
                                                        className="bg-destructive/10 text-destructive border-none text-[10px]"
                                                    >
                                                        {v}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {verbAnalysis.suggestions.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="font-semibold text-foreground">
                                                Sugerencias Antes / Después:
                                            </p>
                                            <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin pr-1">
                                                {verbAnalysis.suggestions.map((s, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-2.5 rounded-lg border border-border/60 bg-background/50 space-y-1"
                                                    >
                                                        <p className="text-destructive line-through leading-relaxed">
                                                            &ldquo;{s.original}&rdquo;
                                                        </p>
                                                        <p className="text-emerald font-medium leading-relaxed">
                                                            &ldquo;{s.suggestion}&rdquo;
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                                            Razón: {s.reason}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {verbAnalysis.recommendations.length > 0 && (
                                        <div className="rounded-lg border border-primary/10 bg-primary/0 p-2.5 space-y-1">
                                            <p className="font-semibold text-primary">Consejos de Optimización:</p>
                                            <ul className="list-disc list-inside text-muted-foreground space-y-0.5 leading-relaxed pl-1">
                                                {verbAnalysis.recommendations.map((r, index) => (
                                                    <li key={index}>{r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: A4 Page live preview */}
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
                                                <span
                                                    key={skill}
                                                    className="text-[11px] text-slate-700 font-sans font-medium"
                                                >
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
                                                <div
                                                    key={l.id}
                                                    className="text-[11px] text-slate-700 font-sans font-medium"
                                                >
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
            </div>
        </div>
    );
}
