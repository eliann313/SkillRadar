/* eslint-disable @next/next/no-img-element -- avatares externos de usuario sin loader configurado */
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Mail, Star, TrendingUp, Award, HelpCircle, Clock } from "lucide-react";
import { cn } from "@/shared-kernel/utils";
import { getSeniorityColor } from "@/shared-kernel/seniority";
import type { TalentCard } from "@/shared-kernel/types";

interface TalentCardProps {
    talent: TalentCard;
    highlighted: boolean;
    compared: boolean;
    onToggleCompare: (id: string, checked: boolean) => void;
    onToggleShortlist: (id: string) => void;
    onOpenDetail: (talent: TalentCard) => void;
    onContact: (talent: TalentCard) => void;
}

const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald";
    if (score >= 75) return "text-primary";
    if (score >= 60) return "text-warning";
    return "text-muted-foreground";
};

const formatLastActive = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

/** Tarjeta de talento del pool (ex bloque del dashboard monolítico). */
export function TalentCardView({
    talent,
    highlighted,
    compared,
    onToggleCompare,
    onToggleShortlist,
    onOpenDetail,
    onContact,
}: TalentCardProps) {
    const isAccepted = talent.contactStatus === "accepted";
    const isPending = talent.contactStatus === "pending";

    return (
        <Card
            className={cn(
                "group border-border/50 bg-card/50 backdrop-blur-xs transition-all flex flex-col justify-between",
                highlighted
                    ? "hover:border-primary/40 hover:bg-card/80 border-primary/20 bg-primary/0"
                    : "hover:border-indigo/40 hover:bg-card/80",
            )}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {isAccepted && talent.image ? (
                            <img
                                src={talent.image}
                                alt={talent.name || "Developer"}
                                className="size-10 rounded-full border border-border object-cover shrink-0"
                            />
                        ) : (
                            <div className="flex size-10 items-center justify-center rounded-full bg-indigo/10 border border-indigo/20 text-indigo font-bold text-xs shrink-0">
                                🔒
                            </div>
                        )}
                        <div>
                            <CardTitle className="font-mono text-sm text-muted-foreground flex items-center gap-1.5">
                                {talent.anonymousId}
                                {isAccepted && (
                                    <Badge
                                        variant="outline"
                                        className="bg-emerald/10 text-emerald border-emerald/20 text-[10px] px-1 py-0 capitalize"
                                    >
                                        Aceptado
                                    </Badge>
                                )}
                            </CardTitle>
                            <h3 className="text-sm font-semibold text-foreground mt-0.5">
                                {isAccepted ? talent.name : "Perfil Doble Ciego"}
                            </h3>
                        </div>
                    </div>

                    <div className="text-right flex items-start gap-2">
                        <div>
                            <div className="flex items-center justify-end gap-1">
                                <TrendingUp className="size-4 text-muted-foreground" />
                                <span className={cn("text-xl font-bold", getScoreColor(talent.averageScore))}>
                                    {talent.averageScore}%
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Match Score</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-warning hover:bg-transparent shrink-0"
                            aria-label={talent.isShortlisted ? "Quitar de shortlist" : "Guardar en shortlist"}
                            onClick={(e) => {
                                e.stopPropagation();
                                void onToggleShortlist(talent.id);
                            }}
                        >
                            <Star
                                className={cn(
                                    "size-4",
                                    talent.isShortlisted ? "fill-warning text-warning" : "text-muted-foreground",
                                )}
                            />
                        </Button>
                        <input
                            type="checkbox"
                            title="Agregar al comparador"
                            className="size-4 accent-primary"
                            checked={compared}
                            onChange={(e) => {
                                e.stopPropagation();
                                onToggleCompare(talent.id, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                    <Badge
                        className={cn(
                            "capitalize text-[10px] font-medium px-2 py-0.5",
                            getSeniorityColor(
                                talent.estimatedSeniority,
                                "bg-secondary text-secondary-foreground border-border",
                            ),
                        )}
                        variant="outline"
                    >
                        <Award className="mr-1 size-3" />
                        {talent.estimatedSeniority}
                    </Badge>
                    {isPending && (
                        <Badge
                            className="bg-amber/10 text-amber border-amber/20 text-[10px] px-2 py-0.5"
                            variant="outline"
                        >
                            Pendiente
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-1 justify-between">
                <div className="space-y-3">
                    {talent.justification && (
                        <div className="rounded-md bg-primary/5 border border-primary/10 p-2.5 text-xs text-foreground/90">
                            <p className="font-semibold text-primary mb-1 flex items-center gap-1">
                                <HelpCircle className="size-3.5" />
                                Razonamiento IA:
                            </p>
                            <p className="leading-relaxed font-sans">{talent.justification}</p>
                        </div>
                    )}

                    <div>
                        <p className="mb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Top Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {talent.topSkills.map((skill) => (
                                <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="text-[10px] bg-secondary/80 text-secondary-foreground"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {isAccepted && (
                        <div className="rounded-md bg-muted/30 border border-border/50 p-2.5 text-xs space-y-1.5">
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                                <Mail className="size-3.5 text-primary" />
                                Datos de Contacto:
                            </p>
                            <p className="text-muted-foreground select-all">{talent.email}</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="size-3" />
                        <span>Actualizado {formatLastActive(talent.lastActive)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() => {
                                onOpenDetail(talent);
                            }}
                        >
                            <Eye className="size-3.5" />
                            Análisis
                        </Button>

                        {isAccepted ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs border-emerald/30 text-emerald hover:bg-emerald/10"
                                onClick={() => {
                                    window.location.href = `mailto:${talent.email}`;
                                }}
                            >
                                <Mail className="size-3.5" />
                                Enviar Mail
                            </Button>
                        ) : isPending ? (
                            <Button variant="secondary" size="sm" disabled className="h-8 gap-1.5 text-xs opacity-70">
                                Propuesta Enviada
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs hover:border-primary/50 hover:text-primary transition-colors"
                                onClick={() => {
                                    onContact(talent);
                                }}
                            >
                                Solicitar Contacto
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
