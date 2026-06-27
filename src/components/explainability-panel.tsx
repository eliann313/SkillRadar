"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

interface ExplainabilityPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    score: number;
    justification?: string;
    evidenceFound?: string[];
    missingEvidence?: string[];
}

export function ExplainabilityPanel({
    isOpen,
    onOpenChange,
    title,
    score,
    justification = "No hay justificación disponible para esta puntuación.",
    evidenceFound = [],
    missingEvidence = [],
}: ExplainabilityPanelProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md md:max-w-lg bg-card border border-border/80">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shrink-0">
                            <span className="text-xl font-bold text-primary">{score}</span>
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Desglose cualitativo del razonamiento de la IA
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                    {/* Justificación */}
                    <div className="rounded-lg bg-muted/30 border border-border/50 p-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <HelpCircle className="size-4 text-indigo" />
                            Explicación del Score
                        </h4>
                        <p className="text-sm text-foreground leading-relaxed">{justification}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Evidencia Encontrada */}
                        <div className="rounded-lg bg-emerald/5 border border-emerald/10 p-4">
                            <h4 className="text-xs font-semibold text-emerald uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <CheckCircle2 className="size-4 text-emerald" />
                                Evidencia Detectada ({evidenceFound.length})
                            </h4>
                            {evidenceFound.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">
                                    No se detectó evidencia explícita.
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {evidenceFound.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                                            <span className="mt-0.5 size-1.5 rounded-full bg-emerald shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Evidencia Faltante / Gaps */}
                        <div className="rounded-lg bg-warning/5 border border-warning/10 p-4">
                            <h4 className="text-xs font-semibold text-warning uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <AlertTriangle className="size-4 text-warning" />
                                Brechas / Evidencia Faltante ({missingEvidence.length})
                            </h4>
                            {missingEvidence.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">
                                    No se encontraron brechas importantes.
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {missingEvidence.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                                            <span className="mt-0.5 size-1.5 rounded-full bg-warning shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter showCloseButton />
            </DialogContent>
        </Dialog>
    );
}
