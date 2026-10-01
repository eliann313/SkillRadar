"use client";

import type { TalentCard } from "@/shared-kernel/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, TrendingUp, HelpCircle, Award } from "lucide-react";
import { cn } from "@/shared-kernel/utils";
import { CandidateQuestionsSection } from "./candidate-questions.section";
import { CandidatePitchSection } from "./candidate-pitch.section";
import { CandidateOutreachSection } from "./candidate-outreach.section";

interface CandidateDetailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: TalentCard | null;
    jobDescription: string;
}

/**
 * Shell del detalle de candidato (Fase 1): perfil + score + observaciones.
 * Las secciones IA (preguntas, pitch, outreach) viven en sus propios
 * ficheros y se remontan en cada apertura (key) para resetear su estado,
 * replicando el reset-on-close del modal monolítico original.
 */
export function CandidateDetailModal({ isOpen, onOpenChange, candidate, jobDescription }: CandidateDetailModalProps) {
    if (!candidate) return null;

    const isAccepted = candidate.contactStatus === "accepted";
    const displayName = isAccepted ? (candidate.name ?? candidate.anonymousId) : candidate.anonymousId;

    const getSeniorityColor = (level: string) => {
        switch (level) {
            case "lead":
                return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            case "senior":
                return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            case "mid":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            default:
                return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto bg-card border border-border/80">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-indigo/10 border border-indigo/20 text-indigo text-lg font-bold">
                            🔒
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                                {isAccepted ? candidate.name : "Perfil Doble Ciego"}
                                <span className="font-mono text-xs text-muted-foreground">
                                    ({candidate.anonymousId})
                                </span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Detalles de matching y observaciones técnicas
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Compatibilidad Score */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Compatibilidad ATS</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-foreground">
                                    {candidate.averageScore}%
                                </span>
                                <Badge
                                    className={cn(
                                        "text-[10px] font-medium border-none",
                                        getSeniorityColor(candidate.estimatedSeniority),
                                    )}
                                >
                                    <Award className="mr-1 size-3" />
                                    {candidate.estimatedSeniority.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        <div className="text-right flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Última Actividad</span>
                            <span className="text-xs font-medium text-foreground">
                                {new Date(candidate.lastActive).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Razonamiento IA */}
                    {candidate.justification && (
                        <div className="flex flex-col gap-2">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Razonamiento de Ajuste
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/10 p-3 rounded-lg border border-border/40">
                                {candidate.justification}
                            </p>
                        </div>
                    )}

                    {/* Habilidades */}
                    {candidate.topSkills.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Habilidades Detectadas
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {candidate.topSkills.map((skill) => (
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
                    )}

                    <Separator />

                    {/* Observaciones Técnicas (Tarjeta 15.1) */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="size-4.5 text-primary" />
                            <h4 className="text-sm font-semibold text-foreground">Observaciones Técnicas (Copilot)</h4>
                        </div>

                        {!candidate.technicalObservations || candidate.technicalObservations.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">
                                No se detectaron observaciones técnicas críticas en el análisis.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {candidate.technicalObservations.map((obs, idx) => (
                                    <details
                                        key={idx}
                                        className="group rounded-lg border border-border/60 bg-muted/5 overflow-hidden transition-all duration-200"
                                    >
                                        <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-medium text-foreground select-none hover:bg-muted/10">
                                            <div className="flex items-center gap-2">
                                                {obs.category === "verification_point" ? (
                                                    <AlertCircle className="size-4 text-warning" />
                                                ) : (
                                                    <TrendingUp className="size-4 text-primary" />
                                                )}
                                                <span>
                                                    {obs.category === "verification_point"
                                                        ? "Punto a verificar en entrevista"
                                                        : "Área de exploración técnica"}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground group-open:rotate-180 transition-transform">
                                                ▼
                                            </span>
                                        </summary>
                                        <div className="p-3 pt-1 border-t border-border/40 bg-card text-xs text-muted-foreground leading-relaxed">
                                            {obs.observation}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Secciones IA: remontan en cada apertura para resetear estado */}
                    <div key={`${candidate.id}-${isOpen ? "open" : "closed"}`} className="flex flex-col gap-6">
                        <CandidateQuestionsSection
                            candidateId={candidate.id}
                            displayName={displayName}
                            seniority={candidate.estimatedSeniority}
                            jobDescription={jobDescription}
                        />

                        <Separator />

                        <CandidatePitchSection candidateId={candidate.id} />

                        <Separator />

                        <CandidateOutreachSection
                            candidateId={candidate.id}
                            defaultJobTitle={jobDescription ? jobDescription.slice(0, 45) : "Desarrollador Web"}
                        />
                    </div>
                </div>

                <DialogFooter className="border-t border-border pt-4">
                    <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
