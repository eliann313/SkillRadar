"use client";

import { useState, useSyncExternalStore } from "react";
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

const emptySubscribe = () => () => {};

export function PublicProfileShareCard({ publicProfile }: PublicProfileShareCardProps) {
    const t = useTranslations("Progress");
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedBadge, setCopiedBadge] = useState(false);
    const origin = useSyncExternalStore(
        emptySubscribe,
        () => (typeof window !== "undefined" ? window.location.origin : ""),
        () => "",
    );

    const isPublic = Boolean(publicProfile?.isPublicProfile && publicProfile?.publicUsername);
    const username = publicProfile?.publicUsername || "";
    const publicPath = username ? `/u/${username}` : "";
    const displayUrl = origin ? `${origin}${publicPath}` : publicPath;

    const handleCopyLink = () => {
        if (!username) return;
        const currentOrigin = typeof window !== "undefined" ? window.location.origin : origin;
        const fullUrl = `${currentOrigin}/u/${username}`;
        navigator.clipboard
            .writeText(fullUrl)
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
        if (!username) return;
        const currentOrigin = typeof window !== "undefined" ? window.location.origin : origin;
        const badgeMarkdown = `[![SkillRadar](${currentOrigin}/api/badge/${username})](${currentOrigin}/u/${username})`;
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
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm flex flex-col h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Globe className="size-5 text-primary" />
                        {t("publicProfileCardTitle", { default: "Tu Perfil Público y Badge" })}
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

            <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-1">
                {isPublic ? (
                    <>
                        <div className="space-y-4">
                            {/* URL Pública */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Globe className="size-3.5 text-primary" />
                                    <span>
                                        {t("publicProfileUrlLabel", { default: "Enlace a tu perfil público:" })}
                                    </span>
                                </label>
                                <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5 flex items-center justify-between gap-2">
                                    <span
                                        className="font-mono text-xs text-foreground/90 truncate"
                                        suppressHydrationWarning
                                    >
                                        {displayUrl}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="secondary"
                                            size="xs"
                                            onClick={handleCopyLink}
                                            className="h-7 px-2.5 text-xs gap-1"
                                            title={t("copyPublicLink", { default: "Copiar enlace" })}
                                        >
                                            {copiedLink ? (
                                                <>
                                                    <Check className="size-3 text-emerald-500" />
                                                    <span className="text-emerald-500 font-medium">
                                                        {t("copied", { default: "Copiado" })}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3" />
                                                    <span>{t("copy", { default: "Copiar" })}</span>
                                                </>
                                            )}
                                        </Button>
                                        <Link
                                            href={`/u/${username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center size-7 rounded-md hover:bg-muted/60 transition-colors"
                                            title={t("viewPublicProfile", { default: "Ver perfil público" })}
                                            aria-label={t("viewPublicProfile", { default: "Ver perfil público" })}
                                        >
                                            <ExternalLink className="size-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Previsualización del Badge SVG */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                                        <Sparkles className="size-3.5 text-primary" />
                                        GitHub README Badge:
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="xs"
                                        onClick={handleCopyBadge}
                                        className="h-7 px-2.5 text-xs gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                                    >
                                        {copiedBadge ? (
                                            <>
                                                <Check className="size-3.5 text-emerald-500" />
                                                <span className="text-emerald-500 font-semibold">
                                                    {t("copied", { default: "Copiado" })}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Code2 className="size-3.5 text-primary" />
                                                <span>{t("copyBadgeMarkdown", { default: "Copiar Markdown" })}</span>
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Preview container */}
                                <div className="p-3 rounded-xl bg-background/90 border border-border/60 shadow-xs flex flex-col items-center justify-center gap-2 group relative overflow-hidden">
                                    <div className="w-full flex items-center justify-center py-1">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={`/api/badge/${username}`}
                                            alt="SkillRadar Badge preview"
                                            className="w-full max-w-[440px] h-auto rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-[1.01]"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>

                                {/* Código Markdown interactivo */}
                                <div className="rounded-lg border border-border/40 bg-muted/30 p-2 font-mono text-[11px] text-muted-foreground flex items-center justify-between gap-2 overflow-hidden">
                                    <span className="truncate select-all text-slate-300">
                                        {`[![SkillRadar](${origin || "https://skillradar-app.vercel.app"}/api/badge/${username})](${origin || "https://skillradar-app.vercel.app"}/u/${username})`}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={handleCopyBadge}
                                        className="shrink-0 size-6"
                                        title={t("copyBadgeMarkdown", { default: "Copiar Markdown" })}
                                    >
                                        {copiedBadge ? (
                                            <Check className="size-3 text-emerald-500" />
                                        ) : (
                                            <Copy className="size-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 flex items-center justify-between text-xs border-t border-border/30 mt-auto">
                            <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                <ShieldCheck className="size-3.5 text-emerald-500" />
                                {t("verifiedProfile", { default: "Perfil verificado" })}
                            </span>
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center gap-1.5 text-primary hover:underline text-[11px] font-medium"
                            >
                                <Settings className="size-3.5" />
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
