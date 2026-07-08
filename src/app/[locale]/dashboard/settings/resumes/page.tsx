"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    FileText,
    Trash2,
    CheckCircle2,
    ChevronLeft,
    Calendar,
    Award,
    Loader2,
    AlertTriangle,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getUserResumesAction, setActiveResumeAction, deleteResumeAction } from "@/features/cv-analysis/actions";

interface ResumeItem {
    id: string;
    fileName: string;
    atsScore: number | null;
    createdAt: Date;
    isActive: boolean;
}

export default function ResumesSettingsPage() {
    const { data: session, status } = useSession();
    const [resumes, setResumes] = useState<ResumeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Diálogos de advertencia de borrado
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [warnData, setWarnData] = useState<{
        matches: number;
        interviews: number;
        applications: number;
    } | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const loadResumes = async () => {
        try {
            // Ya es true por defecto
            const result = await getUserResumesAction();
            if (result.success) {
                // Mapear y ordenar por fecha descendente
                const list = result.data
                    .map((r) => ({
                        id: r.id,
                        fileName: r.fileName,
                        atsScore: r.atsScore,
                        createdAt: new Date(r.createdAt),
                        isActive: (r as { isActive?: boolean }).isActive || false,
                    }))
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                setResumes(list);
            } else {
                toast.error(result.error || "Error al cargar tus currículums.");
            }
        } catch (err) {
            console.error("Error cargando CVs:", err);
            toast.error("Ocurrió un error al obtener la lista de currículums.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            const timer = setTimeout(() => {
                void loadResumes();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [status, session]);

    const handleSetActive = async (id: string) => {
        try {
            setActionLoading(id);
            const result = await setActiveResumeAction(id);
            if (result.success) {
                toast.success("CV predeterminado actualizado.");
                // Actualizar estado local
                setResumes((prev) =>
                    prev.map((r) => ({
                        ...r,
                        isActive: r.id === id,
                    })),
                );
            } else {
                toast.error(result.error || "No se pudo actualizar el CV activo.");
            }
        } catch (err) {
            console.error("Error setting active CV:", err);
            toast.error("Error al realizar la acción.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteClick = async (id: string) => {
        try {
            setActionLoading(id);
            const result = await deleteResumeAction(id, false); // Intento seguro (sin forzar)
            if (result.success) {
                if (typeof result.data === "object" && result.data.warning) {
                    // Contiene relaciones, mostrar advertencia en diálogo modal
                    setDeleteTarget(id);
                    setWarnData({
                        matches: result.data.matches || 0,
                        interviews: result.data.interviews || 0,
                        applications: result.data.applications || 0,
                    });
                    setShowDeleteDialog(true);
                } else {
                    toast.success("Currículum eliminado con éxito.");
                    setResumes((prev) => prev.filter((r) => r.id !== id));
                    // Si eliminamos el activo, recargar para ver cuál es el nuevo activo fallback
                    void loadResumes();
                }
            } else {
                toast.error(result.error || "No se pudo eliminar el currículum.");
            }
        } catch (err) {
            console.error("Error deleting CV:", err);
            toast.error("Error al procesar la eliminación.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleForceDelete = async () => {
        if (!deleteTarget) return;
        try {
            setActionLoading(deleteTarget);
            const result = await deleteResumeAction(deleteTarget, true); // Forzar borrado
            if (result.success) {
                toast.success("Currículum e historial asociado eliminados.");
                setResumes((prev) => prev.filter((r) => r.id !== deleteTarget));
                setShowDeleteDialog(false);
                setDeleteTarget(null);
                setWarnData(null);
                void loadResumes(); // Recargar fallback
            } else {
                toast.error(result.error || "Error al forzar la eliminación.");
            }
        } catch (err) {
            console.error("Error force deleting CV:", err);
            toast.error("Error de servidor.");
        } finally {
            setActionLoading(null);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-6">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Cargando currículums...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/dashboard/settings"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 mb-2"
                    >
                        <ChevronLeft className="size-4" />
                        Volver a Ajustes
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestionar Currículums</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Organiza tus versiones de CV, selecciona la activa para Job Match o limpia registros antiguos.
                    </p>
                </div>
                <Link href="/dashboard/cv-analysis">
                    <Button className="gap-2 font-semibold shadow-lg hover:shadow-primary/10 transition-all duration-300">
                        <FileText className="size-4" />
                        Subir Nueva Versión
                    </Button>
                </Link>
            </div>

            <Separator className="border-border/50" />

            <div className="grid gap-4">
                {resumes.length === 0 ? (
                    <Card className="border-dashed border-border/70 bg-card/20 backdrop-blur-sm p-12 text-center">
                        <CardHeader className="items-center pb-2">
                            <div className="rounded-full bg-primary/10 p-4 mb-2">
                                <FileText className="size-8 text-primary" />
                            </div>
                            <CardTitle className="text-lg">No tienes currículums subidos</CardTitle>
                            <CardDescription className="max-w-sm mx-auto">
                                Analiza tu primer currículum para activar la IA de SkillRadar, encontrar matches de
                                trabajo y realizar simulaciones.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <Link href="/dashboard/cv-analysis">
                                <Button className="gap-2">
                                    Subir mi primer CV
                                    <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    resumes.map((resume) => (
                        <Card
                            key={resume.id}
                            className={`border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:bg-card/60 relative overflow-hidden ${
                                resume.isActive ? "ring-2 ring-primary/40 bg-primary/[0.02]" : ""
                            }`}
                        >
                            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`p-3 rounded-xl shrink-0 ${
                                            resume.isActive
                                                ? "bg-primary/20 text-primary"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        <FileText className="size-6" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <h3 className="font-semibold text-base text-foreground truncate max-w-md sm:max-w-lg">
                                            {resume.fileName}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="size-3.5" />
                                                {resume.createdAt.toLocaleDateString()}
                                            </span>
                                            {resume.atsScore !== null && (
                                                <span className="flex items-center gap-1 text-emerald-500 font-medium">
                                                    <Award className="size-3.5" />
                                                    ATS Score: {resume.atsScore}/100
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    {resume.isActive ? (
                                        <Badge className="bg-primary/20 text-primary hover:bg-primary/20 gap-1 border-none py-1.5 px-3">
                                            <CheckCircle2 className="size-3.5" />
                                            Activo
                                        </Badge>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => void handleSetActive(resume.id)}
                                            disabled={actionLoading !== null}
                                            className="text-xs"
                                        >
                                            {actionLoading === resume.id ? (
                                                <Loader2 className="size-3.5 animate-spin" />
                                            ) : (
                                                "Hacer activo"
                                            )}
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => void handleDeleteClick(resume.id)}
                                        disabled={actionLoading !== null}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                                    >
                                        {actionLoading === resume.id ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Diálogo Modal de Confirmación de Borrado por Cascada */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            Eliminación de Historial
                        </DialogTitle>
                        <DialogDescription className="space-y-3 pt-2">
                            <p>
                                Este currículum no se puede borrar de forma aislada porque tiene datos de análisis e
                                interacciones históricas asociados a tu cuenta.
                            </p>
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-foreground space-y-1.5">
                                <p className="font-semibold text-destructive">
                                    Se eliminarán los siguientes registros:
                                </p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    {warnData && warnData.matches > 0 && (
                                        <li>
                                            {warnData.matches} {warnData.matches === 1 ? "Job Match" : "Job Matches"}
                                        </li>
                                    )}
                                    {warnData && warnData.interviews > 0 && (
                                        <li>
                                            {warnData.interviews}{" "}
                                            {warnData.interviews === 1
                                                ? "Sesión de entrevista"
                                                : "Sesiones de entrevista"}
                                        </li>
                                    )}
                                    {warnData && warnData.applications > 0 && (
                                        <li>
                                            {warnData.applications}{" "}
                                            {warnData.applications === 1
                                                ? "Postulación de empleo"
                                                : "Postulaciones de empleo"}
                                        </li>
                                    )}
                                </ul>
                            </div>
                            <p className="text-xs text-muted-foreground font-semibold">
                                ¿Estás completamente seguro de proceder? Esta acción es irreversible.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setDeleteTarget(null);
                                setWarnData(null);
                            }}
                            disabled={actionLoading !== null}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => void handleForceDelete()}
                            disabled={actionLoading !== null}
                            className="gap-2"
                        >
                            {actionLoading !== null && <Loader2 className="size-4 animate-spin" />}
                            Sí, Eliminar Todo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
