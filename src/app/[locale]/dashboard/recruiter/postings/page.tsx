import { auth } from "@/infrastructure/auth";
import { isGuestSession } from "@/infrastructure/guest-guard";
import { redirect } from "next/navigation";
import { JobPostingService } from "@/features/jobs/application/jobs.service";
import { PostingsClientPage } from "@/features/jobs/presentation/recruiter-postings.client";
import { GuestPostingsPreview } from "@/features/recruiter/presentation/guest-recruiter-demos";

import type { JobPostingWithCount } from "@/features/jobs/domain/jobs.types";

export default async function RecruiterPostingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    if (session.user.role !== "recruiter") {
        redirect("/dashboard");
    }

    // Modo Guest: preview de solo lectura con mocks (sin DB ni acciones),
    // igual que el dev demo que sí puede navegar sus páginas.
    if (isGuestSession(session)) {
        return <GuestPostingsPreview />;
    }

    const postings = await JobPostingService.getRecruiterJobPostings(session.user.id);

    // Convertimos fechas a strings para pasarlas al client component sin problemas de serialización
    const serializedPostings = postings.map((job: JobPostingWithCount) => ({
        ...job,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
    }));

    return <PostingsClientPage initialPostings={serializedPostings} />;
}
