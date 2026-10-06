"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Mail } from "lucide-react";
import { cn } from "@/shared-kernel/utils";
import type { Application } from "./application.types";
import { getContactBadge, getScoreColor } from "./application-badges";

interface ApplicationKanbanCardProps {
    app: Application;
    onOpenDetails: (app: Application) => void;
    onContact: (developerId: string) => void;
}

/** Tarjeta compacta del kanban (ex bloque del screen monolítico). */
export function ApplicationKanbanCard({ app, onOpenDetails, onContact }: ApplicationKanbanCardProps) {
    const dev = app.developer;
    const isRevealed = app.contactStatus === "accepted";
    const score = app.resume?.atsScore ?? app.matchScore;

    return (
        <div
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
                <Badge className={cn("text-[9px] px-1.5 py-0.5 rounded-md border-none", getScoreColor(score))}>
                    {score}%
                </Badge>
            </div>
            <div className="text-[10px] text-muted-foreground flex flex-col gap-1">
                <span className="truncate">{app.resume?.fileName || "Sin CV cargado"}</span>
                <div className="mt-1 flex items-center justify-between">{getContactBadge(app.contactStatus)}</div>
            </div>
            <div className="flex justify-end gap-1 pt-1.5 border-t border-border/40">
                <Button
                    onClick={() => onOpenDetails(app)}
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] gap-1 px-2 hover:bg-muted"
                >
                    <Eye className="size-3" />
                    Ver
                </Button>
                {!isRevealed && app.contactStatus === "none" && (
                    <Button
                        onClick={() => onContact(dev.id)}
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
}
