import { auth } from "@/infrastructure/auth";
import { redirect } from "next/navigation";
import { JobPostingService } from "@/features/jobs/application/jobs.service";
import { PostingsClientPage } from "@/features/jobs/presentation/recruiter-postings.client";

import type { JobPostingWithCount } from "@/features/jobs/domain/jobs.types";

export default async function RecruiterPostingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    if (session.user.role !== "recruiter") {
        redirect("/dashboard");
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
