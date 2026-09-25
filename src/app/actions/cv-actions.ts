"use server";

import { auth } from "@/lib/auth";
import { checkCVRateLimit } from "@/lib/rate-limit";
import { validateBlobFileUrl } from "@/lib/file-storage";

export async function getSignedFileUrlAction(
    fileUrl: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // 1. Validar autenticación
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: "No autorizado. Inicie sesión nuevamente.",
            };
        }

        // 2. Validar que la URL pertenece a nuestro storage (barrera anti-SSRF)
        const validation = validateBlobFileUrl(fileUrl);
        if (!validation.ok) {
            return { success: false, error: validation.error };
        }

        // 3. Ownership: solo el dueño del resume puede ver su archivo (evita IDOR)
        const { db } = await import("@/lib/db");
        const owned = await db.resume.findFirst({
            where: { userId: session.user.id, fileUrl: validation.validatedUrl },
            select: { id: true },
        });
        if (!owned) {
            return { success: false, error: "Archivo no encontrado para este usuario." };
        }

        const rl = await checkCVRateLimit(`user:${session.user.id}`);
        if (!rl.success) {
            return { success: false, error: "Límite diario de descargas alcanzado." };
        }

        // 4. URL de vista vía proxy con ownership: la URL cruda de Blob nunca
        // se expone de forma persistente al cliente.
        return {
            success: true,
            url: `/api/files?url=${encodeURIComponent(validation.validatedUrl)}`,
        };
    } catch (error) {
        console.error("[getSignedFileUrlAction] Error:", error);
        return {
            success: false,
            error: "Error al generar la URL de vista para el archivo.",
        };
    }
}
