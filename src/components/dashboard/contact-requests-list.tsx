"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Flag } from "lucide-react";
import { acceptContactRequestAction, declineContactRequestAction } from "@/features/developer-requests/actions";
import { createReportAction } from "@/features/jobs/actions";
import { toast } from "sonner";

export interface RequestItem {
    id: string;
    message: string;
    createdAt: Date;
    recruiter: {
        name: string | null;
        email: string;
    };
}

interface ContactRequestsListProps {
    requests: RequestItem[];
}

export function ContactRequestsList({ requests: initialRequests }: ContactRequestsListProps) {
    const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
    const [actionId, setActionId] = useState<string | null>(null);
    const [reportingReqId, setReportingReqId] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const handleSendReport = async () => {
        if (!reportingReqId) return;
        if (reportReason.trim().length < 5) {
            toast.error("El motivo debe tener al menos 5 caracteres.");
            return;
        }
        setIsSubmittingReport(true);
        try {
            const res = await createReportAction({
                targetType: "contact_request",
                targetId: reportingReqId,
                reason: reportReason,
            });

            if (res.success) {
                toast.success("El reporte ha sido enviado. Revisaremos el contenido a la brevedad.");
                setReportingReqId(null);
                setReportReason("");
                setRequests((prev) => prev.filter((r) => r.id !== reportingReqId));
            } else {
                toast.error(res.error || "Error al enviar el reporte.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al enviar el reporte.");
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleAccept = async (requestId: string) => {
        setActionId(requestId);
        try {
            const result = await acceptContactRequestAction(requestId);
            if (result.success) {
                toast.success(
                    "¡Has aceptado la propuesta de contacto! El reclutador ahora puede ver tus datos de contacto.",
                );
                setRequests((prev) => prev.filter((r) => r.id !== requestId));
            } else {
                toast.error(result.error || "Ocurrió un error al procesar.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar la propuesta de contacto.");
        } finally {
            setActionId(null);
        }
    };

    const handleDecline = async (requestId: string) => {
        setActionId(requestId);
        try {
            const result = await declineContactRequestAction(requestId);
            if (result.success) {
                toast.success("Propuesta declinada de forma silenciosa.");
                setRequests((prev) => prev.filter((r) => r.id !== requestId));
            } else {
                toast.error(result.error || "Ocurrió un error al procesar.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar.");
        } finally {
            setActionId(null);
        }
    };

    if (requests.length === 0) return null;

    return (
        <Card className="border-indigo/20 bg-indigo/5 dark:bg-indigo/5/30 shadow-sm transition-all duration-300">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                        <Shield className="size-5 text-indigo" />
                        Peticiones de Contacto Pendientes (Doble Ciego)
                    </CardTitle>
                    <CardDescription>
                        Reclutadores quieren conectar contigo. Al aceptar, revelarás tu nombre y correo.
                    </CardDescription>
                </div>
                <Badge className="bg-indigo text-white font-bold ml-2">{requests.length}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {requests.map((req) => {
                    const isBusy = actionId === req.id;
                    const dateStr = new Date(req.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    });

                    return (
                        <div
                            key={req.id}
                            className="rounded-lg bg-card border border-border/80 p-4 flex flex-col justify-between gap-4 md:flex-row md:items-center"
                        >
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-primary">
                                        Empresa / Reclutador: {req.recruiter?.name || "Reclutador verificado"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">• {dateStr}</span>
                                </div>
                                <div className="rounded-md bg-muted/40 p-3 border border-border/40 text-xs italic text-foreground leading-relaxed">
                                    &ldquo;{req.message}&rdquo;
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0 justify-end items-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Reportar esta solicitud"
                                    onClick={() => setReportingReqId(req.id)}
                                    disabled={isBusy}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                >
                                    <Flag className="size-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void handleDecline(req.id)}
                                    disabled={isBusy}
                                    className="h-8 gap-1 border-destructive/20 text-destructive hover:bg-destructive/10 text-xs"
                                >
                                    <X className="size-3.5" />
                                    Rechazar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => void handleAccept(req.id)}
                                    disabled={isBusy}
                                    className="h-8 gap-1 text-xs bg-emerald text-emerald-foreground hover:bg-emerald/90"
                                >
                                    <Check className="size-3.5" />
                                    Aceptar
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </CardContent>

            {/* Modal de Reporte */}
            {reportingReqId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2 text-destructive font-semibold">
                            <Flag className="size-5" />
                            <h3 className="text-lg font-bold">Reportar Petición de Contacto</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Por favor, describe de forma concisa por qué consideras que esta petición de contacto es
                            spam o inapropiada.
                        </p>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Escribe tu motivo aquí (mínimo 5 caracteres)..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            disabled={isSubmittingReport}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setReportingReqId(null);
                                    setReportReason("");
                                }}
                                disabled={isSubmittingReport}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    void handleSendReport();
                                }}
                                disabled={isSubmittingReport}
                            >
                                {isSubmittingReport ? "Enviando..." : "Enviar Reporte"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
