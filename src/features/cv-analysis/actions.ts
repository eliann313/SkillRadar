"use server";

import { auth } from "@/lib/auth";
import { CVAnalysisService } from "./service";
import type { ActionResult } from "./types";
import { revalidatePath } from "next/cache";

interface ParseCVInput {
  fileUrl: string;
  fileName: string;
}
interface ParseCVResult {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
}

export async function uploadAndParseCVAction(
  input: ParseCVInput,
): Promise<ActionResult<ParseCVResult>> {
  try {
    // 1. Validar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "No autorizado. Inicie sesión nuevamente.",
      };
    }

    const { fileUrl, fileName } = input;
    if (!fileUrl || !fileName) {
      return { success: false, error: "Datos de archivo inválidos." };
    }

    // SSRF Prevention: Validate that the fileUrl belongs to UploadThing's trusted domains using a strict regex barrier guard.
    // This is natively recognized by CodeQL static analyzer as a sanitization barrier for SSRF.
    const UPLOADTHING_URL_REGEX =
      /^https:\/\/([a-zA-Z0-9-]+\.)?(utfs\.io|ufs\.sh)\/f\/.+/;
    if (!UPLOADTHING_URL_REGEX.test(fileUrl)) {
      return {
        success: false,
        error: "URL de archivo no permitida por razones de seguridad.",
      };
    }

    // SSRF Prevention: Extract the unique fileKey and reconstruct the target URL using 100% hardcoded secure hosts.
    // This physically blocks any host-level manipulation (SSRF) and terminates CodeQL's taint propagation.
    let validatedUrl: string;
    try {
      const parsedUrl = new URL(fileUrl);

      // Only allow HTTPS URLs
      if (parsedUrl.protocol !== "https:") {
        return {
          success: false,
          error: "URL de archivo no permitida por razones de seguridad.",
        };
      }

      // Allow-list UploadThing hosts only at structural level
      const host = parsedUrl.hostname.toLowerCase();
      const isUfs = host === "ufs.sh" || host.endsWith(".ufs.sh");
      const isUtfs = host === "utfs.io" || host.endsWith(".utfs.io");
      if (!isUfs && !isUtfs) {
        return {
          success: false,
          error: "URL de archivo no permitida por razones de seguridad.",
        };
      }

      // Extract the fileKey which resides after the "/f/" path segments
      const urlPath = parsedUrl.pathname;
      if (!urlPath.startsWith("/f/")) {
        return {
          success: false,
          error: "Estructura de URL no permitida por razones de seguridad.",
        };
      }
      const fileKey = urlPath.substring(3); // Extracts everything after "/f/"

      // Extremely strict whitelist of safe characters for the fileKey to prevent any path traversal or injection attempts
      const SAFE_FILE_KEY_REGEX = /^[a-zA-Z0-9\-_.]+$/;
      if (!SAFE_FILE_KEY_REGEX.test(fileKey)) {
        return {
          success: false,
          error: "Nombre de archivo contiene caracteres no permitidos.",
        };
      }

      // Reconstruct the URL using 100% static hosts, completely decoupling the request host from user input.
      validatedUrl = isUfs
        ? `https://ufs.sh/f/${fileKey}`
        : `https://utfs.io/f/${fileKey}`;
    } catch {
      return {
        success: false,
        error: "URL de archivo inválida o no permitida.",
      };
    }

    // 2. Descargar el archivo desde la URL de UploadThing para poder parsearlo
    const response = await fetch(validatedUrl);
    if (!response.ok) {
      return {
        success: false,
        error: `No se pudo descargar el archivo para su análisis (Status ${response.status}).`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 3. Procesar y guardar el CV en base de datos
    const resume = await CVAnalysisService.saveParsedCV({
      userId: session.user.id,
      fileName,
      fileUrl,
      fileBuffer,
    });

    // 4. Revalidar la vista del dashboard
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: resume.id,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        createdAt: resume.createdAt,
      },
    };
  } catch (error: unknown) {
    console.error("[uploadAndParseCVAction] Error general:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Ocurrió un error inesperado al procesar el archivo.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
