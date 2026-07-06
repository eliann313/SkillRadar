import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobPostingService } from "@/features/jobs/service";
import { JobsClientPage } from "./client-page";

import type { JobPostingWithMatch } from "@/features/jobs/actions";

export default async function DeveloperJobsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    if (session.user.role !== "developer") {
        redirect("/dashboard");
    }

    // Carga inicial sin filtros
    const jobs = await JobPostingService.getDeveloperJobBoard(session.user.id);

    const serializedJobs = jobs.map((job: JobPostingWithMatch) => ({
        ...job,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
    }));

    return <JobsClientPage initialJobs={serializedJobs} />;
}
