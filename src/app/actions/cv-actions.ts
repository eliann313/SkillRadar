"use server";

import { UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";

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

        if (!fileUrl) {
            return { success: false, error: "URL de archivo no proporcionada" };
        }

        // SSRF / Path Traversal Prevention: Validate that the fileUrl belongs to UploadThing's trusted domains using a strict regex barrier guard.
        const UPLOADTHING_URL_REGEX = /^https:\/\/([a-zA-Z0-9-]+\.)?(utfs\.io|ufs\.sh)\/f\/.+/;
        if (!UPLOADTHING_URL_REGEX.test(fileUrl)) {
            return {
                success: false,
                error: "URL de archivo no permitida por razones de seguridad.",
            };
        }

        const parsedUrl = new URL(fileUrl);
        const host = parsedUrl.hostname.toLowerCase();
        const isUfs = host === "ufs.sh" || host.endsWith(".ufs.sh");
        const isUtfs = host === "utfs.io" || host.endsWith(".utfs.io");
        if (!isUfs && !isUtfs) {
            return {
                success: false,
                error: "URL de archivo no permitida por razones de seguridad.",
            };
        }

        const urlPath = parsedUrl.pathname;
        if (!urlPath.startsWith("/f/")) {
            return {
                success: false,
                error: "Estructura de URL no permitida por razones de seguridad.",
            };
        }
        const fileKey = urlPath.substring(3); // Extracts everything after "/f/"

        // Strict validation of the fileKey
        const SAFE_FILE_KEY_REGEX = /^[a-zA-Z0-9\-_.]+$/;
        if (!SAFE_FILE_KEY_REGEX.test(fileKey)) {
            return {
                success: false,
                error: "Nombre de archivo contiene caracteres no permitidos.",
            };
        }

        // Generate short-lived pre-signed URL (1 hour)
        const utapi = new UTApi();
        const signedData = await utapi.getSignedURL(fileKey);

        return {
            success: true,
            url: signedData.url,
        };
    } catch (error) {
        console.error("[getSignedFileUrlAction] Error:", error);
        return {
            success: false,
            error: "Error al generar la URL firmada para el archivo.",
        };
    }
}
