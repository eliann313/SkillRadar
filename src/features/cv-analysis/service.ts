import pdf from "pdf-parse";
import { ResumeRepository } from "./repository";
import { CVAnalysisAIService } from "./ai-service";

export class CVAnalysisService {
  static async parsePDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      return data.text || "";
    } catch (error) {
      console.error("[CVAnalysisService] Error parseando PDF:", error);
      throw new Error("No se pudo extraer el texto del PDF");
    }
  }

  /**
   * Extrae el texto del PDF de CV, crea el registro inicial en la base de datos,
   * ejecuta el análisis ATS estructurado (real o simulación) con Gemini,
   * actualiza y persiste los resultados en la DB, y retorna el objeto consolidado.
   */
  static async saveParsedCV(params: {
    userId: string;
    fileName: string;
    fileUrl: string;
    fileBuffer: Buffer;
  }) {
    // 1. Extraer texto crudo del PDF
    const rawText = await this.parsePDF(params.fileBuffer);

    // 2. Persistir registro inicial en base de datos
    const resume = await ResumeRepository.create({
      userId: params.userId,
      fileName: params.fileName,
      fileUrl: params.fileUrl,
      rawText,
    });

    try {
      // 3. Ejecutar el análisis ATS estructurado (con fallback offline integrado en el servicio de IA)
      const aiAnalysis = await CVAnalysisAIService.analyze(rawText);

      // 4. Actualizar el registro de base de datos con los resultados del análisis
      const updatedResume = await ResumeRepository.updateAnalysis(
        resume.id,
        params.userId,
        {
          atsScore: aiAnalysis.atsScore,
          analysis: aiAnalysis,
        },
      );

      return updatedResume;
    } catch (aiError) {
      console.error(
        `[CVAnalysisService] Error durante la fase de análisis de IA para CV ID ${resume.id}:`,
        aiError,
      );
      // Retornamos el resume inicial creado si la IA falla catastróficamente en producción para no romper el flujo del usuario
      return resume;
    }
  }
}
