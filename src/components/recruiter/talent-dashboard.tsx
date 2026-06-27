"use client";

import { useState } from "react";
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
} from "lucide-react";
import { rankTalentPoolAction, createContactRequestAction } from "@/features/recruiter/actions";
import { toast } from "sonner";

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

    // Estado para enviar contacto
    const [selectedTalent, setSelectedTalent] = useState<TalentCard | null>(null);
    const [pitchMessage, setPitchMessage] = useState(
        "Hola, he revisado tu perfil en SkillRadar y me gustaría conversar sobre una oportunidad técnica que se alinea muy bien con tus habilidades.",
    );
    const [isSendingPitch, setIsSendingPitch] = useState(false);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

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

            {/* AI Reverse Matching Card (11.1) */}
            <Card className="border-primary/20 bg-primary/5 dark:bg-primary/5 backdrop-blur-xs glow-emerald">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                        <Sparkles className="size-5 text-primary" />
                        AI Reverse Job-Matching
                    </CardTitle>
                    <CardDescription>
                        Paste a Job Description. Gemini will analyze the active Talent Pool and rank developers by
                        affinity.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Textarea
                        placeholder="Paste Job Description here..."
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        className="min-h-[100px] bg-background border-border"
                        disabled={isMatching}
                    />
                    <div className="flex gap-2 justify-end">
                        {isJdApplied && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearJd}
                                className="gap-1.5"
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
                            className="gap-1.5"
                        >
                            {isMatching ? (
                                <>
                                    <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    Buscando y Rankeando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4" />
                                    Analizar y Ordenar Candidatos
                                </>
                            )}
                        </Button>
                    </div>
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

            {/* Talent Grid */}
            {filteredTalents.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16 bg-card/30">
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                        <Search className="size-7 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium text-foreground">No matches found</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Try a different search term or clear the AI match filter.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTalents.map((talent) => {
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

                                        <div className="text-right">
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
                                </CardContent>
                            </Card>
                        );
                    })}
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
        </div>
    );
}
