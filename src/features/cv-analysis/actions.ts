"use server";

import { auth } from "@/lib/auth";
import { CVAnalysisService } from "./service";
import type { ActionResult } from "./types";
import { revalidatePath } from "next/cache";

interface ParseCVInput {
  fileUrl: string;
  fileName: string;
}

export async function uploadAndParseCVAction(
  input: ParseCVInput
): Promise<ActionResult<any>> {
  try {
    // 1. Validar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
    }

    const { fileUrl, fileName } = input;
    if (!fileUrl || !fileName) {
      return { success: false, error: "Datos de archivo inválidos." };
    }

    // 2. Descargar el archivo desde la URL de UploadThing para poder parsearlo
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return { success: false, error: `No se pudo descargar el archivo para su análisis (Status ${response.status}).` };
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
  } catch (error: any) {
    console.error("[uploadAndParseCVAction] Error general:", error);
    return {
      success: false,
      error: error.message || "Ocurrió un error inesperado al procesar el archivo.",
    };
  }
}
