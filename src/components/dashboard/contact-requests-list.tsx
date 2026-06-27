"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield } from "lucide-react";
import { acceptContactRequestAction, declineContactRequestAction } from "@/features/developer-requests/actions";
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
                            <div className="flex gap-2 shrink-0 justify-end">
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
        </Card>
    );
}
