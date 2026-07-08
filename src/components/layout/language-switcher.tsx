"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const changeLocale = (nextLocale: "es" | "en") => {
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-accent hover:text-accent-foreground size-9"
                        aria-label="Select language"
                    >
                        <Globe className="h-[1.2rem] w-[1.2rem] text-muted-foreground hover:text-foreground transition-colors" />
                    </Button>
                }
            />
            <DropdownMenuContent align="end" className="min-w-[110px]">
                <DropdownMenuItem
                    onClick={() => changeLocale("es")}
                    className={locale === "es" ? "bg-accent font-semibold" : ""}
                >
                    Español
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => changeLocale("en")}
                    className={locale === "en" ? "bg-accent font-semibold" : ""}
                >
                    English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
