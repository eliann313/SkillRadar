"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { generateCandidatePitchSummaryAction } from "@/features/recruiter/application/recruiter.use-cases";

interface CandidatePitchSectionProps {
    candidateId: string;
}

/** Resumen ejecutivo IA / pitch (ex bloque del modal monolítico). */
export function CandidatePitchSection({ candidateId }: CandidatePitchSectionProps) {
    const [pitchSummary, setPitchSummary] = useState<string | null>(null);
    const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
    const [copiedPitch, setCopiedPitch] = useState(false);

    const handleGeneratePitch = async () => {
        setIsGeneratingPitch(true);
        try {
            const res = await generateCandidatePitchSummaryAction(candidateId);
            if (res.success) {
                setPitchSummary(res.data);
                toast.success("¡Resumen ejecutivo generado con éxito!");
            } else {
                toast.error(res.error || "Error al generar el resumen.");
            }
        } catch {
            toast.error("Error al conectar con el servidor.");
        } finally {
            setIsGeneratingPitch(false);
        }
    };

    const handleCopyPitch = () => {
        if (!pitchSummary) return;
        void navigator.clipboard.writeText(pitchSummary);
        setCopiedPitch(true);
        toast.success("Copiado al portapapeles");
        setTimeout(() => setCopiedPitch(false), 2000);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="size-4.5 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">Resumen Ejecutivo IA (Pitch)</h4>
                </div>
                {pitchSummary && (
                    <Button
                        onClick={handleCopyPitch}
                        size="icon-sm"
                        variant="outline"
                        className="h-8 w-8 text-primary border-primary/20 hover:bg-primary/10"
                    >
                        {copiedPitch ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </Button>
                )}
            </div>

            {!pitchSummary ? (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 p-5 text-center flex flex-col items-center gap-3">
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Genera una síntesis ejecutiva en español de los puntos fuertes y perfil técnico del
                        desarrollador en segundos.
                    </p>
                    <Button
                        onClick={() => void handleGeneratePitch()}
                        disabled={isGeneratingPitch}
                        size="sm"
                        className="gap-1.5"
                    >
                        {isGeneratingPitch ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Sintetizando perfil...
                            </>
                        ) : (
                            <>
                                <Sparkles className="size-3.5" />
                                Generar Resumen Ejecutivo
                            </>
                        )}
                    </Button>
                </div>
            ) : (
                <div className="rounded-lg border border-border bg-primary/5 p-4 text-xs text-foreground/90 leading-relaxed font-sans relative">
                    {pitchSummary}
                </div>
            )}
        </div>
    );
}
