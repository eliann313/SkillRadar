"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, ChevronLeft, ShieldCheck, UserX, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getPendingReportsAction, dismissReportAction, suspendUserAction } from "@/features/admin/actions";

interface ReportItem {
    id: string;
    reporterId: string;
    reporter: {
        id: string;
        name: string | null;
        email: string;
    };
    targetType: "job_posting" | "contact_request";
    targetId: string;
    reason: string;
    createdAt: string;
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Diálogo de suspensión
    const [suspendTarget, setSuspendTarget] = useState<{ userId: string; reportId: string } | null>(null);
    const [showSuspendDialog, setShowSuspendDialog] = useState(false);

    const loadReports = async () => {
        try {
            // Ya es true por defecto
            const result = await getPendingReportsAction();
            if (result.success) {
                setReports(result.data as ReportItem[]);
            } else {
                toast.error(result.error || "No se pudieron cargar los reportes.");
            }
        } catch (err) {
            console.error("Error loading reports:", err);
            toast.error("Error al obtener reportes pendientes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadReports();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleDismissReport = async (id: string) => {
        try {
            setActionLoading(id);
            const result = await dismissReportAction(id);
            if (result.success) {
                toast.success("Reporte descartado.");
                setReports((prev) => prev.filter((r) => r.id !== id));
            } else {
                toast.error(result.error || "No se pudo descartar el reporte.");
            }
        } catch (err) {
            console.error("Error dismissing report:", err);
            toast.error("Error de servidor.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleSuspendClick = (userId: string, reportId: string) => {
        setSuspendTarget({ userId, reportId });
        setShowSuspendDialog(true);
    };

    const handleConfirmSuspend = async () => {
        if (!suspendTarget) return;
        try {
            setActionLoading(suspendTarget.reportId);
            const result = await suspendUserAction(suspendTarget.userId, suspendTarget.reportId);
            if (result.success) {
                toast.success("Usuario suspendido e historial de reporte marcado como revisado.");
                setReports((prev) => prev.filter((r) => r.id !== suspendTarget.reportId));
                setShowSuspendDialog(false);
                setSuspendTarget(null);
            } else {
                toast.error(result.error || "No se pudo suspender al usuario.");
            }
        } catch (err) {
            console.error("Error suspending user:", err);
            toast.error("Error al procesar la suspensión.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-6">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Cargando reportes pendientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/dashboard/admin"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 mb-2"
                    >
                        <ChevronLeft className="size-4" />
                        Volver a Control Center
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Moderación de Contenido</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Audita denuncias enviadas por usuarios sobre ofertas de empleo sospechosas o solicitudes de
                        contacto inapropiadas.
                    </p>
                </div>
            </div>

            <Separator className="border-border/50" />

            <div className="grid gap-4">
                {reports.length === 0 ? (
                    <Card className="border-dashed border-border/70 bg-card/20 backdrop-blur-sm p-12 text-center">
                        <CardHeader className="items-center pb-2">
                            <div className="rounded-full bg-primary/10 p-4 mb-2">
                                <ShieldCheck className="size-8 text-primary" />
                            </div>
                            <CardTitle className="text-lg">Todo al día</CardTitle>
                            <CardDescription className="max-w-sm mx-auto">
                                No existen reportes de contenido pendientes de moderación en este momento.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    reports.map((report) => (
                        <Card
                            key={report.id}
                            className="border-border/55 bg-card/45 backdrop-blur-sm shadow-sm overflow-hidden"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex flex-wrap justify-between items-start gap-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`capitalize text-xs font-semibold px-2.5 py-0.5 border-none ${
                                                    report.targetType === "job_posting"
                                                        ? "bg-amber-500/10 text-amber-500"
                                                        : "bg-indigo-500/10 text-indigo-500"
                                                }`}
                                            >
                                                {report.targetType === "job_posting"
                                                    ? "Oferta Laboral"
                                                    : "Solicitud de Contacto"}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground">
                                                ID Reporte: {report.id}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Denunciante:{" "}
                                            <span className="font-semibold text-foreground">
                                                {report.reporter.name || "Usuario"}
                                            </span>{" "}
                                            ({report.reporter.email})
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(report.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <div className="bg-muted/10 border border-border/20 rounded-lg p-4 text-sm text-foreground">
                                    <span className="font-bold block text-xs text-muted-foreground mb-1">
                                        RAZÓN DEL REPORTE:
                                    </span>
                                    &ldquo;{report.reason}&rdquo;
                                </div>

                                <div className="flex justify-between items-center gap-4 pt-2">
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Info className="size-3.5" />
                                        ID del target denunciado:{" "}
                                        <code className="bg-muted/20 px-1 py-0.5 rounded">{report.targetId}</code>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => void handleDismissReport(report.id)}
                                            disabled={actionLoading !== null}
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            {actionLoading === report.id ? (
                                                <Loader2 className="size-3.5 animate-spin" />
                                            ) : (
                                                "Descartar"
                                            )}
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => void handleSuspendClick(report.reporterId, report.id)}
                                            disabled={actionLoading !== null}
                                            className="text-xs font-semibold gap-1.5"
                                        >
                                            <UserX className="size-3.5" />
                                            Suspender Cuenta
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Diálogo Modal de Confirmación de Suspensión */}
            <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            Confirmar Suspensión
                        </DialogTitle>
                        <DialogDescription className="space-y-3 pt-2">
                            <p>
                                ¿Estás seguro de que deseas suspender esta cuenta? Al hacerlo, el usuario perderá acceso
                                instantáneo a la plataforma y no podrá iniciar sesión.
                            </p>
                            <p className="text-xs text-muted-foreground font-semibold">
                                Además, se marcará automáticamente este reporte pendiente como moderado/revisado.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowSuspendDialog(false);
                                setSuspendTarget(null);
                            }}
                            disabled={actionLoading !== null}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => void handleConfirmSuspend()}
                            disabled={actionLoading !== null}
                            className="gap-2"
                        >
                            {actionLoading !== null && <Loader2 className="size-4 animate-spin" />}
                            Confirmar y Suspender
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
