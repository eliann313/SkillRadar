"use client";
import { logger } from "@/infrastructure/logger";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import type { TalentCard } from "@/shared-kernel/types";
import { cn } from "@/shared-kernel/utils";
import dynamic from "next/dynamic";
import { TalentCardView } from "./talent-card";
import type { MarketData } from "./talent-market.tab";
import { TalentSourcingPanel } from "./talent-sourcing.panel";
import { TalentFiltersToolbar } from "./talent-filters.toolbar";

// recharts solo se usa en el tab Market: chunk separado que carga al abrir el tab.
const TalentMarketTab = dynamic(() => import("./talent-market.tab").then((m) => m.TalentMarketTab), {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-xl border border-border bg-card/30" />,
});
import { Search, Users, Send, ShieldAlert, Star, BarChart3 } from "lucide-react";
import {
    rankTalentPoolAction,
    createContactRequestAction,
    toggleShortlistAction,
    searchTalentPoolAIAction,
    getMarketIntelligenceDataAction,
} from "@/features/recruiter/application/recruiter.use-cases";
import { toast } from "sonner";
import { CandidateDetailModal } from "@/features/recruiter/presentation/candidate-detail-modal";
import { CandidateCompare } from "@/features/recruiter/presentation/candidate-compare";
import {
    listSavedSearchesAction,
    saveSearchAction,
    deleteSavedSearchAction,
    type SavedSearchDTO,
} from "@/features/saved-searches/application/saved-searches.use-cases";

interface TalentDashboardProps {
    talents?: TalentCard[];
}

export function TalentDashboard({ talents: initialTalents = [] }: TalentDashboardProps) {
    const [talents, setTalents] = useState<TalentCard[]>(initialTalents);
    const [searchQuery, setSearchQuery] = useState("");
    const [seniorityFilter, setSeniorityFilter] = useState<string[]>([]);
    const [minScore, setMinScore] = useState(0);
    const [onlyShortlisted, setOnlyShortlisted] = useState(false);
    const [sortBy, setSortBy] = useState<"score" | "recent">("score");
    const [compareIds, setCompareIds] = useState<string[]>([]);
    const [isCompareOpen, setIsCompareOpen] = useState(false);
    const [savedSearches, setSavedSearches] = useState<SavedSearchDTO[]>([]);
    const [savedName, setSavedName] = useState("");

    useEffect(() => {
        listSavedSearchesAction("talent_pool")
            .then((res) => {
                if (res.success) setSavedSearches(res.data);
            })
            .catch(() => undefined);
    }, []);

    const applySaved = (s: SavedSearchDTO) => {
        const f = s.filters;
        if (typeof f.searchQuery === "string") setSearchQuery(f.searchQuery);
        if (Array.isArray(f.seniorityFilter))
            setSeniorityFilter(f.seniorityFilter.filter((x): x is string => typeof x === "string"));
        if (typeof f.minScore === "number") setMinScore(f.minScore);
        if (typeof f.onlyShortlisted === "boolean") setOnlyShortlisted(f.onlyShortlisted);
        if (f.sortBy === "score" || f.sortBy === "recent") setSortBy(f.sortBy);
        toast.success(`Búsqueda "${s.name}" aplicada.`);
    };

    const handleSaveSearch = async () => {
        if (savedName.trim().length < 2) {
            toast.error("Ponle un nombre a la búsqueda.");
            return;
        }
        const res = await saveSearchAction({
            name: savedName.trim(),
            scope: "talent_pool",
            filters: { searchQuery, seniorityFilter, minScore, onlyShortlisted, sortBy },
        });
        if (res.success) {
            setSavedSearches((prev) => [res.data, ...prev]);
            setSavedName("");
            toast.success("Búsqueda guardada.");
        } else toast.error(res.error);
    };
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
                        estimatedSeniority: original?.estimatedSeniority || item.seniority,
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
            logger.error(error);
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
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);

    useEffect(() => {
        if (activeTab === "market" && !marketData) {
            let cancelled = false;
            const fetchMarketData = async () => {
                setIsLoadingMarketData(true);
                try {
                    const result = await getMarketIntelligenceDataAction();
                    if (cancelled) return;
                    if (result.success && result.data) {
                        setMarketData(result.data);
                    } else {
                        toast.error(result.error || "No se pudieron obtener las estadísticas de Market Intelligence.");
                    }
                } catch (e) {
                    if (!cancelled) {
                        logger.error(e);
                        toast.error("Error al conectar con el servidor.");
                    }
                } finally {
                    if (!cancelled) {
                        setIsLoadingMarketData(false);
                    }
                }
            };
            void fetchMarketData();
            return () => {
                cancelled = true;
            };
        }
        return undefined;
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
            logger.error(e);
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

    // Buscar perfiles de forma tradicional (texto libre) + filtros client-side (cero costo IA)
    const filteredTalents = talents
        .filter((talent) => {
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matches =
                    talent.topSkills.some((skill) => skill.toLowerCase().includes(query)) ||
                    talent.estimatedSeniority.toLowerCase().includes(query) ||
                    talent.anonymousId.toLowerCase().includes(query) ||
                    (talent.name && talent.name.toLowerCase().includes(query));
                if (!matches) return false;
            }
            if (seniorityFilter.length > 0 && !seniorityFilter.includes(talent.estimatedSeniority.toLowerCase()))
                return false;
            if ((talent.averageScore ?? 0) < minScore) return false;
            if (onlyShortlisted && talent.isShortlisted !== true) return false;
            return true;
        })
        .sort((a, b) =>
            sortBy === "score"
                ? (b.averageScore ?? 0) - (a.averageScore ?? 0)
                : new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime(),
        );

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
            logger.error(error);
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
            logger.error(error);
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

            {activeTab === "pool" && (
                <TalentSourcingPanel
                    mode={aiSourcingMode}
                    onModeChange={setAiSourcingMode}
                    jdText={jdText}
                    onJdText={setJdText}
                    isMatching={isMatching}
                    isJdApplied={isJdApplied}
                    onReverseMatching={() => void handleReverseMatching()}
                    onClearJd={handleClearJd}
                    aiQuery={aiQuery}
                    onAiQuery={setAiQuery}
                    isSourcingAI={isSourcingAI}
                    isSourcingAIApplied={isSourcingAIApplied}
                    onAiSearch={() => void handleAISourcingSearch()}
                    onClearAi={handleClearAISourcing}
                />
            )}

            {activeTab !== "market" && (
                <TalentFiltersToolbar
                    searchQuery={searchQuery}
                    onSearchQuery={setSearchQuery}
                    seniorityFilter={seniorityFilter}
                    onToggleSeniority={(level, checked) =>
                        setSeniorityFilter((prev) => (checked ? [...prev, level] : prev.filter((l) => l !== level)))
                    }
                    minScore={minScore}
                    onMinScore={setMinScore}
                    onlyShortlisted={onlyShortlisted}
                    onOnlyShortlisted={setOnlyShortlisted}
                    sortBy={sortBy}
                    onSortBy={setSortBy}
                    onClearFilters={() => {
                        setSearchQuery("");
                        setSeniorityFilter([]);
                        setMinScore(0);
                        setOnlyShortlisted(false);
                    }}
                    savedName={savedName}
                    onSavedName={setSavedName}
                    savedSearches={savedSearches}
                    onSaveSearch={() => void handleSaveSearch()}
                    onApplySaved={applySaved}
                    onDeleteSaved={(id) =>
                        void deleteSavedSearchAction(id).then((res) => {
                            if (res.success) setSavedSearches((prev) => prev.filter((x) => x.id !== id));
                        })
                    }
                />
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
                        {displayedTalents.map((talent) => (
                            <TalentCardView
                                key={talent.id}
                                talent={talent}
                                highlighted={isJdApplied}
                                compared={compareIds.includes(talent.id)}
                                onToggleCompare={(id, checked) =>
                                    setCompareIds((prev) =>
                                        checked ? [...prev, id].slice(0, 4) : prev.filter((x) => x !== id),
                                    )
                                }
                                onToggleShortlist={(id) => void handleToggleShortlist(id)}
                                onOpenDetail={(t) => {
                                    setDetailCandidate(t);
                                    setIsDetailOpen(true);
                                }}
                                onContact={(t) => {
                                    setSelectedTalent(t);
                                    setIsContactDialogOpen(true);
                                }}
                            />
                        ))}
                    </div>
                ))}

            {/* Market Intelligence View */}
            {activeTab === "market" && <TalentMarketTab marketData={marketData} isLoading={isLoadingMarketData} />}

            {/* Dialog para redactar y enviar Propuesta de Contacto (Doble Ciego 12.1) */}
            <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogContent className="sm:max-w-md bg-card border border-border/80 max-h-[90vh] overflow-y-auto">
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

            {compareIds.length >= 2 ? (
                <button
                    onClick={() => setIsCompareOpen(true)}
                    className="fixed bottom-6 right-6 z-40 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
                >
                    Comparar ({compareIds.length})
                </button>
            ) : null}

            <CandidateCompare
                talents={talents.filter((t) => compareIds.includes(t.id))}
                open={isCompareOpen}
                onOpenChange={setIsCompareOpen}
            />
        </div>
    );
}
