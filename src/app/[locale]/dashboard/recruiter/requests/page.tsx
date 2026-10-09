import { auth } from "@/infrastructure/auth";
import { isGuestSession } from "@/infrastructure/guest-guard";
import { redirect } from "next/navigation";
import { getSentContactRequestsAction } from "@/features/recruiter/application/recruiter.use-cases";
import { getTranslations } from "next-intl/server";
import { RequestsClientPage } from "@/features/recruiter/presentation/recruiter-requests.client";
import { ContactThread } from "@/features/contact-thread/presentation/contact-thread.panel";
import { GuestInboxPreview } from "@/features/recruiter/presentation/guest-recruiter-demos";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Inbox" });
    return { title: `${t("title")} | SkillRadar` };
}

export default async function RecruiterRequestsPage() {
    const session = await auth();
    if (!session?.user) redirect("/");
    if (session.user.role !== "recruiter") redirect("/dashboard");
    // Modo Guest: preview de solo lectura con mocks (sin DB ni acciones).
    if (isGuestSession(session)) return <GuestInboxPreview />;

    const res = await getSentContactRequestsAction();

    return (
        <RequestsClientPage
            initial={res.success ? res.data : []}
            renderThread={(requestId) => <ContactThread requestId={requestId} />}
        />
    );
}
