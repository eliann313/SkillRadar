"use client";

import { useState } from "react";
import type { TalentCard } from "@/lib/types";
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
import {
    Sparkles,
    AlertCircle,
    TrendingUp,
    HelpCircle,
    Download,
    Loader2,
    Award,
    Mail,
    Copy,
    Check,
    FileText,
} from "lucide-react";
import {
    generateInterviewQuestionsAction,
    generateCandidatePitchSummaryAction,
    generateCandidateOutreachAction,
} from "@/features/recruiter/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { cn } from "@/lib/utils";

interface CandidateDetailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: TalentCard | null;
    jobDescription: string;
}

export function CandidateDetailModal({ isOpen, onOpenChange, candidate, jobDescription }: CandidateDetailModalProps) {
    const [questions, setQuestions] = useState<{ question: string; expectedResponse: string }[] | null>(null);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

    const [pitchSummary, setPitchSummary] = useState<string | null>(null);
    const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
    const [outreachMessage, setOutreachMessage] = useState<string | null>(null);
    const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
    const [outreachJobTitle, setOutreachJobTitle] = useState(
        jobDescription ? jobDescription.slice(0, 45) : "Desarrollador Web",
    );
    const [outreachCompany, setOutreachCompany] = useState("Nuestra Empresa");
    const [copiedOutreach, setCopiedOutreach] = useState(false);
    const [copiedPitch, setCopiedPitch] = useState(false);

    const handleGeneratePitch = async () => {
        if (!candidate) return;
        setIsGeneratingPitch(true);
        try {
            const res = await generateCandidatePitchSummaryAction(candidate.id);
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

    const handleGenerateOutreach = async () => {
        if (!candidate) return;
        setIsGeneratingOutreach(true);
        try {
            const res = await generateCandidateOutreachAction(candidate.id, outreachJobTitle, outreachCompany);
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

    const handleCopyPitch = () => {
        if (!pitchSummary) return;
        void navigator.clipboard.writeText(pitchSummary);
        setCopiedPitch(true);
        toast.success("Copiado al portapapeles");
        setTimeout(() => setCopiedPitch(false), 2000);
    };

    if (!candidate) return null;

    const isAccepted = candidate.contactStatus === "accepted";

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

    const handleGenerateQuestions = async () => {
        setIsGeneratingQuestions(true);
        try {
            // Nota: dado que necesitamos un resumeId, buscaremos el resume ID.
            // Para el TalentCard, podemos asumir que su ID de candidato está relacionado.
            // En el flujo real, rankTalentPool analiza el primer currículum de su lista.
            // Así que pasamos candidate.id (el backend rankeador usa candidate.resumes[0].id)
            // Por simplicidad, el backend cargará el último resume del desarrollador correspondiente al developerId (candidate.id).
            // Modificaremos la acción para que acepte el developerId, o buscaremos su resume.
            // Espera, en generateInterviewQuestionsAction definimos:
            // (resumeId: string, jobDescription: string)
            // Pero como el reclutador no tiene el resumeId directo en el TalentCard de la UI actual,
            // podemos ajustar generateInterviewQuestionsAction para que acepte `developerId`
            // y busque su currículum activo en el backend. Esto es 100% robusto y nos ahorra exponer el ID del CV.
            // Vamos a invocar la acción enviándole el candidate.id (que es el developerId).
            // Y modificaremos actions.ts y service.ts en breve para que resuelvan el resumeId a partir del developerId si es necesario.
            const res = await generateInterviewQuestionsAction(candidate.id, jobDescription);
            if (res.success) {
                setQuestions(res.data);
                toast.success("¡Preguntas de entrevista generadas con éxito!");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error al generar las preguntas");
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!questions) return;

        try {
            const doc = new jsPDF();

            // Título principal
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(30, 41, 59); // slate-800
            doc.text("GUÍA DE ENTREVISTA TÉCNICA - IA COPILOT", 15, 20);

            // Metadatos
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text(`Candidato: ${isAccepted ? candidate.name : candidate.anonymousId}`, 15, 28);
            doc.text(`Seniority Estimado: ${candidate.estimatedSeniority.toUpperCase()}`, 15, 33);
            doc.text(`Fecha de Generación: ${new Date().toLocaleDateString()}`, 15, 38);

            // Línea divisoria
            doc.setDrawColor(226, 232, 240); // slate-200
            doc.line(15, 43, 195, 43);

            let yOffset = 50;

            questions.forEach((q, idx) => {
                // Verificar salto de página
                if (yOffset > 250) {
                    doc.addPage();
                    yOffset = 20;
                }

                // Número y Pregunta
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.setTextColor(79, 70, 229); // indigo-600
                const qText = `${idx + 1}. ${q.question}`;
                const splitQ = doc.splitTextToSize(qText, 180);
                doc.text(splitQ, 15, yOffset);
                yOffset += splitQ.length * 6;

                // Respuesta Esperada
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(71, 85, 105); // slate-600
                const respTitle = "Respuesta clave esperada:";
                doc.text(respTitle, 15, yOffset);
                yOffset += 5;

                doc.setTextColor(100, 116, 139); // slate-500
                const splitResp = doc.splitTextToSize(q.expectedResponse, 180);
                doc.text(splitResp, 15, yOffset);
                yOffset += splitResp.length * 5 + 10; // Espaciado entre preguntas
            });

            // Guardar el PDF
            const nameSanitized =
                (isAccepted ? candidate.name : candidate.anonymousId)?.replace(/\s+/g, "_") || "Candidato";
            doc.save(`Guia_Entrevista_${nameSanitized}.pdf`);
            toast.success("PDF descargado correctamente");
        } catch (error) {
            console.error("Error generando PDF:", error);
            toast.error("Ocurrió un error al compilar el PDF");
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    setQuestions(null);
                    setPitchSummary(null);
                    setOutreachMessage(null);
                    setCopiedOutreach(false);
                    setCopiedPitch(false);
                }
                onOpenChange(open);
            }}
        >
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

                    {/* Preguntas de Entrevista Asistidas (Tarjeta 15.2) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-4.5 text-indigo-500 animate-pulse" />
                                <h4 className="text-sm font-semibold text-foreground">Guía de Entrevista Asistida</h4>
                            </div>
                            {questions && (
                                <Button
                                    onClick={handleDownloadPDF}
                                    size="icon-sm"
                                    variant="outline"
                                    title="Descargar PDF"
                                    className="h-8 w-8 text-primary border-primary/20 hover:bg-primary/10"
                                >
                                    <Download className="size-3.5" />
                                </Button>
                            )}
                        </div>

                        {!questions ? (
                            <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 p-5 text-center flex flex-col items-center gap-3">
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    Genera una guía técnica estructurada con 3-5 preguntas específicas y sus respuestas
                                    modelo, basadas en las brechas tecnológicas del candidato.
                                </p>
                                <Button
                                    onClick={() => {
                                        void handleGenerateQuestions();
                                    }}
                                    disabled={isGeneratingQuestions}
                                    size="sm"
                                    className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {isGeneratingQuestions ? (
                                        <>
                                            <Loader2 className="size-3.5 animate-spin" />
                                            Estructurando Preguntas...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="size-3.5" />
                                            Generar Preguntas de Entrevista
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="space-y-3">
                                    {questions.map((q, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-lg border border-border bg-muted/5 p-3.5 flex flex-col gap-2"
                                        >
                                            <h5 className="text-xs font-bold text-indigo-600 flex gap-1.5 items-start">
                                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo/10 text-[10px] font-bold text-indigo">
                                                    {idx + 1}
                                                </span>
                                                <span className="leading-5">{q.question}</span>
                                            </h5>
                                            <div className="rounded-md bg-muted/20 border border-border/40 p-2.5 text-[11px] text-muted-foreground">
                                                <p className="font-semibold text-foreground mb-1">
                                                    Respuesta Esperada:
                                                </p>
                                                <p className="leading-normal font-sans">{q.expectedResponse}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleDownloadPDF}
                                    className="w-full gap-2 mt-2 border-primary/30 text-primary"
                                    variant="outline"
                                >
                                    <Download className="size-4" />
                                    Descargar Guía de Entrevista en PDF
                                </Button>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Resumen Ejecutivo IA (AI Candidate Pitch) */}
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

                    <Separator />

                    {/* AI Outreach Writer */}
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
                </div>

                <DialogFooter className="border-t border-border pt-4">
                    <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
