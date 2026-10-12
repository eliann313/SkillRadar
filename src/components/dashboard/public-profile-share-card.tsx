"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Copy, Check, ExternalLink, Settings, ShieldCheck, Sparkles, Code2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface PublicProfileShareCardProps {
    publicProfile: {
        isPublicProfile: boolean;
        publicUsername: string | null;
        showSkills: boolean;
        showGithub: boolean;
        showSeniority: boolean;
    } | null;
}

export function PublicProfileShareCard({ publicProfile }: PublicProfileShareCardProps) {
    const t = useTranslations("Progress");
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedBadge, setCopiedBadge] = useState(false);

    const isPublic = Boolean(publicProfile?.isPublicProfile && publicProfile?.publicUsername);
    const username = publicProfile?.publicUsername || "";

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = username ? `${origin}/u/${username}` : "";
    const badgeMarkdown = username ? `[![SkillRadar](${origin}/api/badge/${username})](${origin}/u/${username})` : "";

    const handleCopyLink = () => {
        if (!publicUrl) return;
        navigator.clipboard
            .writeText(publicUrl)
            .then(() => {
                setCopiedLink(true);
                toast.success(t("linkCopied", { default: "Enlace copiado al portapapeles" }));
                setTimeout(() => setCopiedLink(false), 2000);
            })
            .catch(() => {
                toast.error("Error al copiar enlace");
            });
    };

    const handleCopyBadge = () => {
        if (!badgeMarkdown) return;
        navigator.clipboard
            .writeText(badgeMarkdown)
            .then(() => {
                setCopiedBadge(true);
                toast.success(t("badgeCopied", { default: "Markdown del badge copiado al portapapeles" }));
                setTimeout(() => setCopiedBadge(false), 2000);
            })
            .catch(() => {
                toast.error("Error al copiar badge");
            });
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm flex flex-col justify-between h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Globe className="size-5 text-primary" />
                        {t("publicProfileCardTitle", { default: "Tu Perfil Público & Badge" })}
                    </CardTitle>
                    <Badge
                        variant={isPublic ? "default" : "secondary"}
                        className={
                            isPublic
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs font-medium"
                                : "bg-muted text-muted-foreground text-xs font-medium"
                        }
                    >
                        {isPublic
                            ? t("publicProfileActive", { default: "Público" })
                            : t("publicProfileInactive", { default: "Privado" })}
                    </Badge>
                </div>
                <CardDescription>
                    {t("publicProfileCardDesc", {
                        default: "Comparte tus habilidades validadas en GitHub y redes profesionales.",
                    })}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
                {isPublic ? (
                    <>
                        <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-mono text-muted-foreground truncate">{publicUrl}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={handleCopyLink}
                                        title={t("copyPublicLink", { default: "Copiar enlace" })}
                                        aria-label={t("copyPublicLink", { default: "Copiar enlace" })}
                                    >
                                        {copiedLink ? (
                                            <Check className="size-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="size-3.5" />
                                        )}
                                    </Button>
                                    <Link
                                        href={`/u/${username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground inline-flex items-center p-1 rounded-sm hover:bg-muted"
                                        title={t("viewPublicProfile", { default: "Ver perfil público" })}
                                        aria-label={t("viewPublicProfile", { default: "Ver perfil público" })}
                                    >
                                        <ExternalLink className="size-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Previsualización del Badge SVG */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 font-medium">
                                    <Sparkles className="size-3 text-primary" />
                                    GitHub README Badge:
                                </span>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={handleCopyBadge}
                                    className="h-6 px-2 text-xs gap-1"
                                >
                                    {copiedBadge ? (
                                        <>
                                            <Check className="size-3 text-emerald-500" />
                                            <span>Copiado</span>
                                        </>
                                    ) : (
                                        <>
                                            <Code2 className="size-3" />
                                            <span>{t("copyBadgeMarkdown", { default: "Copiar Markdown" })}</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="p-2 rounded-md bg-background/80 border border-border/40 overflow-x-auto flex justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`/api/badge/${username}`}
                                    alt="SkillRadar Badge preview"
                                    className="max-h-20 h-auto rounded"
                                    loading="lazy"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs border-t border-border/30">
                            <span className="flex items-center gap-1 text-muted-foreground text-[11px]">
                                <ShieldCheck className="size-3.5 text-emerald-500" />
                                Perfil verificado
                            </span>
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center gap-1 text-primary hover:underline text-[11px] font-medium"
                            >
                                <Settings className="size-3" />
                                {t("configurePublicProfile", { default: "Configurar visibilidad" })}
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="rounded-lg border border-dashed border-border/80 p-5 text-center space-y-3 bg-muted/10">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                            <Globe className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-foreground">
                                {t("publicProfileInactive", { default: "Perfil público no activado" })}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {t("publicProfileInactiveDesc", {
                                    default:
                                        "Activa tu perfil público en Ajustes para compartir tu Skill Radar y embeber el badge en tu README de GitHub.",
                                })}
                            </p>
                        </div>
                        <Link href="/dashboard/settings">
                            <Button size="sm" variant="default" className="w-full gap-1.5 text-xs">
                                <Settings className="size-3.5" />
                                {t("activatePublicProfile", { default: "Activar en Ajustes" })}
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
