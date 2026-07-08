"use server";

import { db } from "@/lib/db";
import { assertActiveUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Valida de forma estricta que el usuario tenga rol de Administrador.
 */
async function assertAdmin() {
    const session = await assertActiveUser();
    if (session.user.role !== "admin") {
        throw new Error("No autorizado. Se requiere rol de administrador.");
    }
    return session;
}

/**
 * Obtiene la lista de reportes de contenido pendientes.
 */
export async function getPendingReportsAction(): Promise<ActionResult<unknown[]>> {
    try {
        await assertAdmin();

        const reports = await db.contentReport.findMany({
            where: { status: "pending" },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data: reports };
    } catch (error: unknown) {
        console.error("[getPendingReportsAction] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error al obtener los reportes." };
    }
}

/**
 * Descarta un reporte de contenido pendiente (lo marca como revisado/dismissed).
 */
export async function dismissReportAction(id: string): Promise<ActionResult<boolean>> {
    try {
        await assertAdmin();

        await db.contentReport.update({
            where: { id },
            data: { status: "dismissed" },
        });

        revalidatePath("/dashboard/admin/reports");
        return { success: true, data: true };
    } catch (error: unknown) {
        console.error("[dismissReportAction] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error al descartar el reporte." };
    }
}

/**
 * Suspende la cuenta de un usuario y marca todos sus reportes pendientes como revisados.
 */
export async function suspendUserAction(userId: string, reportIdToDismiss?: string): Promise<ActionResult<boolean>> {
    try {
        await assertAdmin();

        // No permitir suspenderse a sí mismo o a un administrador principal (por seguridad)
        const targetUser = await db.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (targetUser?.role === "admin") {
            return { success: false, error: "No es posible suspender a otra cuenta administradora." };
        }

        // Ejecutar transacción: Suspender usuario y opcionalmente descartar el reporte
        await db.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { isSuspended: true },
            });

            if (reportIdToDismiss) {
                await tx.contentReport.update({
                    where: { id: reportIdToDismiss },
                    data: { status: "reviewed" },
                });
            }
        });

        revalidatePath("/dashboard/admin/reports");
        return { success: true, data: true };
    } catch (error: unknown) {
        console.error("[suspendUserAction] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error al suspender al usuario." };
    }
}

/**
 * Obtiene los datos del funnel de conversión de analíticas basados en usuarios únicos.
 */
export async function getFunnelDataAction(): Promise<
    ActionResult<{
        registered: number;
        uploadedCv: number;
        matchedJob: number;
        appliedOrContacted: number;
    }>
> {
    try {
        await assertAdmin();

        // 1. Total usuarios registrados (Developer + Recruiter)
        const registered = await db.user.count({
            where: { isSuspended: false },
        });

        // 2. Usuarios únicos que han subido CV
        const cvUploadedRes = await db.analyticsEvent.groupBy({
            by: ["userHash"],
            where: { name: "cv_uploaded", userHash: { not: null } },
        });
        const uploadedCv = cvUploadedRes.length;

        // 3. Usuarios únicos que han realizado un Job Match
        const matchedJobRes = await db.analyticsEvent.groupBy({
            by: ["userHash"],
            where: { name: "job_match_completed", userHash: { not: null } },
        });
        const matchedJob = matchedJobRes.length;

        // 4. Usuarios únicos que han aplicado a una oferta o enviado contacto
        const appliedOrContactedRes = await db.analyticsEvent.groupBy({
            by: ["userHash"],
            where: {
                OR: [{ name: "job_posting_applied" }, { name: "contact_request_sent" }],
                userHash: { not: null },
            },
        });
        const appliedOrContacted = appliedOrContactedRes.length;

        return {
            success: true,
            data: {
                registered,
                uploadedCv: Math.min(uploadedCv, registered), // Acotar para consistencia estadística
                matchedJob: Math.min(matchedJob, uploadedCv),
                appliedOrContacted: Math.min(appliedOrContacted, matchedJob),
            },
        };
    } catch (error: unknown) {
        console.error("[getFunnelDataAction] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error al calcular el funnel." };
    }
}
