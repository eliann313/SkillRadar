"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/infrastructure/logger";
import { jsPDF } from "jspdf";
import { generateInterviewQuestionsAction } from "@/features/recruiter/application/recruiter.use-cases";

interface CandidateQuestionsSectionProps {
    candidateId: string;
    displayName: string;
    seniority: string;
    jobDescription: string;
}

/** Guía de entrevista asistida + exportación PDF (ex bloque del modal monolítico). */
export function CandidateQuestionsSection({
    candidateId,
    displayName,
    seniority,
    jobDescription,
}: CandidateQuestionsSectionProps) {
    const [questions, setQuestions] = useState<{ question: string; expectedResponse: string }[] | null>(null);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

    const handleGenerateQuestions = async () => {
        setIsGeneratingQuestions(true);
        try {
            // El backend resuelve el resume activo desde el developerId (no se expone el ID del CV).
            const res = await generateInterviewQuestionsAction(candidateId, jobDescription);
            if (res.success) {
                setQuestions(res.data);
                toast.success("¡Preguntas de entrevista generadas con éxito!");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            logger.error(error);
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
            doc.text(`Candidato: ${displayName}`, 15, 28);
            doc.text(`Seniority Estimado: ${seniority.toUpperCase()}`, 15, 33);
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
            const nameSanitized = displayName.replace(/\s+/g, "_") || "Candidato";
            doc.save(`Guia_Entrevista_${nameSanitized}.pdf`);
            toast.success("PDF descargado correctamente");
        } catch (error) {
            logger.error("Error generando PDF:", error);
            toast.error("Ocurrió un error al compilar el PDF");
        }
    };

    return (
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
                        Genera una guía técnica estructurada con 3-5 preguntas específicas y sus respuestas modelo,
                        basadas en las brechas tecnológicas del candidato.
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
                        {questions.map((q, i) => (
                            <div
                                key={q.question}
                                className="rounded-lg border border-border bg-muted/5 p-3.5 flex flex-col gap-2"
                            >
                                <h5 className="text-xs font-bold text-indigo-600 flex gap-1.5 items-start">
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo/10 text-[10px] font-bold text-indigo">
                                        {i + 1}
                                    </span>
                                    <span className="leading-5">{q.question}</span>
                                </h5>
                                <div className="rounded-md bg-muted/20 border border-border/40 p-2.5 text-[11px] text-muted-foreground">
                                    <p className="font-semibold text-foreground mb-1">Respuesta Esperada:</p>
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
    );
}
