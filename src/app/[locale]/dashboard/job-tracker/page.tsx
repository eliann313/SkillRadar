import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobTrackerService } from "@/features/job-tracker/service";
import { KanbanBoard } from "@/components/job-tracker/kanban-board";
import {
    createJobApplicationAction,
    updateJobApplicationStatusAction,
    deleteJobApplicationAction,
} from "@/features/job-tracker/actions";
import { getTranslations } from "next-intl/server";

export default async function JobTrackerPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    if (session.user.role !== "developer") {
        redirect("/dashboard");
    }

    const t = await getTranslations("JobTracker");

    // Carga inicial de postulaciones desde el servidor
    const applications = await JobTrackerService.getJobApplications(session.user.id);

    // Mapear los handlers de Server Actions para pasarlos al componente cliente
    const handleCreate = async (data: { title: string; company: string; url?: string; status: string }) => {
        "use server";
        return await createJobApplicationAction(data);
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        "use server";
        return await updateJobApplicationStatusAction(id, status);
    };

    const handleDelete = async (id: string) => {
        "use server";
        return await deleteJobApplicationAction(id);
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("description")}</p>
            </div>

            <KanbanBoard
                initialApplications={applications}
                onCreate={handleCreate}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
            />
        </div>
    );
}
