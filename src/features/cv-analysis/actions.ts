"use server";

import { auth } from "@/lib/auth";
import { CVAnalysisService } from "./service";
import type { ActionResult } from "./types";
import { revalidatePath } from "next/cache";

interface ParseCVInput {
  fileUrl: string;
  fileName: string;
}

function isAllowedUploadthingUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);

    // Only allow HTTPS URLs.
    if (url.protocol !== "https:") return false;

    // Disallow credentialed URLs and explicit custom ports.
    if (url.username || url.password) return false;
    if (url.port && url.port !== "443") return false;

    // Allow-list UploadThing hosts only.
    const host = url.hostname.toLowerCase();
    const allowedHosts = ["utfs.io", "ufs.sh"];
    return allowedHosts.some(
      (allowed) => host === allowed || host.endsWith("." + allowed),
    );
  } catch {
    return false;
  }
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

    // SSRF Prevention: Validate that the fileUrl belongs to UploadThing's trusted domains
    if (!isAllowedUploadthingUrl(fileUrl)) {
      return {
        success: false,
        error: "URL de archivo no permitida por razones de seguridad.",
      };
    }

    // 2. Descargar el archivo desde la URL de UploadThing para poder parsearlo
    const response = await fetch(fileUrl);
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
