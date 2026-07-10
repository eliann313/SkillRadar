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
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ExplainabilityPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    score: number;
    justification?: string;
    evidenceFound?: string[];
    missingEvidence?: string[];
    // Multitab support fields (CV Analysis)
    technicalScore?: number;
    technicalExplanation?: string;
    credibilityScore?: number;
    credibilityExplanation?: string;
}

export function ExplainabilityPanel({
    isOpen,
    onOpenChange,
    title,
    score,
    justification,
    evidenceFound = [],
    missingEvidence = [],
    technicalScore,
    technicalExplanation,
    credibilityScore,
    credibilityExplanation,
}: ExplainabilityPanelProps) {
    const t = useTranslations("CVAnalysis");
    const [activeTab, setActiveTab] = React.useState<"ats" | "tech" | "credibility">("ats");

    const hasTabs = !!(technicalExplanation || credibilityExplanation);

    // Reset active tab to ats when dialog is opened
    React.useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab("ats");
        }
    }, [isOpen]);

    const currentScore =
        activeTab === "ats" ? score : activeTab === "tech" ? (technicalScore ?? score) : (credibilityScore ?? score);

    const currentTitle =
        activeTab === "ats"
            ? title
            : activeTab === "tech"
              ? t("techScoreExplainTitle", { default: "Explicabilidad del Tech Score" })
              : t("credibilityExplainTitle", { default: "Explicabilidad de Credibilidad" });

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md md:max-w-lg bg-card border border-border/80">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shrink-0">
                            <span className="text-xl font-bold text-primary">{currentScore}</span>
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground">{currentTitle}</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                {t("atsScoreExplainDesc", {
                                    default: "Desglose cualitativo del razonamiento de la IA",
                                })}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {hasTabs && (
                    <div className="flex border-b border-border/60 gap-1 px-1 mt-2">
                        <button
                            onClick={() => setActiveTab("ats")}
                            className={cn(
                                "flex-1 pb-2 text-xs font-bold transition-all border-b-2 text-center cursor-pointer",
                                activeTab === "ats"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {t("atsScore", { default: "Score ATS" })} ({score})
                        </button>
                        {technicalExplanation !== undefined && (
                            <button
                                onClick={() => setActiveTab("tech")}
                                className={cn(
                                    "flex-1 pb-2 text-xs font-bold transition-all border-b-2 text-center cursor-pointer",
                                    activeTab === "tech"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {t("techScore", { default: "Tech Score" })} ({technicalScore ?? 0})
                            </button>
                        )}
                        {credibilityExplanation !== undefined && (
                            <button
                                onClick={() => setActiveTab("credibility")}
                                className={cn(
                                    "flex-1 pb-2 text-xs font-bold transition-all border-b-2 text-center cursor-pointer",
                                    activeTab === "credibility"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {t("credibilityScore", { default: "Credibilidad" })} ({credibilityScore ?? 0})
                            </button>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                    {/* Justificación / Explicación del Score */}
                    {activeTab === "ats" && (
                        <>
                            <div className="rounded-lg bg-muted/30 border border-border/50 p-4">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <HelpCircle className="size-4 text-indigo" />
                                    {t("atsScoreExplainTitle", { default: "Explicabilidad del Score ATS" })}
                                </h4>
                                <p className="text-sm text-foreground leading-relaxed">
                                    {justification ||
                                        t("noJustification", {
                                            default: "No hay justificación disponible para esta puntuación.",
                                        })}
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Evidencia Encontrada */}
                                <div className="rounded-lg bg-emerald/5 border border-emerald/10 p-4">
                                    <h4 className="text-xs font-semibold text-emerald uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <CheckCircle2 className="size-4 text-emerald" />
                                        {t("evidenceDetected", {
                                            count: evidenceFound.length,
                                            default: `Evidencia Detectada (${evidenceFound.length})`,
                                        })}
                                    </h4>
                                    {evidenceFound.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">
                                            {t("noEvidence", { default: "No se detectó evidencia explícita." })}
                                        </p>
                                    ) : (
                                        <ul className="flex flex-col gap-2">
                                            {evidenceFound.map((item, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2 text-xs text-foreground/90"
                                                >
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
                                        {t("missingEvidence", {
                                            count: missingEvidence.length,
                                            default: `Brechas / Evidencia Faltante (${missingEvidence.length})`,
                                        })}
                                    </h4>
                                    {missingEvidence.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">
                                            {t("noGaps", { default: "No se encontraron brechas importantes." })}
                                        </p>
                                    ) : (
                                        <ul className="flex flex-col gap-2">
                                            {missingEvidence.map((item, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2 text-xs text-foreground/90"
                                                >
                                                    <span className="mt-0.5 size-1.5 rounded-full bg-warning shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "tech" && (
                        <div className="rounded-lg bg-muted/30 border border-border/50 p-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <HelpCircle className="size-4 text-indigo" />
                                {t("techScoreExplainTitle", { default: "Explicabilidad del Tech Score" })}
                            </h4>
                            <p className="text-sm text-foreground leading-relaxed">
                                {technicalExplanation ||
                                    t("noJustification", {
                                        default: "No hay justificación disponible para esta puntuación.",
                                    })}
                            </p>
                        </div>
                    )}

                    {activeTab === "credibility" && (
                        <div className="rounded-lg bg-muted/30 border border-border/50 p-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <HelpCircle className="size-4 text-indigo" />
                                {t("credibilityExplainTitle", { default: "Explicabilidad de Credibilidad" })}
                            </h4>
                            <p className="text-sm text-foreground leading-relaxed">
                                {credibilityExplanation ||
                                    t("noJustification", {
                                        default: "No hay justificación disponible para esta puntuación.",
                                    })}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter showCloseButton />
            </DialogContent>
        </Dialog>
    );
}
