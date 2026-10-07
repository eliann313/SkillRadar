import { auth } from "@/infrastructure/auth";
import { isGuestSession } from "@/infrastructure/guest-guard";
import { redirect } from "next/navigation";
import { listTemplatesAction } from "@/features/outreach-templates/application/outreach-templates.use-cases";
import { getTranslations } from "next-intl/server";
import { TemplatesClientPage } from "@/features/outreach-templates/presentation/outreach-templates.client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Templates" });
    return { title: `${t("title")} | SkillRadar` };
}

export default async function RecruiterTemplatesPage() {
    const session = await auth();
    if (!session?.user) redirect("/");
    if (session.user.role !== "recruiter") redirect("/dashboard");
    // Modo Guest: sin DB ni acciones — volvemos al preview de solo lectura.
    if (isGuestSession(session)) redirect("/dashboard");

    const res = await listTemplatesAction();

    return <TemplatesClientPage initial={res.success ? res.data : []} />;
}
