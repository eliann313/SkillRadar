"use client";

import { useSession } from "next-auth/react";
import { MockInterviewChat } from "@/components/interview";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function InterviewPage() {
    const t = useTranslations("MockInterview");
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (status === "unauthenticated" || !session?.user) {
        redirect("/");
    }

    if (session.user.role !== "developer") {
        redirect("/dashboard");
    }

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
            </div>

            <div className="mx-auto max-w-3xl">
                <MockInterviewChat />
            </div>
        </>
    );
}
