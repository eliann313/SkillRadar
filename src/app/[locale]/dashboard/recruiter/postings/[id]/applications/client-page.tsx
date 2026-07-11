"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Eye, Shield, Send, CheckCircle2, XCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { updateApplicationStatusAction } from "@/features/jobs/actions";
import { createContactRequestAction } from "@/features/recruiter/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface Application {
    id: string;
    jobPostingId: string;
    developerId: string;
    resumeId: string | null;
    status: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    matchScore: number;
    contactStatus: string;
    contactRequestId: string | null;
    analysis: {
        explainability?: string;
        requiredSkills?: string[];
        missingSkills?: string[];
        recommendations?: string[] | string;
    } | null;
    developer: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        isPublicProfile: boolean;
        publicUsername: string | null;
        anonymousId: string;
    };
    resume: {
        id: string;
        fileName: string;
        fileUrl: string;
        atsScore: number | null;
        analysis: {
            keywords?: string[];
        } | null;
    } | null;
}

interface ApplicationsClientPageProps {
    jobTitle: string;
    companyName: string;
    jobPostingId: string;
    initialApplications: Application[];
}

export function ApplicationsClientPage({
    jobTitle,
    companyName,
    jobPostingId: _jobPostingId,
    initialApplications,
}: ApplicationsClientPageProps) {
    const [applications, setApplications] = useState<Application[]>(initialApplications);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
    const [contactMessage, setContactMessage] = useState("");
    const [contactingDevId, setContactingDevId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

    const handleStatusChange = async (
        appId: string,
        newStatus: "submitted" | "reviewed" | "rejected" | "shortlisted" | "interview" | "offer" | "hired",
    ) => {
        const res = await updateApplicationStatusAction(appId, newStatus);
        if (!res.success) {
            toast.error(res.error || "Error al actualizar estado.");
            return;
        }
        setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app)));
        toast.success("Estado de la postulación actualizado.");
    };

    const openContactDialog = (developerId: string) => {
        setContactingDevId(developerId);
        setContactMessage(
            `Hola, he revisado tu postulación para la vacante de ${jobTitle} en ${companyName} y me gustaría que tengamos una breve entrevista. ¿Te interesa revelar tus datos de contacto?`,
        );
        setIsContactDialogOpen(true);
    };

    const handleSendContactRequest = async () => {
        if (!contactingDevId || !contactMessage.trim()) return;

        setLoading(true);
        const res = await createContactRequestAction(contactingDevId, contactMessage);
        if (res.success) {
            toast.success("Solicitud de contacto enviada. Se le notificará al desarrollador.");
            setApplications((prev) =>
                prev.map((app) => (app.developerId === contactingDevId ? { ...app, contactStatus: "pending" } : app)),
            );
            setIsContactDialogOpen(false);
        } else {
            toast.error(res.error || "Error al enviar la solicitud.");
        }
        setLoading(false);
    };

    const openDetails = (app: Application) => {
        setSelectedApp(app);
        setIsDetailOpen(true);
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
        if (score >= 70) return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
        if (score >= 50) return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
        return "bg-muted text-muted-foreground border border-muted-foreground/10";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "reviewed":
                return (
                    <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">
                        En Revisión
                    </Badge>
                );
            case "shortlisted":
                return (
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                        Preseleccionado
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-200">
                        No Seleccionado
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                        Recibida
                    </Badge>
                );
        }
    };

    const getContactBadge = (status: string) => {
        switch (status) {
            case "accepted":
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Contacto Revelado
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        Contacto Pendiente
                    </Badge>
                );
            case "declined":
                return (
                    <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20">Contacto Rechazado</Badge>
                );
            default:
                return (
                    <Badge className="bg-muted text-muted-foreground border border-border">Doble Ciego Activo</Badge>
                );
        }
    };

    const KANBAN_COLUMNS = [
        { id: "submitted", title: "Aplicados", color: "border-blue-500/20 bg-blue-500/5 dark:bg-blue-955/10" },
        {
            id: "reviewed",
            title: "Filtro Técnico",
            color: "border-yellow-500/20 bg-yellow-500/5 dark:bg-yellow-955/10",
        },
        { id: "interview", title: "Entrevista", color: "border-purple-500/20 bg-purple-500/5 dark:bg-purple-955/10" },
        { id: "offer", title: "Oferta", color: "border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-955/10" },
        { id: "hired", title: "Contratados", color: "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-955/10" },
    ];

    const getColumnApps = (colId: string) => {
        return applications.filter((app) => {
            if (app.status === "rejected") return false;
            if (colId === "submitted") return app.status === "submitted" || app.status === "pending" || !app.status;
            if (colId === "reviewed") return app.status === "reviewed" || app.status === "shortlisted";
            return app.status === colId;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/recruiter/postings">
                        <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                            <ArrowLeft className="size-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{jobTitle}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {companyName} — Listado de postulantes ordenados por score de matching con el puesto.
                        </p>
                    </div>
                </div>

                <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border shrink-0 self-start sm:self-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "text-xs px-3 py-1.5 h-auto rounded-md shadow-none gap-1",
                            viewMode === "list"
                                ? "bg-background text-foreground font-semibold"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        📝 Vista Lista
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("kanban")}
                        className={cn(
                            "text-xs px-3 py-1.5 h-auto rounded-md shadow-none gap-1",
                            viewMode === "kanban"
                                ? "bg-background text-foreground font-semibold"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        📊 Vista Kanban
                    </Button>
                </div>
            </div>

            {applications.length === 0 ? (
                <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                    <CardHeader>
                        <CardTitle className="text-muted-foreground font-medium">
                            No se han recibido postulaciones
                        </CardTitle>
                        <CardDescription>
                            Aún ningún desarrollador se ha postulado a esta vacante laboral.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : viewMode === "kanban" ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto min-h-[500px] pb-6">
                    {KANBAN_COLUMNS.map((col) => {
                        const colApps = getColumnApps(col.id);
                        return (
                            <div
                                key={col.id}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    const appId = e.dataTransfer.getData("text/plain");
                                    if (appId) {
                                        void handleStatusChange(
                                            appId,
                                            col.id as
                                                | "submitted"
                                                | "reviewed"
                                                | "rejected"
                                                | "shortlisted"
                                                | "interview"
                                                | "offer"
                                                | "hired",
                                        );
                                    }
                                }}
                                className={cn(
                                    "flex flex-col gap-3 p-3 rounded-xl border min-h-[450px] transition-colors duration-200",
                                    col.color,
                                )}
                            >
                                <div className="flex items-center justify-between border-b border-border pb-2 mb-1">
                                    <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                                        {col.title}
                                    </h3>
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    >
                                        {colApps.length}
                                    </Badge>
                                </div>
                                <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-1">
                                    {colApps.length === 0 ? (
                                        <div className="text-center py-10 text-[10px] text-muted-foreground/60 border border-dashed border-border/60 rounded-lg">
                                            Arrastra aquí
                                        </div>
                                    ) : (
                                        colApps.map((app) => {
                                            const dev = app.developer;
                                            const isRevealed = app.contactStatus === "accepted";
                                            const score = app.resume?.atsScore ?? app.matchScore;
                                            return (
                                                <div
                                                    key={app.id}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData("text/plain", app.id);
                                                    }}
                                                    className="bg-card hover:bg-card/80 border border-border p-3.5 rounded-lg shadow-xs cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-xs transition-all space-y-3"
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span
                                                            className="font-bold text-xs text-foreground truncate max-w-[100px]"
                                                            title={isRevealed ? dev.name || "" : dev.anonymousId}
                                                        >
                                                            {isRevealed ? dev.name || "Sin nombre" : dev.anonymousId}
                                                        </span>
                                                        <Badge
                                                            className={cn(
                                                                "text-[9px] px-1.5 py-0.5 rounded-md border-none",
                                                                getScoreColor(score),
                                                            )}
                                                        >
                                                            {score}%
                                                        </Badge>
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground flex flex-col gap-1">
                                                        <span className="truncate">
                                                            {app.resume?.fileName || "Sin CV cargado"}
                                                        </span>
                                                        <div className="mt-1 flex items-center justify-between">
                                                            {getContactBadge(app.contactStatus)}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-1 pt-1.5 border-t border-border/40">
                                                        <Button
                                                            onClick={() => openDetails(app)}
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 text-[10px] gap-1 px-2 hover:bg-muted"
                                                        >
                                                            <Eye className="size-3" />
                                                            Ver
                                                        </Button>
                                                        {!isRevealed && app.contactStatus === "none" && (
                                                            <Button
                                                                onClick={() => openContactDialog(dev.id)}
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 text-[10px] gap-1 px-2 hover:bg-indigo/10 hover:text-indigo-500 text-muted-foreground"
                                                            >
                                                                <Mail className="size-3" />
                                                                Contactar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => {
                        const dev = app.developer;
                        const isRevealed = app.contactStatus === "accepted";
                        const skills: string[] = app.resume?.analysis?.keywords || [];

                        return (
                            <Card
                                key={app.id}
                                className="border border-border p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                            >
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-base text-foreground">
                                                {isRevealed ? dev.name : dev.anonymousId}
                                            </span>
                                            {getContactBadge(app.contactStatus)}
                                        </div>
                                        {getStatusBadge(app.status)}
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Award className="size-3.5" />
                                            Afinidad: {app.matchScore}%
                                        </span>
                                        <span>Postulado el {new Date(app.createdAt).toLocaleDateString()}</span>
                                        {isRevealed && dev.email && (
                                            <span className="flex items-center gap-1 text-primary">
                                                <Mail className="size-3.5" />
                                                {dev.email}
                                            </span>
                                        )}
                                    </div>

                                    {skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {skills.slice(0, 5).map((skill) => (
                                                <Badge key={skill} variant="secondary" className="text-[10px]">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {skills.length > 5 && (
                                                <span className="text-[10px] text-muted-foreground px-1 self-center">
                                                    +{skills.length - 5}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Detalle rápido de explainability */}
                                    {app.analysis?.explainability && (
                                        <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed bg-muted/20 p-2.5 rounded border border-border/40">
                                            <span className="font-semibold text-foreground/80">Justificación IA:</span>{" "}
                                            {app.analysis.explainability}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end w-full md:w-auto shrink-0 gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                                    <div
                                        className={cn(
                                            "text-sm font-extrabold px-3 py-1.5 rounded border shrink-0",
                                            getScoreColor(app.matchScore),
                                        )}
                                    >
                                        {app.matchScore}% Match
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openDetails(app)}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="size-3.5" />
                                            <span>Ver Análisis</span>
                                        </Button>

                                        {!isRevealed && app.contactStatus === "none" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openContactDialog(dev.id)}
                                                className="flex items-center gap-1 text-primary hover:text-primary/95 border-primary/20 bg-primary/5 hover:bg-primary/10"
                                            >
                                                <Shield className="size-3.5" />
                                                <span>Contactar (Doble Ciego)</span>
                                            </Button>
                                        )}

                                        {app.status === "submitted" && (
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    void handleStatusChange(app.id, "reviewed");
                                                }}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                            >
                                                Marcar en Revisión
                                            </Button>
                                        )}

                                        {app.status !== "shortlisted" && app.status !== "rejected" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        void handleStatusChange(app.id, "shortlisted");
                                                    }}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1"
                                                >
                                                    <CheckCircle2 className="size-3.5" />
                                                    <span>Preseleccionar</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        void handleStatusChange(app.id, "rejected");
                                                    }}
                                                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/10 flex items-center gap-1"
                                                >
                                                    <XCircle className="size-3.5" />
                                                    <span>Rechazar</span>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modal de Detalle de Análisis de IA */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-lg bg-popover text-popover-foreground">
                    <DialogHeader>
                        <DialogTitle>Análisis de Coincidencia de IA</DialogTitle>
                        <DialogDescription>
                            Afinidad del candidato con el puesto detallada por Gemini.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedApp && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center justify-between border-b pb-3 border-border">
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">
                                        {selectedApp.contactStatus === "accepted"
                                            ? selectedApp.developer.name
                                            : selectedApp.developer.anonymousId}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Postulado el {new Date(selectedApp.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div
                                    className={cn(
                                        "text-base font-extrabold px-3 py-1 rounded border",
                                        getScoreColor(selectedApp.matchScore),
                                    )}
                                >
                                    {selectedApp.matchScore}% Match
                                </div>
                            </div>

                            {selectedApp.analysis?.explainability && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Justificación</h4>
                                    <p className="text-xs leading-relaxed bg-muted/40 p-3 rounded-lg border border-border">
                                        {selectedApp.analysis.explainability}
                                    </p>
                                </div>
                            )}

                            {selectedApp.analysis?.requiredSkills && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground">
                                        Habilidades que Cumple
                                    </h4>
                                    <div className="flex flex-wrap gap-1 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                                        {selectedApp.analysis.requiredSkills.length > 0 ? (
                                            selectedApp.analysis.requiredSkills.map((s: string) => (
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

                            {selectedApp.analysis?.missingSkills && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground">
                                        Habilidades Faltantes
                                    </h4>
                                    <div className="flex flex-wrap gap-1 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                                        {selectedApp.analysis.missingSkills.length > 0 ? (
                                            selectedApp.analysis.missingSkills.map((s: string) => (
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

                            {selectedApp.analysis?.recommendations && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground">
                                        Recomendaciones
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                                        {Array.isArray(selectedApp.analysis.recommendations) ? (
                                            selectedApp.analysis.recommendations.map((r: string, idx: number) => (
                                                <li key={idx}>{r}</li>
                                            ))
                                        ) : (
                                            <li>{selectedApp.analysis.recommendations}</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <DialogFooter showCloseButton />
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Solicitud de Contacto (Doble Ciego) */}
            <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogContent className="max-w-md bg-popover text-popover-foreground">
                    <DialogHeader>
                        <DialogTitle>Solicitar Datos de Contacto (Doble Ciego)</DialogTitle>
                        <DialogDescription>
                            Envía un mensaje al desarrollador para invitarlo a revelar su PII (Nombre, Email, Redes).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold">Mensaje de Propuesta *</label>
                            <Textarea
                                rows={5}
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder="Hola, me gustaría conversar contigo sobre..."
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogFooter showCloseButton />
                        <Button
                            onClick={() => {
                                void handleSendContactRequest();
                            }}
                            disabled={loading}
                            className="flex items-center gap-1.5"
                        >
                            <Send className="size-4" />
                            <span>{loading ? "Enviando..." : "Enviar Solicitud"}</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
