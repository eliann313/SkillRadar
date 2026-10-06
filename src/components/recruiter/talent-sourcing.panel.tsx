"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Sparkles, X } from "lucide-react";
import { cn } from "@/shared-kernel/utils";

export type AiSourcingMode = "matching" | "semantic";

interface TalentSourcingPanelProps {
    mode: AiSourcingMode;
    onModeChange: (mode: AiSourcingMode) => void;
    jdText: string;
    onJdText: (value: string) => void;
    isMatching: boolean;
    isJdApplied: boolean;
    onReverseMatching: () => void;
    onClearJd: () => void;
    aiQuery: string;
    onAiQuery: (value: string) => void;
    isSourcingAI: boolean;
    isSourcingAIApplied: boolean;
    onAiSearch: () => void;
    onClearAi: () => void;
}

/** Suite de sourcing IA + reverse matching (ex bloque del dashboard monolítico). */
export function TalentSourcingPanel({
    mode,
    onModeChange,
    jdText,
    onJdText,
    isMatching,
    isJdApplied,
    onReverseMatching,
    onClearJd,
    aiQuery,
    onAiQuery,
    isSourcingAI,
    isSourcingAIApplied,
    onAiSearch,
    onClearAi,
}: TalentSourcingPanelProps) {
    return (
        <Card className="border-primary/20 bg-primary/5 dark:bg-primary/5 backdrop-blur-xs shadow-xs">
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                            <Sparkles className="size-5 text-primary animate-pulse" />
                            AI Sourcing & Search Suite
                        </CardTitle>
                        <CardDescription>
                            Usa la Inteligencia Artificial para buscar perfiles, filtrar habilidades y rankear el Talent
                            Pool.
                        </CardDescription>
                    </div>
                    <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border shrink-0 self-start sm:self-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onModeChange("matching")}
                            className={cn(
                                "text-xs px-3 py-1.5 h-auto rounded-md shadow-none",
                                mode === "matching"
                                    ? "bg-background text-foreground font-semibold"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            Reverse Job-Matching
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onModeChange("semantic")}
                            className={cn(
                                "text-xs px-3 py-1.5 h-auto rounded-md shadow-none",
                                mode === "semantic"
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
                {mode === "matching" ? (
                    <>
                        <Textarea
                            placeholder="Pega la Job Description (Descripción del Cargo) aquí..."
                            value={jdText}
                            onChange={(e) => onJdText(e.target.value)}
                            className="min-h-[100px] bg-background border-border text-xs"
                            disabled={isMatching}
                        />
                        <div className="flex gap-2 justify-end">
                            {isJdApplied && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onClearJd}
                                    className="gap-1.5 text-xs"
                                    disabled={isMatching}
                                >
                                    <X className="size-4" />
                                    Limpiar Filtro AI
                                </Button>
                            )}
                            <Button
                                onClick={onReverseMatching}
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
                            onChange={(e) => onAiQuery(e.target.value)}
                            className="bg-background border-border text-xs py-5"
                            disabled={isSourcingAI}
                        />
                        <div className="flex gap-2 justify-end">
                            {isSourcingAIApplied && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onClearAi}
                                    className="gap-1.5 text-xs"
                                    disabled={isSourcingAI}
                                >
                                    <X className="size-4" />
                                    Limpiar Búsqueda IA
                                </Button>
                            )}
                            <Button
                                onClick={onAiSearch}
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
    );
}
