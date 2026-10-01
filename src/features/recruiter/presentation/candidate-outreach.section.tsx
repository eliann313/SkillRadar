"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { generateCandidateOutreachAction } from "@/features/recruiter/application/recruiter.use-cases";

interface CandidateOutreachSectionProps {
    candidateId: string;
    defaultJobTitle: string;
}

/** Generador de mensaje de contacto / outreach (ex bloque del modal monolítico). */
export function CandidateOutreachSection({ candidateId, defaultJobTitle }: CandidateOutreachSectionProps) {
    const [outreachMessage, setOutreachMessage] = useState<string | null>(null);
    const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
    const [outreachJobTitle, setOutreachJobTitle] = useState(defaultJobTitle);
    const [outreachCompany, setOutreachCompany] = useState("Nuestra Empresa");
    const [copiedOutreach, setCopiedOutreach] = useState(false);

    const handleGenerateOutreach = async () => {
        setIsGeneratingOutreach(true);
        try {
            const res = await generateCandidateOutreachAction(candidateId, outreachJobTitle, outreachCompany);
            if (res.success) {
                setOutreachMessage(res.data);
                toast.success("¡Propuesta de contacto personalizada generada con éxito!");
            } else {
                toast.error(res.error || "Error al generar la propuesta.");
            }
        } catch {
            toast.error("Error al conectar con el servidor.");
        } finally {
            setIsGeneratingOutreach(false);
        }
    };

    const handleCopyOutreach = () => {
        if (!outreachMessage) return;
        void navigator.clipboard.writeText(outreachMessage);
        setCopiedOutreach(true);
        toast.success("Copiado al portapapeles");
        setTimeout(() => setCopiedOutreach(false), 2000);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mail className="size-4.5 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">
                        Generador de Mensaje de Contacto (Outreach)
                    </h4>
                </div>
                {outreachMessage && (
                    <Button
                        onClick={handleCopyOutreach}
                        size="icon-sm"
                        variant="outline"
                        className="h-8 w-8 text-primary border-primary/20 hover:bg-primary/10"
                    >
                        {copiedOutreach ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </Button>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 p-3.5 rounded-lg border border-border/60 bg-muted/20">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Título de Vacante
                    </label>
                    <Input
                        value={outreachJobTitle}
                        onChange={(e) => setOutreachJobTitle(e.target.value)}
                        className="h-8 text-xs bg-background"
                        placeholder="Ej: Senior Frontend Dev"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Empresa / Cliente
                    </label>
                    <Input
                        value={outreachCompany}
                        onChange={(e) => setOutreachCompany(e.target.value)}
                        className="h-8 text-xs bg-background"
                        placeholder="Ej: Acme Corp"
                    />
                </div>
                <div className="sm:col-span-2 flex justify-end pt-1">
                    <Button
                        onClick={() => void handleGenerateOutreach()}
                        disabled={isGeneratingOutreach}
                        size="sm"
                        className="gap-1.5 w-full sm:w-auto"
                    >
                        {isGeneratingOutreach ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Redactando mensaje...
                            </>
                        ) : (
                            <>
                                <Sparkles className="size-3.5" />
                                Redactar Propuesta de Contacto
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {outreachMessage && (
                <div className="flex flex-col gap-2">
                    <Textarea
                        value={outreachMessage}
                        readOnly
                        className="min-h-[140px] text-xs font-sans bg-background border-border"
                    />
                    <Button
                        onClick={handleCopyOutreach}
                        variant="outline"
                        className="w-full gap-2 border-primary/30 text-primary"
                    >
                        <Copy className="size-4" />
                        Copiar Mensaje Personalizado
                    </Button>
                </div>
            )}
        </div>
    );
}
