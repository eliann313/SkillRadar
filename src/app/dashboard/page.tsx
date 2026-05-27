import { auth } from "@/lib/auth";
import { DashboardHeader, MetricsGrid } from "@/components/dashboard";
import { TalentDashboard } from "@/components/recruiter";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    // Recruiter dashboard
    if (session.user.role === "recruiter") {
        return <TalentDashboard />;
    }

    // Developer dashboard
    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader />
            <MetricsGrid />
        </div>
    );
}
