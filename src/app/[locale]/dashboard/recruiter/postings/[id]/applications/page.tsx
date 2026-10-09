import { auth } from "@/infrastructure/auth";
import { isGuestSession } from "@/infrastructure/guest-guard";
import { redirect } from "next/navigation";
import { JobPostingService } from "@/features/jobs/application/jobs.service";
import { db } from "@/infrastructure/db";
import { safeParseJson } from "@/shared-kernel/pii";
import type { Application } from "./job-applications.screen";
import { ApplicationsClientPage } from "./job-applications.screen";
import { GuestApplicationsPreview } from "@/features/recruiter/presentation/guest-recruiter-demos";
import { demoPostings } from "@/mocks/demo-data";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function JobPostingApplicationsPage({ params }: Props) {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    if (session.user.role !== "recruiter") {
        redirect("/dashboard");
    }

    const { id: jobPostingId } = await params;

    // Modo Guest: preview de solo lectura con mocks (sin DB ni acciones).
    if (isGuestSession(session)) {
        const demo = demoPostings.find((p) => p.id === jobPostingId) ?? demoPostings[0];
        return <GuestApplicationsPreview postingTitle={demo.title} />;
    }

    // Obtener detalles de la oferta
    const jobPosting = await db.jobPosting.findUnique({
        where: { id: jobPostingId },
        select: { title: true, company: true, recruiterId: true },
    });

    if (!jobPosting) {
        redirect("/dashboard/recruiter/postings");
    }

    if (jobPosting.recruiterId !== session.user.id) {
        redirect("/dashboard/recruiter/postings");
    }

    const applications = await JobPostingService.getJobPostingApplications(session.user.id, jobPostingId);

    // Serializar fechas
    const serializedApplications = applications.map((app) => ({
        ...app,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        developer: {
            ...app.developer,
            name: app.developer.name || "Desarrollador Anónimo",
            email: app.developer.email || "",
            image: app.developer.image || null,
            anonymousId: `DEV-${app.developer.id.slice(-4).toUpperCase()}`,
        },
        resume: app.resume
            ? {
                  ...app.resume,
                  analysis: safeParseJson<Record<string, unknown>>(app.resume.analysis, null),
              }
            : null,
    })) as unknown as Application[];

    return (
        <ApplicationsClientPage
            jobTitle={jobPosting.title}
            companyName={jobPosting.company}
            jobPostingId={jobPostingId}
            initialApplications={serializedApplications}
        />
    );
}
