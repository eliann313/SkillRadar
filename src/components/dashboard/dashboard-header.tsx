"use client";

import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";

export function DashboardHeader() {
    const { data: session } = useSession();
    const user = session?.user;
    const t = useTranslations("DashboardHeader");
    const locale = useLocale();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t("greetingMorning");
        if (hour < 18) return t("greetingAfternoon");
        return t("greetingEvening");
    };

    const formatDate = () => {
        return new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const firstName = user?.name?.split(" ")[0] || "Developer";

    return (
        <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {getGreeting()}, {firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{formatDate()}</p>
        </div>
    );
}
