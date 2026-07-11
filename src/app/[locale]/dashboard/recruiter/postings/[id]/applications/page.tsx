import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobPostingService } from "@/features/jobs/service";
import { db } from "@/lib/db";
import type { Application } from "./client-page";
import { ApplicationsClientPage } from "./client-page";

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
                  analysis:
                      typeof app.resume.analysis === "string" ? JSON.parse(app.resume.analysis) : app.resume.analysis,
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
