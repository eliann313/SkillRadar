"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { JobTrackerService } from "./service";
import { jobApplicationSchema, type ActionResult } from "./types";
import type { JobApplication } from "@prisma/client";
import { z } from "zod";

const statusSchema = z.enum(["to_apply", "applied", "interviewing", "offer"]);

export async function getJobApplicationsAction(): Promise<ActionResult<JobApplication[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        const data = await JobTrackerService.getJobApplications(session.user.id);
        return { success: true, data };
    } catch (error: unknown) {
        console.error("[getJobApplicationsAction] Error:", error);
        return { success: false, error: "Error al recuperar tus postulaciones." };
    }
}

export async function createJobApplicationAction(input: unknown): Promise<ActionResult<JobApplication>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
        }

        const result = jobApplicationSchema.safeParse(input);
        if (!result.success) {
            const firstError = result.error.issues[0]?.message || "Datos inválidos";
            return { success: false, error: firstError };
        }

        const { checkWriteRateLimit } = await import("@/lib/rate-limit");
        if (!(await checkWriteRateLimit(`user:${session.user.id}`)).success) {
            return { success: false, error: "Límite diario de escritura alcanzado." };
        }

        const application = await JobTrackerService.createJobApplication({
            userId: session.user.id,
            title: result.data.title,
            company: result.data.company,
            url: result.data.url || undefined,
            status: result.data.status,
        });

        revalidatePath("/dashboard/job-tracker");
        return { success: true, data: application };
    } catch (error: unknown) {
        console.error("[createJobApplicationAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al crear la postulación.",
        };
    }
}

export async function updateJobApplicationStatusAction(
    id: string,
    status: string,
): Promise<ActionResult<JobApplication>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const parsed = statusSchema.safeParse(status);
        if (!parsed.success) {
            return { success: false, error: "Estado inválido." };
        }

        const updated = await JobTrackerService.updateJobApplicationStatus(id, session.user.id, parsed.data);
        revalidatePath("/dashboard/job-tracker");
        return { success: true, data: updated };
    } catch (error: unknown) {
        console.error("[updateJobApplicationStatusAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al actualizar el estado de la postulación.",
        };
    }
}

export async function deleteJobApplicationAction(id: string): Promise<ActionResult<boolean>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        await JobTrackerService.deleteJobApplication(id, session.user.id);
        revalidatePath("/dashboard/job-tracker");
        return { success: true, data: true };
    } catch (error: unknown) {
        console.error("[deleteJobApplicationAction] Error:", error);
        return { success: false, error: "Error al eliminar la postulación." };
    }
}
