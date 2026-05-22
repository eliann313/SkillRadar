import pdf from "pdf-parse";
import { ResumeRepository } from "./repository";

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

  static async saveParsedCV(params: {
    userId: string;
    fileName: string;
    fileUrl: string;
    fileBuffer: Buffer;
  }) {
    const rawText = await this.parsePDF(params.fileBuffer);
    return await ResumeRepository.create({
      userId: params.userId,
      fileName: params.fileName,
      fileUrl: params.fileUrl,
      rawText,
    });
  }
}
