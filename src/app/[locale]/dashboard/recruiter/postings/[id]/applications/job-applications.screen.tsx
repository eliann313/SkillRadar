"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateApplicationStatusAction } from "@/features/jobs/application/jobs.use-cases";
import { createContactRequestAction, bulkOutreachAction } from "@/features/recruiter/application/recruiter.use-cases";
import { toast } from "sonner";
import { cn } from "@/shared-kernel/utils";
import type { Application } from "./application.types";
import { ApplicationKanbanCard } from "./application-kanban-card";
import { ApplicationListCard } from "./application-list-card";
import { ApplicationAnalysisDialog } from "./application-analysis-dialog";
import { ContactRequestDialog } from "./contact-request-dialog";

export type { Application } from "./application.types";

interface ApplicationsClientPageProps {
    jobTitle: string;
    companyName: string;
    jobPostingId: string;
    initialApplications: Application[];
}

/**
 * Shell de postulaciones (Fase C): estado + handlers + layout lista/kanban.
 * Las tarjetas y diálogos viven en sus propios ficheros.
 */
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
    const [bulkArmed, setBulkArmed] = useState(false);
    const [bulkSending, setBulkSending] = useState(false);

    const bulkTargets = applications.filter((a) => a.contactStatus !== "pending" && a.contactStatus !== "accepted");

    const handleBulkSend = async () => {
        if (!bulkArmed) {
            setBulkArmed(true);
            return;
        }
        setBulkSending(true);
        try {
            const res = await bulkOutreachAction({
                templateBody: `Hola, he revisado tu postulación para la vacante de {{puesto}} en {{empresa}} y me gustaría que tengamos una breve entrevista. ¿Te interesa revelar tus datos de contacto?`,
                jobTitle,
                company: companyName,
                developerIds: bulkTargets.map((a) => a.developerId),
            });
            if (res.success) {
                const sentSet = new Set(res.data.sent);
                setApplications((prev) =>
                    prev.map((app) =>
                        sentSet.has(app.developerId) ? { ...app, contactStatus: "pending" as const } : app,
                    ),
                );
                toast.success(`Solicitudes enviadas: ${res.data.sent.length}. Omitidas: ${res.data.skipped.length}.`);
                setBulkArmed(false);
            } else {
                toast.error(res.error || "Error en el envío masivo.");
            }
        } finally {
            setBulkSending(false);
        }
    };

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
        try {
            const res = await createContactRequestAction(contactingDevId, contactMessage);
            if (res.success) {
                toast.success("Solicitud de contacto enviada. Se le notificará al desarrollador.");
                setApplications((prev) =>
                    prev.map((app) =>
                        app.developerId === contactingDevId ? { ...app, contactStatus: "pending" } : app,
                    ),
                );
                setIsContactDialogOpen(false);
            } else {
                toast.error(res.error || "Error al enviar la solicitud.");
            }
        } finally {
            setLoading(false);
        }
    };

    const openDetails = (app: Application) => {
        setSelectedApp(app);
        setIsDetailOpen(true);
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

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {bulkTargets.length > 0 && (
                        <Button
                            variant={bulkArmed ? "destructive" : "outline"}
                            size="sm"
                            disabled={bulkSending}
                            onClick={() => void handleBulkSend()}
                            onBlur={() => setBulkArmed(false)}
                        >
                            {bulkSending
                                ? "Enviando..."
                                : bulkArmed
                                  ? `Confirmar envío a ${bulkTargets.length}`
                                  : `Contactar a ${bulkTargets.length}`}
                        </Button>
                    )}
                    <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border">
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
                                    "flex flex-col gap-3 p-3 rounded-xl border min-h-[450px] transition-colors",
                                    col.color,
                                )}
                            >
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h3 className="font-semibold text-xs text-foreground uppercase tracking-wide">
                                        {col.title}
                                    </h3>
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    >
                                        {colApps.length}
                                    </Badge>
                                </div>
                                <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-0.5">
                                    {colApps.length === 0 ? (
                                        <div className="text-center py-10 text-[10px] text-muted-foreground/60 italic px-1">
                                            Arrastra aquí
                                        </div>
                                    ) : (
                                        colApps.map((app) => (
                                            <ApplicationKanbanCard
                                                key={app.id}
                                                app={app}
                                                onOpenDetails={openDetails}
                                                onContact={openContactDialog}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <ApplicationListCard
                            key={app.id}
                            app={app}
                            onOpenDetails={openDetails}
                            onContact={openContactDialog}
                            onStatusChange={(appId, status) =>
                                void handleStatusChange(
                                    appId,
                                    status as
                                        | "submitted"
                                        | "reviewed"
                                        | "rejected"
                                        | "shortlisted"
                                        | "interview"
                                        | "offer"
                                        | "hired",
                                )
                            }
                        />
                    ))}
                </div>
            )}

            <ApplicationAnalysisDialog app={selectedApp} open={isDetailOpen} onOpenChange={setIsDetailOpen} />

            <ContactRequestDialog
                open={isContactDialogOpen}
                onOpenChange={setIsContactDialogOpen}
                message={contactMessage}
                onMessageChange={setContactMessage}
                sending={loading}
                onSend={() => void handleSendContactRequest()}
            />
        </div>
    );
}
