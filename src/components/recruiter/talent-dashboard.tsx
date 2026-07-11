/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import type { TalentCard } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
    Search,
    Users,
    Award,
    TrendingUp,
    Clock,
    Sparkles,
    Send,
    Mail,
    X,
    ShieldAlert,
    HelpCircle,
    Star,
    BarChart3,
    Eye,
} from "lucide-react";
import {
    rankTalentPoolAction,
    createContactRequestAction,
    toggleShortlistAction,
    searchTalentPoolAIAction,
    getMarketIntelligenceDataAction,
} from "@/features/recruiter/actions";
import { toast } from "sonner";
import { CandidateDetailModal } from "./candidate-detail-modal";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";

interface TalentDashboardProps {
    talents?: TalentCard[];
}

const seniorityColors: Record<string, string> = {
    junior: "bg-indigo/10 text-indigo border-indigo/20",
    mid: "bg-primary/10 text-primary border-primary/20",
    senior: "bg-emerald/10 text-emerald border-emerald/20",
    lead: "bg-warning/10 text-warning border-warning/20",
};

export function getSeniorityColor(level: string) {
    const normalized = String(level).toLowerCase();
    switch (normalized) {
        case "junior":
            return seniorityColors.junior;
        case "mid":
            return seniorityColors.mid;
        case "senior":
            return seniorityColors.senior;
        case "lead":
            return seniorityColors.lead;
        default:
            return "bg-secondary text-secondary-foreground border-border";
    }
}

const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald";
    if (score >= 75) return "text-primary";
    if (score >= 60) return "text-warning";
    return "text-muted-foreground";
};

const formatLastActive = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

export function TalentDashboard({ talents: initialTalents = [] }: TalentDashboardProps) {
    const [talents, setTalents] = useState<TalentCard[]>(initialTalents);
    const [searchQuery, setSearchQuery] = useState("");
    const [jdText, setJdText] = useState("");
    const [isMatching, setIsMatching] = useState(false);
    const [isJdApplied, setIsJdApplied] = useState(false);

    const [aiSourcingMode, setAiSourcingMode] = useState<"matching" | "semantic">("matching");
    const [aiQuery, setAiQuery] = useState("");
    const [isSourcingAI, setIsSourcingAI] = useState(false);
    const [isSourcingAIApplied, setIsSourcingAIApplied] = useState(false);

    const handleAISourcingSearch = async () => {
        if (!aiQuery.trim()) {
            toast.error("Por favor, ingresa una consulta para la IA.");
            return;
        }

        setIsSourcingAI(true);
        try {
            const result = await searchTalentPoolAIAction(aiQuery);
            if (!result.success) {
                toast.error(result.error || "Error al realizar la búsqueda semántica.");
            } else {
                const mappedRanked = result.data.map((item) => {
                    const original = talents.find((t) => t.id === item.id);
                    return {
                        ...original,
                        ...item,
                        estimatedSeniority: item.seniority,
                        averageScore: item.matchScore,
                        lastActive: original?.lastActive || new Date(),
                        topSkills: item.skills.length > 0 ? item.skills : original?.topSkills || [],
                        languages: original?.languages || [],
                    } as TalentCard;
                });
                setTalents(mappedRanked);
                setIsSourcingAIApplied(true);
                toast.success("¡Resultados ordenados y filtrados por la IA con éxito!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al conectar con el servidor.");
        } finally {
            setIsSourcingAI(false);
        }
    };

    const handleClearAISourcing = () => {
        setAiQuery("");
        setTalents(initialTalents);
        setIsSourcingAIApplied(false);
        toast.info("Búsqueda restaurada al listado general del Talent Pool.");
    };

    const [activeTab, setActiveTab] = useState<"pool" | "shortlist" | "market">("pool");
    const [marketData, setMarketData] = useState<{
        skillsData: Array<{ name: string; supply: number; demand: number }>;
        seniorityData: Array<{ name: string; value: number }>;
        salaryData: Array<{ name: string; min: number; max: number; avg: number }>;
    } | null>(null);
    const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);

    useEffect(() => {
        if (activeTab === "market" && !marketData) {
            const fetchMarketData = async () => {
                setIsLoadingMarketData(true);
                try {
                    const result = await getMarketIntelligenceDataAction();
                    if (result.success && result.data) {
                        setMarketData(result.data);
                    } else {
                        toast.error(result.error || "No se pudieron obtener las estadísticas de Market Intelligence.");
                    }
                } catch (e) {
                    console.error(e);
                    toast.error("Error al conectar con el servidor.");
                } finally {
                    setIsLoadingMarketData(false);
                }
            };
            void fetchMarketData();
        }
    }, [activeTab, marketData]);

    const handleToggleShortlist = async (developerId: string) => {
        try {
            const result = await toggleShortlistAction(developerId);
            if (!result.success) {
                toast.error(result.error || "No se pudo actualizar favoritos.");
            } else {
                const added = result.data;
                toast.success(added ? "Candidato guardado en tu Shortlist." : "Candidato removido de tu Shortlist.");
                setTalents((prev) => prev.map((t) => (t.id === developerId ? { ...t, isShortlisted: added } : t)));
            }
        } catch (e) {
            console.error(e);
            toast.error("Error al procesar favoritos.");
        }
    };

    // Estado para enviar contacto
    const [selectedTalent, setSelectedTalent] = useState<TalentCard | null>(null);
    const [pitchMessage, setPitchMessage] = useState(
        "Hola, he revisado tu perfil en SkillRadar y me gustaría conversar sobre una oportunidad técnica que se alinea muy bien con tus habilidades.",
    );
    const [isSendingPitch, setIsSendingPitch] = useState(false);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

    // Estado para modal de detalle de candidato (IA Copilot & Observaciones)
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailCandidate, setDetailCandidate] = useState<TalentCard | null>(null);

    // Buscar perfiles de forma tradicional (texto libre)
    const filteredTalents = talents.filter((talent) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            talent.topSkills.some((skill) => skill.toLowerCase().includes(query)) ||
            talent.estimatedSeniority.toLowerCase().includes(query) ||
            talent.anonymousId.toLowerCase().includes(query) ||
            (talent.name && talent.name.toLowerCase().includes(query))
        );
    });

    const displayedTalents = filteredTalents.filter((talent) => {
        if (activeTab === "shortlist") {
            return talent.isShortlisted === true;
        }
        return true;
    });

    // Ejecutar Reverse Matching
    const handleReverseMatching = async () => {
        if (!jdText.trim()) {
            toast.error("Por favor, ingresa una Job Description para evaluar.");
            return;
        }

        setIsMatching(true);
        try {
            const result = await rankTalentPoolAction(jdText);
            if (!result.success) {
                toast.error(result.error || "Error al realizar el matching con la IA.");
            } else {
                // Mapear los resultados rankedCandidates devueltos
                const mappedRanked = result.data.map((item) => {
                    const original = talents.find((t) => t.id === item.id);
                    return {
                        ...original,
                        ...item,
                        // Mantener campos necesarios
                        lastActive: original?.lastActive || new Date(),
                        topSkills: item.skills.length > 0 ? item.skills : original?.topSkills || [],
                        languages: original?.languages || [],
                    } as TalentCard;
                });

                setTalents(mappedRanked);
                setIsJdApplied(true);
                toast.success("¡Talent Pool ordenado por afinidad de IA con éxito!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error inesperado al procesar.");
        } finally {
            setIsMatching(false);
        }
    };

    // Limpiar Job Match y volver a la lista original
    const handleClearJd = () => {
        setJdText("");
        setTalents(initialTalents);
        setIsJdApplied(false);
        toast.info("Vista restaurada al listado general del Talent Pool.");
    };

    // Enviar Pitch de Contacto (12.1)
    const handleSendPitch = async () => {
        if (!selectedTalent) return;
        if (!pitchMessage.trim()) {
            toast.error("El mensaje de contacto no puede estar vacío.");
            return;
        }

        setIsSendingPitch(true);
        try {
            const result = await createContactRequestAction(selectedTalent.id, pitchMessage);
            if (!result.success) {
                toast.error(result.error || "No se pudo enviar la solicitud de contacto.");
            } else {
                toast.success(`Propuesta enviada con éxito a ${selectedTalent.anonymousId}`);

                // Actualizar localmente el estado del contacto en la lista
                setTalents((prev) =>
                    prev.map((t) =>
                        t.id === selectedTalent.id
                            ? {
                                  ...t,
                                  contactStatus: "pending",
                                  requestId: result.data.id,
                              }
                            : t,
                    ),
                );
                setIsContactDialogOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar la propuesta de contacto.");
        } finally {
            setIsSendingPitch(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Talent Pool</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Browse developer profiles. Access to personal details is private until accepted.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                        <Users className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{talents.length}</p>
                        <p className="text-xs text-muted-foreground">Desarrolladores Activos</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border gap-2">
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab("pool")}
                    className={cn(
                        "rounded-none border-b-2 px-4 py-2 text-sm font-medium hover:bg-transparent shadow-none border-b-primary text-primary",
                        activeTab === "pool"
                            ? "border-b-primary text-primary"
                            : "border-b-transparent text-muted-foreground hover:text-foreground",
                    )}
                >
                    <Users className="mr-2 size-4" />
                    Talent Pool
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab("shortlist")}
                    className={cn(
                        "rounded-none border-b-2 px-4 py-2 text-sm font-medium hover:bg-transparent shadow-none border-b-primary text-primary",
                        activeTab === "shortlist"
                            ? "border-b-primary text-primary"
                            : "border-b-transparent text-muted-foreground hover:text-foreground",
                    )}
                >
                    <Star className="mr-2 size-4" />
                    Mis Candidatos Guardados
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab("market")}
                    className={cn(
                        "rounded-none border-b-2 px-4 py-2 text-sm font-medium hover:bg-transparent shadow-none border-b-primary text-primary",
                        activeTab === "market"
                            ? "border-b-primary text-primary"
                            : "border-b-transparent text-muted-foreground hover:text-foreground",
                    )}
                >
                    <BarChart3 className="mr-2 size-4" />
                    Market Intelligence
                </Button>
            </div>

            {activeTab !== "market" && (
                <>
                    {/* AI Sourcing Suite */}
                    <Card className="border-primary/20 bg-primary/5 dark:bg-primary/5 backdrop-blur-xs shadow-xs">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                                        <Sparkles className="size-5 text-primary animate-pulse" />
                                        AI Sourcing & Search Suite
                                    </CardTitle>
                                    <CardDescription>
                                        Usa la Inteligencia Artificial para buscar perfiles, filtrar habilidades y
                                        rankear el Talent Pool.
                                    </CardDescription>
                                </div>
                                <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border shrink-0 self-start sm:self-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setAiSourcingMode("matching")}
                                        className={cn(
                                            "text-xs px-3 py-1.5 h-auto rounded-md shadow-none",
                                            aiSourcingMode === "matching"
                                                ? "bg-background text-foreground font-semibold"
                                                : "text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        Reverse Job-Matching
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setAiSourcingMode("semantic")}
                                        className={cn(
                                            "text-xs px-3 py-1.5 h-auto rounded-md shadow-none",
                                            aiSourcingMode === "semantic"
                                                ? "bg-background text-foreground font-semibold"
                                                : "text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        Buscador Semántico IA
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {aiSourcingMode === "matching" ? (
                                <>
                                    <Textarea
                                        placeholder="Pega la Job Description (Descripción del Cargo) aquí..."
                                        value={jdText}
                                        onChange={(e) => setJdText(e.target.value)}
                                        className="min-h-[100px] bg-background border-border text-xs"
                                        disabled={isMatching}
                                    />
                                    <div className="flex gap-2 justify-end">
                                        {isJdApplied && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleClearJd}
                                                className="gap-1.5 text-xs"
                                                disabled={isMatching}
                                            >
                                                <X className="size-4" />
                                                Limpiar Filtro AI
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => {
                                                void handleReverseMatching();
                                            }}
                                            disabled={isMatching || !jdText.trim()}
                                            size="sm"
                                            className="gap-1.5 text-xs font-medium"
                                        >
                                            {isMatching ? (
                                                <>
                                                    <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                                    Rankeando candidatos...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="size-4" />
                                                    Analizar y Ordenar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Input
                                        placeholder='Ej: "Búscame desarrolladores senior de React y Node que residan en España, con un ATS Score superior a 80 y experiencia en testing"'
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        className="bg-background border-border text-xs py-5"
                                        disabled={isSourcingAI}
                                    />
                                    <div className="flex gap-2 justify-end">
                                        {isSourcingAIApplied && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleClearAISourcing}
                                                className="gap-1.5 text-xs"
                                                disabled={isSourcingAI}
                                            >
                                                <X className="size-4" />
                                                Limpiar Búsqueda IA
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => {
                                                void handleAISourcingSearch();
                                            }}
                                            disabled={isSourcingAI || !aiQuery.trim()}
                                            size="sm"
                                            className="gap-1.5 text-xs font-medium"
                                        >
                                            {isSourcingAI ? (
                                                <>
                                                    <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                                    Buscando con IA...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="size-4" />
                                                    Buscar con IA
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Search bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by skill, name or anonymous ID (e.g., React, DEV-9B1C)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-card border-border"
                        />
                    </div>
                </>
            )}

            {/* Talent Grid */}
            {activeTab !== "market" &&
                (displayedTalents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16 bg-card/30">
                        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                            <Search className="size-7 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-foreground">
                                {activeTab === "shortlist" ? "No tienes candidatos guardados" : "No matches found"}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {activeTab === "shortlist"
                                    ? "Marca candidatos con la estrella para guardarlos en esta sección."
                                    : "Try a different search term or clear the AI match filter."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {displayedTalents.map((talent) => {
                            const isAccepted = talent.contactStatus === "accepted";
                            const isPending = talent.contactStatus === "pending";

                            return (
                                <Card
                                    key={talent.id}
                                    className={cn(
                                        "group border-border/50 bg-card/50 backdrop-blur-xs transition-all flex flex-col justify-between",
                                        isJdApplied
                                            ? "hover:border-primary/40 hover:bg-card/80 border-primary/20 bg-primary/0"
                                            : "hover:border-indigo/40 hover:bg-card/80",
                                    )}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {isAccepted && talent.image ? (
                                                    <img
                                                        src={talent.image}
                                                        alt={talent.name || "Developer"}
                                                        className="size-10 rounded-full border border-border object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <div className="flex size-10 items-center justify-center rounded-full bg-indigo/10 border border-indigo/20 text-indigo font-bold text-xs shrink-0">
                                                        🔒
                                                    </div>
                                                )}
                                                <div>
                                                    <CardTitle className="font-mono text-sm text-muted-foreground flex items-center gap-1.5">
                                                        {talent.anonymousId}
                                                        {isAccepted && (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-emerald/10 text-emerald border-emerald/20 text-[10px] px-1 py-0 capitalize"
                                                            >
                                                                Aceptado
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                    <h3 className="text-sm font-semibold text-foreground mt-0.5">
                                                        {isAccepted ? talent.name : "Perfil Doble Ciego"}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="text-right flex items-start gap-2">
                                                <div>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <TrendingUp className="size-4 text-muted-foreground" />
                                                        <span
                                                            className={cn(
                                                                "text-xl font-bold",
                                                                getScoreColor(talent.averageScore),
                                                            )}
                                                        >
                                                            {talent.averageScore}%
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">Match Score</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-warning hover:bg-transparent shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        void handleToggleShortlist(talent.id);
                                                    }}
                                                >
                                                    <Star
                                                        className={cn(
                                                            "size-4",
                                                            talent.isShortlisted
                                                                ? "fill-warning text-warning"
                                                                : "text-muted-foreground",
                                                        )}
                                                    />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 mt-2 flex-wrap">
                                            <Badge
                                                className={cn(
                                                    "capitalize text-[10px] font-medium px-2 py-0.5",
                                                    getSeniorityColor(talent.estimatedSeniority),
                                                )}
                                                variant="outline"
                                            >
                                                <Award className="mr-1 size-3" />
                                                {talent.estimatedSeniority}
                                            </Badge>
                                            {isPending && (
                                                <Badge
                                                    className="bg-amber/10 text-amber border-amber/20 text-[10px] px-2 py-0.5"
                                                    variant="outline"
                                                >
                                                    Pendiente
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4 flex-1 justify-between">
                                        <div className="space-y-3">
                                            {/* Justification from AI Reverse Match (11.3 / 11.1) */}
                                            {talent.justification && (
                                                <div className="rounded-md bg-primary/5 border border-primary/10 p-2.5 text-xs text-foreground/90">
                                                    <p className="font-semibold text-primary mb-1 flex items-center gap-1">
                                                        <HelpCircle className="size-3.5" />
                                                        Razonamiento IA:
                                                    </p>
                                                    <p className="leading-relaxed font-sans">{talent.justification}</p>
                                                </div>
                                            )}

                                            {/* Habilidades */}
                                            <div>
                                                <p className="mb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Top Skills
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {talent.topSkills.map((skill) => (
                                                        <Badge
                                                            key={skill}
                                                            variant="secondary"
                                                            className="text-[10px] bg-secondary/80 text-secondary-foreground"
                                                        >
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Contact information if accepted */}
                                            {isAccepted && (
                                                <div className="rounded-md bg-muted/30 border border-border/50 p-2.5 text-xs space-y-1.5">
                                                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                                                        <Mail className="size-3.5 text-primary" />
                                                        Datos de Contacto:
                                                    </p>
                                                    <p className="text-muted-foreground select-all">{talent.email}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock className="size-3" />
                                                <span>Actualizado {formatLastActive(talent.lastActive)}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 gap-1 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                                                    onClick={() => {
                                                        setDetailCandidate(talent);
                                                        setIsDetailOpen(true);
                                                    }}
                                                >
                                                    <Eye className="size-3.5" />
                                                    Análisis
                                                </Button>

                                                {isAccepted ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-xs border-emerald/30 text-emerald hover:bg-emerald/10"
                                                        onClick={() => {
                                                            window.location.href = `mailto:${talent.email}`;
                                                        }}
                                                    >
                                                        <Mail className="size-3.5" />
                                                        Enviar Mail
                                                    </Button>
                                                ) : isPending ? (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        disabled
                                                        className="h-8 gap-1.5 text-xs opacity-70"
                                                    >
                                                        Propuesta Enviada
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-xs hover:border-primary/50 hover:text-primary transition-colors"
                                                        onClick={() => {
                                                            setSelectedTalent(talent);
                                                            setIsContactDialogOpen(true);
                                                        }}
                                                    >
                                                        Solicitar Contacto
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ))}

            {/* Market Intelligence View */}
            {activeTab === "market" && (
                <div className="space-y-6 animate-fade-in">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                                <BarChart3 className="size-5 text-primary" />
                                Market Intelligence Dashboard
                            </CardTitle>
                            <CardDescription>
                                Analíticas dinámicas en tiempo real de oferta y demanda de habilidades, distribución de
                                seniority y estimaciones salariales basadas en datos de la plataforma.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingMarketData ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2">
                                    <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                    <p className="text-sm text-muted-foreground">
                                        Procesando estadísticas de base de datos...
                                    </p>
                                </div>
                            ) : !marketData ? (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    No hay currículums analizados en el Talent Pool para compilar estadísticas de
                                    mercado.
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Oferta vs Demanda de Stack Técnico */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                                            <TrendingUp className="size-4 text-primary" />
                                            Oferta vs Demanda de Stack Técnico (Top 10 Habilidades)
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Comparativa entre la cantidad de desarrolladores que dominan una habilidad
                                            (Oferta) y la cantidad de vacantes que la solicitan (Demanda).
                                        </p>
                                        <div className="h-[300px] w-full pt-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={marketData.skillsData}
                                                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        className="stroke-border/20"
                                                        vertical={false}
                                                    />
                                                    <XAxis
                                                        dataKey="name"
                                                        stroke="var(--muted-foreground)"
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <YAxis
                                                        stroke="var(--muted-foreground)"
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: "var(--popover)",
                                                            borderColor: "var(--border)",
                                                            borderRadius: "var(--radius)",
                                                            color: "var(--popover-foreground)",
                                                            fontSize: "12px",
                                                        }}
                                                    />
                                                    <Legend
                                                        verticalAlign="top"
                                                        height={36}
                                                        wrapperStyle={{ fontSize: "11px" }}
                                                    />
                                                    <Bar
                                                        dataKey="supply"
                                                        name="Oferta (Talent Pool)"
                                                        fill="var(--primary)"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                    <Bar
                                                        dataKey="demand"
                                                        name="Demanda (Ofertas de Trabajo)"
                                                        fill="#10b981"
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Distribución de Seniority y Salarios */}
                                    <div className="grid gap-6 md:grid-cols-2 border-t border-border pt-6">
                                        {/* Distribución de Seniority */}
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                                                <Users className="size-4 text-primary" />
                                                Distribución de Seniority en el Talent Pool
                                            </h3>
                                            <p className="text-xs text-muted-foreground mb-4">
                                                Proporción de candidatos activos clasificados por nivel de experiencia
                                                estimado.
                                            </p>
                                            <div className="h-[250px] w-full flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={marketData.seniorityData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            label={({ name, percent }) =>
                                                                `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : "0"}%`
                                                            }
                                                        >
                                                            {marketData.seniorityData.map((entry, index) => {
                                                                const COLORS = [
                                                                    "#6366f1",
                                                                    "#3b82f6",
                                                                    "#10b981",
                                                                    "#f59e0b",
                                                                ];
                                                                return (
                                                                    <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={COLORS[index % COLORS.length]}
                                                                    />
                                                                );
                                                            })}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: "var(--popover)",
                                                                borderColor: "var(--border)",
                                                                borderRadius: "var(--radius)",
                                                                color: "var(--popover-foreground)",
                                                                fontSize: "12px",
                                                            }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Salarios Estimados */}
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                                                <TrendingUp className="size-4 text-emerald-500" />
                                                Rangos Salariales Estimados (Mercado Anual EUR)
                                            </h3>
                                            <p className="text-xs text-muted-foreground mb-4">
                                                Curva salarial de referencia basada en la compensación promedio
                                                observada en ofertas de trabajo publicadas.
                                            </p>
                                            <div className="h-[250px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart
                                                        data={marketData.salaryData}
                                                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                                    >
                                                        <defs>
                                                            <linearGradient
                                                                id="salaryGradient"
                                                                x1="0"
                                                                y1="0"
                                                                x2="0"
                                                                y2="1"
                                                            >
                                                                <stop
                                                                    offset="5%"
                                                                    stopColor="#10b981"
                                                                    stopOpacity={0.3}
                                                                />
                                                                <stop
                                                                    offset="95%"
                                                                    stopColor="#10b981"
                                                                    stopOpacity={0}
                                                                />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            className="stroke-border/20"
                                                            vertical={false}
                                                        />
                                                        <XAxis
                                                            dataKey="name"
                                                            stroke="var(--muted-foreground)"
                                                            fontSize={11}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <YAxis
                                                            stroke="var(--muted-foreground)"
                                                            fontSize={11}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tickFormatter={(v) => `${v / 1000}k`}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: "var(--popover)",
                                                                borderColor: "var(--border)",
                                                                borderRadius: "var(--radius)",
                                                                color: "var(--popover-foreground)",
                                                                fontSize: "12px",
                                                            }}
                                                            formatter={(value) => [
                                                                `€${Number(value).toLocaleString()}`,
                                                                "",
                                                            ]}
                                                        />
                                                        <Legend
                                                            verticalAlign="top"
                                                            height={36}
                                                            wrapperStyle={{ fontSize: "11px" }}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="avg"
                                                            name="Salario Promedio"
                                                            stroke="#10b981"
                                                            fillOpacity={1}
                                                            fill="url(#salaryGradient)"
                                                            strokeWidth={2.5}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="min"
                                                            name="Mínimo Estimado"
                                                            stroke="#3b82f6"
                                                            fill="none"
                                                            strokeWidth={1.5}
                                                            strokeDasharray="3 3"
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="max"
                                                            name="Máximo Estimado"
                                                            stroke="#f59e0b"
                                                            fill="none"
                                                            strokeWidth={1.5}
                                                            strokeDasharray="3 3"
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Dialog para redactar y enviar Propuesta de Contacto (Doble Ciego 12.1) */}
            <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogContent className="sm:max-w-md bg-card border border-border/80">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="size-5 text-primary" />
                            Solicitar Contacto ({selectedTalent?.anonymousId})
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Escribe una propuesta o &ldquo;pitch&rdquo; de reclutamiento. El desarrollador mantendrá su
                            identidad anónima hasta que acepte tu invitación.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex gap-2 items-start rounded-md bg-amber/5 border border-amber/20 p-3 text-xs text-amber-600 dark:text-amber-400">
                            <ShieldAlert className="size-5 shrink-0" />
                            <p className="leading-5">
                                **Gobernanza de Privacidad:** Cumplimos estrictamente las directrices de Doble Ciego.
                                Los datos personales del candidato se ocultarán hasta que éste decida aprobar la
                                solicitud.
                            </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">
                                Mensaje / Pitch de Propuesta
                            </label>
                            <Textarea
                                placeholder="Escribe tu propuesta..."
                                value={pitchMessage}
                                onChange={(e) => setPitchMessage(e.target.value)}
                                className="min-h-[120px] bg-background border-border"
                                disabled={isSendingPitch}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                void handleSendPitch();
                            }}
                            disabled={isSendingPitch || !pitchMessage.trim()}
                            className="w-full gap-1.5"
                        >
                            {isSendingPitch ? (
                                <>
                                    <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    Enviando propuesta...
                                </>
                            ) : (
                                <>
                                    <Send className="size-4" />
                                    Enviar Propuesta Anónima
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CandidateDetailModal
                isOpen={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                candidate={detailCandidate}
                jobDescription={jdText}
            />
        </div>
    );
}
