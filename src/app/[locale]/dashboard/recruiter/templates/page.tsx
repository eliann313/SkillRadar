import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listTemplatesAction } from "@/features/outreach-templates/actions";
import { getTranslations } from "next-intl/server";
import { TemplatesClientPage } from "./client-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Templates" });
    return { title: `${t("title")} | SkillRadar` };
}

export default async function RecruiterTemplatesPage() {
    const session = await auth();
    if (!session?.user) redirect("/");
    if (session.user.role !== "recruiter") redirect("/dashboard");

    const res = await listTemplatesAction();

    return <TemplatesClientPage initial={res.success ? res.data : []} />;
}
