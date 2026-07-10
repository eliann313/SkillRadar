"use client";

import { useState } from "react";
import type { JobApplication } from "@prisma/client";
import { Plus, Trash2, ExternalLink, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface KanbanBoardProps {
    initialApplications: JobApplication[];
    onCreate: (data: {
        title: string;
        company: string;
        url?: string;
        status: string;
    }) => Promise<{ success: boolean; error?: string }>;
    onUpdateStatus: (id: string, status: string) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const COLUMNS = [
    { id: "to_apply", color: "border-t-muted-foreground/30 bg-muted/5" },
    { id: "applied", color: "border-t-primary/40 bg-primary/0" },
    { id: "interviewing", color: "border-t-warning/40 bg-warning/0" },
    { id: "offer", color: "border-t-emerald/40 bg-emerald/0" },
];

export function KanbanBoard({ initialApplications, onCreate, onUpdateStatus, onDelete }: KanbanBoardProps) {
    const t = useTranslations("JobTracker");
    const [apps, setApps] = useState<JobApplication[]>(initialApplications);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [activeColumn, setActiveColumn] = useState<string>("to_apply");
    const [newApp, setNewApp] = useState({ title: "", company: "", url: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draggedId, setDraggedId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const id = draggedId || e.dataTransfer.getData("text/plain");
        if (!id) return;

        // Local state update for immediate feedback
        const originalApps = [...apps];
        const targetApp = apps.find((a) => a.id === id);
        if (!targetApp || targetApp.status === status) return;

        setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date() } : a)));

        const res = await onUpdateStatus(id, status);
        if (!res.success) {
            toast.error(res.error || t("moveError"));
            setApps(originalApps); // Rollback
        } else {
            toast.success(t("moveSuccess", { column: t(status) }));
        }
        setDraggedId(null);
    };

    const handleCreateApp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newApp.title.trim() || !newApp.company.trim()) {
            toast.error(t("requiredFieldsError"));
            return;
        }

        setIsSubmitting(true);
        const res = await onCreate({
            title: newApp.title,
            company: newApp.company,
            url: newApp.url || undefined,
            status: activeColumn,
        });

        if (res.success) {
            // Re-fetch or add directly (since Server Actions revalidate, we can just append if returned, or we rely on Next.js page refresh)
            toast.success(t("createSuccess"));
            setIsAddDialogOpen(false);
            setNewApp({ title: "", company: "", url: "" });

            // Recargar la página/estado local
            // Para simplificar, recargamos la página o actualizamos el estado si sabemos que fue exitoso
            window.location.reload();
        } else {
            toast.error(res.error || t("createError"));
        }
        setIsSubmitting(false);
    };

    const handleDeleteApp = async (id: string) => {
        const originalApps = [...apps];
        setApps((prev) => prev.filter((a) => a.id !== id));

        const res = await onDelete(id);
        if (!res.success) {
            toast.error(res.error || t("deleteError"));
            setApps(originalApps); // Rollback
        } else {
            toast.success(t("deleteSuccess"));
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>
                    <p className="text-xs text-muted-foreground">{t("description")}</p>
                </div>
                <Button
                    onClick={() => {
                        setActiveColumn("to_apply");
                        setIsAddDialogOpen(true);
                    }}
                    className="gap-1.5 cursor-pointer"
                >
                    <Plus className="size-4" />
                    {t("newApplication")}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {COLUMNS.map((column) => {
                    const columnApps = apps.filter((a) => a.status === column.id);

                    return (
                        <div
                            key={column.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                                void handleDrop(e, column.id);
                            }}
                            className={cn(
                                "flex flex-col rounded-xl border border-border bg-card/25 p-3 min-h-[500px] transition-colors duration-200 border-t-4",
                                column.color,
                            )}
                        >
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    {t(column.id)}
                                    <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                        {columnApps.length}
                                    </span>
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={() => {
                                        setActiveColumn(column.id);
                                        setIsAddDialogOpen(true);
                                    }}
                                >
                                    <Plus className="size-3.5" />
                                    <span className="sr-only">{t("addAppTo", { column: t(column.id) })}</span>
                                </Button>
                            </div>

                            <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                                {columnApps.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border border-dashed border-border/60 bg-muted/5 flex-1 text-center">
                                        <p className="text-[11px] text-muted-foreground">{t("emptyColumn")}</p>
                                    </div>
                                ) : (
                                    columnApps.map((app) => (
                                        <div
                                            key={app.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, app.id)}
                                            className="group relative rounded-lg border border-border/80 bg-card/85 p-3.5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm cursor-grab active:cursor-grabbing hover:bg-card flex flex-col gap-2"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-foreground truncate">
                                                        {app.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                                                        <Building2 className="size-3 shrink-0" />
                                                        {app.company}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                                                        onClick={() => void handleDeleteApp(app.id)}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                        <span className="sr-only">{t("deleteApp")}</span>
                                                    </Button>
                                                </div>
                                            </div>

                                            {app.url && (
                                                <div className="flex items-center justify-between mt-1 text-[10px] text-primary font-medium border-t border-border/50 pt-2">
                                                    <a
                                                        href={app.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 hover:underline"
                                                    >
                                                        <ExternalLink className="size-3" />
                                                        {t("viewOffer")}
                                                    </a>
                                                    <span className="text-muted-foreground/50 text-[9px] font-mono select-none">
                                                        #{app.id.slice(-4).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dialog para agregar nueva postulación */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t("newApplication")}</DialogTitle>
                        <DialogDescription>{t("addAppDesc")}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => void handleCreateApp(e)} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <label htmlFor="title" className="text-xs font-semibold text-foreground">
                                {t("roleLabel")}
                            </label>
                            <Input
                                id="title"
                                value={newApp.title}
                                onChange={(e) => setNewApp((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="Ej. Senior Frontend Developer"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="company" className="text-xs font-semibold text-foreground">
                                {t("companyLabel")}
                            </label>
                            <Input
                                id="company"
                                value={newApp.company}
                                onChange={(e) => setNewApp((prev) => ({ ...prev, company: e.target.value }))}
                                placeholder="Ej. Stripe"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="url" className="text-xs font-semibold text-foreground">
                                {t("urlLabel")}
                            </label>
                            <Input
                                id="url"
                                value={newApp.url}
                                onChange={(e) => setNewApp((prev) => ({ ...prev, url: e.target.value }))}
                                placeholder="https://example.com/job"
                                type="url"
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                                disabled={isSubmitting}
                                className="cursor-pointer"
                            >
                                {t("cancel")}
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        {t("saving")}
                                    </>
                                ) : (
                                    t("add")
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
