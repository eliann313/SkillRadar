import { atsAnalysisSchema, type ATSAnalysis } from "./types";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { AIService, type AIServiceOptions } from "@/lib/ai";

export class CVAnalysisAIService {
  /**
   * Genera un análisis ATS estructurado a partir del texto de un currículum.
   * Carga las preferencias del usuario y sus API keys si se provee userId,
   * y hace uso del AIService unificado con tolerancia a fallos.
   */
  static async analyze(cvText: string, userId?: string): Promise<ATSAnalysis> {
    let userSettings: AIServiceOptions["userSettings"] = undefined;

    if (userId) {
      try {
        console.warn(
          `[CVAnalysisAIService] Cargando API keys y preferencias para usuario ID: ${userId}...`,
        );
        const user = await db.user.findUnique({
          where: { id: userId },
          select: {
            geminiApiKey: true,
            groqApiKey: true,
            openrouterApiKey: true,
            openaiApiKey: true,
            anthropicApiKey: true,
            defaultAiProvider: true,
            defaultAiModel: true,
          },
        });

        if (user) {
          userSettings = {
            geminiApiKeyEncrypted: user.geminiApiKey,
            groqApiKeyEncrypted: user.groqApiKey,
            openrouterApiKeyEncrypted: user.openrouterApiKey,
            openaiApiKeyEncrypted: user.openaiApiKey,
            anthropicApiKeyEncrypted: user.anthropicApiKey,
            preferredProvider: user.defaultAiProvider,
            preferredModel: user.defaultAiModel,
          };
          console.warn(
            `[CVAnalysisAIService] Proveedor preferido: ${userSettings.preferredProvider} (${userSettings.preferredModel})`,
          );
        }
      } catch (dbError) {
        console.error(
          "❌ [CVAnalysisAIService] Error cargando preferencias del usuario de base de datos:",
          dbError,
        );
      }
    }

    // Si no hay API key global ni local/usuario cargada, caemos en simulación en desarrollo local para no bloquear al dev
    const hasGlobalKeys = !!(
      env.GEMINI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY
    );
    const hasUserKeys = !!(
      userSettings &&
      (userSettings.geminiApiKeyEncrypted ||
        userSettings.groqApiKeyEncrypted ||
        userSettings.openrouterApiKeyEncrypted ||
        userSettings.openaiApiKeyEncrypted ||
        userSettings.anthropicApiKeyEncrypted)
    );

    if (!hasGlobalKeys && !hasUserKeys) {
      console.warn(
        "⚠️ [CVAnalysisAIService] No hay claves API globales ni de usuario configuradas. Ejecutando en Modo Simulación Offline (Mock).",
      );
      return this.generateSimulatedAnalysis(cvText);
    }

    try {
      console.warn(
        `[CVAnalysisAIService] Iniciando análisis ATS estructurado con AIService unificado...`,
      );

      const object = await AIService.generateStructuredObject<ATSAnalysis>({
        schema: atsAnalysisSchema,
        system: `Eres un experto en Sistemas de Seguimiento de Candidatos (ATS) y reclutamiento técnico en la industria del software.
Tu tarea es analizar el currículum proporcionado con un rigor analítico excelente y profesional.
Debes evaluar la calidad del perfil, detectar problemas de formato comunes en ATS (ej. uso de tablas complejas, falta de información de contacto clara, secciones mal organizadas), identificar keywords presentes y keywords críticas faltantes según las tendencias del desarrollo de software moderno, señalar fortalezas y mejoras clave, y estimar su nivel de seniority general.`,
        prompt: `Analiza exhaustivamente el siguiente contenido de currículum y genera una evaluación ATS estructurada:\n\n${cvText}`,
        userSettings,
      });

      console.warn(
        "[CVAnalysisAIService] Análisis completado con éxito a través del AIService.",
      );
      return object;
    } catch (error) {
      console.error(
        "[CVAnalysisAIService] Error durante el análisis con AIService:",
        error,
      );

      // Fallback robusto en desarrollo por si falla la llamada
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "⚠️ [CVAnalysisAIService] Falló la inferencia del AIService en desarrollo. Retornando simulación como fallback.",
        );
        return this.generateSimulatedAnalysis(cvText);
      }

      throw new Error(
        "No se pudo completar el análisis del currículum con la IA a través del servicio centralizado.",
      );
    }
  }

  /**
   * Simula un análisis ATS interactivo e inteligente basado en las palabras clave del CV.
   * Esto permite pruebas fluidas y autónomas en desarrollo local sin APIs.
   */
  private static generateSimulatedAnalysis(cvText: string): ATSAnalysis {
    const textLower = cvText.toLowerCase();

    // Detección reactiva de tecnologías
    const techKeywords = [
      "react",
      "next.js",
      "nextjs",
      "typescript",
      "javascript",
      "node",
      "nodejs",
      "python",
      "prisma",
      "postgres",
      "postgresql",
      "docker",
      "aws",
      "tailwind",
      "git",
    ];

    const detectedKeywords = techKeywords.filter((tech) =>
      textLower.includes(tech),
    );

    // Normalizar keywords detectadas para presentación
    const keywords = detectedKeywords.map((k) => {
      if (k === "nextjs" || k === "next.js") return "Next.js";
      if (k === "nodejs" || k === "node") return "Node.js";
      if (k === "postgresql" || k === "postgres") return "PostgreSQL";
      return k.charAt(0).toUpperCase() + k.slice(1);
    });

    // Palabras clave que el CV no tiene (de nuestra lista estándar)
    const missingKeywords = techKeywords
      .filter((tech) => !textLower.includes(tech))
      .slice(0, 3)
      .map((k) =>
        k === "nextjs" ? "Next.js" : k.charAt(0).toUpperCase() + k.slice(1),
      );

    // Determinar seniority estimado de forma reactiva
    let estimatedSeniority: "junior" | "semi-senior" | "senior" = "semi-senior";
    if (
      textLower.includes("senior") ||
      textLower.includes("lead") ||
      textLower.includes("arquitecto")
    ) {
      estimatedSeniority = "senior";
    } else if (
      textLower.includes("junior") ||
      textLower.includes("trainee") ||
      keywords.length < 3
    ) {
      estimatedSeniority = "junior";
    }

    // Calcular score dinámico
    let atsScore = 65;
    if (estimatedSeniority === "senior") atsScore += 18;
    if (estimatedSeniority === "junior") atsScore -= 15;
    atsScore += keywords.length * 2; // bonificación por keywords encontradas
    atsScore = Math.max(10, Math.min(100, atsScore)); // asegurar rango [10, 100]

    // Generar fortalezas y mejoras de forma dinámica
    const strengths = [
      `Demuestra conocimientos y exposición práctica en ${keywords.length > 0 ? keywords.slice(0, 3).join(", ") : "desarrollo técnico"}.`,
      "Estructura del currículum legible y fácil de escanear por algoritmos ATS.",
    ];

    if (estimatedSeniority === "senior") {
      strengths.push(
        "Sólida trayectoria con indicio de liderazgo técnico y toma de decisiones arquitectónicas.",
      );
    } else {
      strengths.push(
        "Exposición clara a frameworks y herramientas clave del ecosistema de desarrollo.",
      );
    }

    const improvements = [
      "Se sugiere enriquecer las descripciones de los proyectos utilizando la metodología STAR (Situación, Tarea, Acción, Resultado).",
    ];

    const formatIssues: string[] = [];
    if (
      !textLower.includes("@") ||
      (!textLower.includes("phone") && !textLower.includes("tel"))
    ) {
      formatIssues.push(
        "Falta de información de contacto explícita o enlaces profesionales clave (GitHub/LinkedIn).",
      );
    }

    if (missingKeywords.length > 0) {
      improvements.push(
        `Agregar exposición explícita en tecnologías demandadas ausentes como: ${missingKeywords.join(", ")}.`,
      );
    }

    return {
      atsScore,
      keywords,
      missingKeywords,
      formatIssues,
      strengths,
      improvements,
      estimatedSeniority,
    };
  }
}
