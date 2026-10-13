"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Eye, ArrowLeft, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared-kernel/utils";
import { PublicProfileShareMenu } from "./public-profile-share-menu";

interface PublicProfileOwnerBannerProps {
    username: string;
}

export function PublicProfileOwnerBanner({ username }: PublicProfileOwnerBannerProps) {
    const t = useTranslations("PublicProfile");

    return (
        <div className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/85 backdrop-blur-md px-4 py-2.5 transition-colors">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Eye className="size-3.5" />
                    </span>
                    <span>
                        {t("ownerBannerTitle", {
                            default: "Estás viendo tu propio perfil público en modo vista previa",
                        })}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/progress"
                        className={cn(buttonVariants({ variant: "ghost", size: "xs" }), "gap-1 text-xs")}
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>{t("ownerBannerBack", { default: "Volver a Progreso" })}</span>
                    </Link>

                    <Link
                        href="/dashboard/settings"
                        className={cn(buttonVariants({ variant: "outline", size: "xs" }), "gap-1 text-xs")}
                    >
                        <Settings className="size-3.5" />
                        <span>{t("ownerBannerSettings", { default: "Ajustes de Visibilidad" })}</span>
                    </Link>

                    <PublicProfileShareMenu username={username} variant="default" size="xs" />
                </div>
            </div>
        </div>
    );
}
