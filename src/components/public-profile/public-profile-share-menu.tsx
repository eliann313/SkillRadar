"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Copy, Check, Code2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface PublicProfileShareMenuProps {
    username: string;
    variant?: "default" | "outline" | "secondary" | "ghost";
    size?: "default" | "sm" | "xs" | "lg";
}

function LinkedInIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
    );
}

function XTwitterIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

export function PublicProfileShareMenu({ username, variant = "outline", size = "sm" }: PublicProfileShareMenuProps) {
    const t = useTranslations("PublicProfile");
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedBadge, setCopiedBadge] = useState(false);

    const getOrigin = () => (typeof window !== "undefined" ? window.location.origin : "");
    const publicUrl = `${getOrigin()}/u/${username}`;
    const badgeMarkdown = `[![SkillRadar](${getOrigin()}/api/badge/${username})](${publicUrl})`;

    const handleCopyLink = () => {
        navigator.clipboard
            .writeText(publicUrl)
            .then(() => {
                setCopiedLink(true);
                toast.success(t("shareSuccess", { default: "Enlace copiado al portapapeles" }));
                setTimeout(() => setCopiedLink(false), 2000);
            })
            .catch(() => {
                toast.error("Error al copiar enlace");
            });
    };

    const handleCopyBadge = () => {
        navigator.clipboard
            .writeText(badgeMarkdown)
            .then(() => {
                setCopiedBadge(true);
                toast.success(t("badgeCopied", { default: "Markdown del badge copiado" }));
                setTimeout(() => setCopiedBadge(false), 2000);
            })
            .catch(() => {
                toast.error("Error al copiar badge");
            });
    };

    const handleShareLinkedIn = () => {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
        window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=600");
    };

    const handleShareTwitter = () => {
        const text = `¡Comprueba mi Skill Radar técnico y habilidades validadas en @SkillRadar!`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(publicUrl)}`;
        window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=600");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant={variant} size={size} className="gap-1.5">
                        <Share2 className="size-3.5" />
                        <span>{t("shareProfile", { default: "Compartir" })}</span>
                    </Button>
                }
            />
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
                    {copiedLink ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                    <span>{t("copyLink", { default: "Copiar enlace directo" })}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleShareLinkedIn} className="gap-2 cursor-pointer">
                    <LinkedInIcon className="size-4 text-[#0077B5]" />
                    <span>{t("shareLinkedIn", { default: "Compartir en LinkedIn" })}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleShareTwitter} className="gap-2 cursor-pointer">
                    <XTwitterIcon className="size-4 text-foreground" />
                    <span>{t("shareTwitter", { default: "Compartir en X (Twitter)" })}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleCopyBadge} className="gap-2 cursor-pointer">
                    {copiedBadge ? <Check className="size-4 text-emerald-500" /> : <Code2 className="size-4" />}
                    <span>{t("copyBadge", { default: "Copiar Badge (Markdown)" })}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
