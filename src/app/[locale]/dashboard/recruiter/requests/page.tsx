import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSentContactRequestsAction } from "@/features/recruiter/actions";
import { getTranslations } from "next-intl/server";
import { RequestsClientPage } from "./client-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Inbox" });
    return { title: `${t("title")} | SkillRadar` };
}

export default async function RecruiterRequestsPage() {
    const session = await auth();
    if (!session?.user) redirect("/");
    if (session.user.role !== "recruiter") redirect("/dashboard");

    const res = await getSentContactRequestsAction();

    return <RequestsClientPage initial={res.success ? res.data : []} />;
}
