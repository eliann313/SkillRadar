"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eye, Mail, Shield, Award, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/shared-kernel/utils";
import type { Application } from "./application.types";
import { getContactBadge, getScoreColor, getStatusBadge } from "./application-badges";
import { formatApplicationDate } from "./application-dates";

interface ApplicationListCardProps {
    app: Application;
    onOpenDetails: (app: Application) => void;
    onContact: (developerId: string) => void;
    onStatusChange: (appId: string, status: string) => void;
}

/** Tarjeta detallada del listado (ex bloque del screen monolítico). */
export function ApplicationListCard({ app, onOpenDetails, onContact, onStatusChange }: ApplicationListCardProps) {
    const dev = app.developer;
    const isRevealed = app.contactStatus === "accepted";
    const skills: string[] = app.resume?.analysis?.keywords || [];

    return (
        <Card className="border border-border p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
                    <span>Postulado el {formatApplicationDate(app.createdAt)}</span>
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
                        onClick={() => onOpenDetails(app)}
                        className="flex items-center gap-1"
                    >
                        <Eye className="size-3.5" />
                        <span>Ver Análisis</span>
                    </Button>

                    {!isRevealed && app.contactStatus === "none" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onContact(dev.id)}
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
                                void onStatusChange(app.id, "reviewed");
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
                                    void onStatusChange(app.id, "shortlisted");
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
                                    void onStatusChange(app.id, "rejected");
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
}
