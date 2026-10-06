"use client";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DialogFooter as DialogFooterAction } from "@/components/ui/dialog";
import { cn } from "@/shared-kernel/utils";
import { CandidateWorkspace } from "@/components/recruiter/candidate-workspace";
import type { Application } from "./application.types";
import { getScoreColor } from "./application-badges";

interface ApplicationAnalysisDialogProps {
    app: Application | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** Modal de detalle de análisis IA (ex bloque del screen monolítico). */
export function ApplicationAnalysisDialog({ app, open, onOpenChange }: ApplicationAnalysisDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg bg-popover text-popover-foreground">
                <DialogHeader>
                    <DialogTitle>Análisis de Coincidencia de IA</DialogTitle>
                    <DialogDescription>Afinidad del candidato con el puesto detallada por Gemini.</DialogDescription>
                </DialogHeader>

                {app && (
                    <div className="space-y-4 py-2">
                        <div className="flex items-center justify-between border-b pb-3 border-border">
                            <div>
                                <h3 className="font-bold text-sm text-foreground">
                                    {app.contactStatus === "accepted" ? app.developer.name : app.developer.anonymousId}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Postulado el {new Date(app.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div
                                className={cn(
                                    "text-base font-extrabold px-3 py-1 rounded border",
                                    getScoreColor(app.matchScore),
                                )}
                            >
                                {app.matchScore}% Match
                            </div>
                        </div>

                        {app.analysis?.explainability && (
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">Justificación</h4>
                                <p className="text-xs leading-relaxed bg-muted/40 p-3 rounded-lg border border-border">
                                    {app.analysis.explainability}
                                </p>
                            </div>
                        )}

                        {app.analysis?.requiredSkills && (
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">
                                    Habilidades que Cumple
                                </h4>
                                <div className="flex flex-wrap gap-1 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                                    {app.analysis.requiredSkills.length > 0 ? (
                                        app.analysis.requiredSkills.map((s: string) => (
                                            <Badge
                                                key={s}
                                                variant="outline"
                                                className="text-emerald-600 bg-emerald-50/5 border-emerald-500/20"
                                            >
                                                {s}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            Ninguna habilidad detectada en común.
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {app.analysis?.missingSkills && (
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">
                                    Habilidades Faltantes
                                </h4>
                                <div className="flex flex-wrap gap-1 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                                    {app.analysis.missingSkills.length > 0 ? (
                                        app.analysis.missingSkills.map((s: string) => (
                                            <Badge
                                                key={s}
                                                variant="outline"
                                                className="text-rose-600 bg-rose-50/5 border-rose-500/20"
                                            >
                                                {s}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            Ninguna habilidad faltante importante detectada.
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {app.analysis?.recommendations && (
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">Recomendaciones</h4>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                                    {Array.isArray(app.analysis.recommendations) ? (
                                        app.analysis.recommendations.map((r: string) => <li key={r}>{r}</li>)
                                    ) : (
                                        <li>{app.analysis.recommendations}</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-1 border-t border-border pt-3">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground">Espacio de trabajo</h4>
                            <CandidateWorkspace applicationId={app.id} />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <DialogFooterAction showCloseButton />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
