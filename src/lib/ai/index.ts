import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { env } from "@/lib/env";
import { decrypt } from "@/lib/crypto";

export interface AIServiceOptions {
  schema: unknown;
  system?: string;
  prompt?: string;
  userSettings?: {
    geminiApiKeyEncrypted?: string | null;
    groqApiKeyEncrypted?: string | null;
    openrouterApiKeyEncrypted?: string | null;
    openaiApiKeyEncrypted?: string | null;
    anthropicApiKeyEncrypted?: string | null;
    preferredProvider?: string;
    preferredModel?: string;
  };
}

export class AIService {
  private static getModelInstance(
    provider: string,
    model: string,
    userSettings?: AIServiceOptions["userSettings"],
  ) {
    let apiKey: string | undefined;

    console.warn(
      `🔮 [AIService] Instanciando proveedor: "${provider}" con modelo: "${model}"`,
    );

    if (provider === "gemini") {
      apiKey = userSettings?.geminiApiKeyEncrypted
        ? decrypt(userSettings.geminiApiKeyEncrypted)
        : env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "GEMINI_API_KEY no configurada a nivel global ni de usuario.",
        );
      }
      console.warn(
        `🔮 [AIService] Usando clave de Gemini ${userSettings?.geminiApiKeyEncrypted ? "provista por el USUARIO (Bypass Rate Limits activado)" : "del SISTEMA (Cuotas estándar)"}`,
      );
      const google = createGoogleGenerativeAI({ apiKey });
      return google(model);
    }

    if (provider === "groq") {
      // Intentar leer la del usuario, luego de process.env globales
      apiKey = userSettings?.groqApiKeyEncrypted
        ? decrypt(userSettings.groqApiKeyEncrypted)
        : process.env.GROQ_API_KEY || "";

      if (!apiKey) {
        throw new Error(
          "GROQ_API_KEY no configurada a nivel global ni de usuario.",
        );
      }
      console.warn(
        `🔮 [AIService] Usando clave de Groq ${userSettings?.groqApiKeyEncrypted ? "provista por el USUARIO (Bypass Rate Limits activado)" : "del SISTEMA (Cuotas estándar)"}`,
      );
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey,
      });
      return groq(model);
    }

    if (provider === "openai") {
      apiKey = userSettings?.openaiApiKeyEncrypted
        ? decrypt(userSettings.openaiApiKeyEncrypted)
        : process.env.OPENAI_API_KEY || "";

      if (!apiKey) {
        throw new Error(
          "API Key de OpenAI no configurada a nivel de usuario ni de sistema.",
        );
      }
      console.warn(
        `🔮 [AIService] Usando clave de OpenAI ${userSettings?.openaiApiKeyEncrypted ? "provista por el USUARIO (Bypass Rate Limits activado)" : "del SISTEMA (Cuotas estándar)"}`,
      );
      const openai = createOpenAI({ apiKey });
      return openai(model);
    }

    if (provider === "anthropic") {
      apiKey = userSettings?.anthropicApiKeyEncrypted
        ? decrypt(userSettings.anthropicApiKeyEncrypted)
        : process.env.ANTHROPIC_API_KEY || "";

      if (!apiKey) {
        throw new Error(
          "API Key de Anthropic no configurada a nivel de usuario ni de sistema.",
        );
      }
      console.warn(
        `🔮 [AIService] Usando clave de Anthropic ${userSettings?.anthropicApiKeyEncrypted ? "provista por el USUARIO (Bypass Rate Limits activado)" : "del SISTEMA (Cuotas estándar)"}`,
      );
      const anthropic = createAnthropic({ apiKey });
      return anthropic(model);
    }

    if (provider === "openrouter") {
      apiKey = userSettings?.openrouterApiKeyEncrypted
        ? decrypt(userSettings.openrouterApiKeyEncrypted)
        : env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "";

      if (!apiKey) {
        throw new Error(
          "OPENROUTER_API_KEY no configurada a nivel global ni de usuario.",
        );
      }
      console.warn(
        `🔮 [AIService] Usando clave de OpenRouter ${userSettings?.openrouterApiKeyEncrypted ? "provista por el USUARIO (Bypass Rate Limits activado)" : "del SISTEMA (Cuotas estándar)"}`,
      );
      const openrouter = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
      });
      return openrouter(model);
    }

    throw new Error(`Proveedor no soportado: ${provider}`);
  }

  static async generateStructuredObject<T extends object>(
    options: AIServiceOptions,
  ): Promise<T> {
    const primaryProvider = options.userSettings?.preferredProvider || "gemini";
    const primaryModel =
      options.userSettings?.preferredModel || "gemini-2.5-flash";

    // Cola de cascada estándar del sistema para fallbacks
    const cascadeQueue = [
      { provider: "gemini", model: "gemini-2.5-flash" },
      { provider: "groq", model: "llama-3.3-70b-versatile" },
      {
        provider: "openrouter",
        model: "meta-llama/llama-3.1-70b-instruct:free",
      },
    ];

    // Reordenar la cola de ejecución priorizando la selección primaria del usuario
    const targetQueue = [
      { provider: primaryProvider, model: primaryModel },
      ...cascadeQueue.filter((p) => p.provider !== primaryProvider),
    ];

    let lastError: unknown = null;

    for (const option of targetQueue) {
      try {
        console.warn(
          `🛡️ [AIService] Intentando inferencia estructurada con "${option.provider}" ("${option.model}")...`,
        );
        const modelInstance = this.getModelInstance(
          option.provider,
          option.model,
          options.userSettings,
        );

        const { object } = await generateObject({
          ...options,
          model: modelInstance,
        } as unknown as Parameters<typeof generateObject>[0]);

        console.warn(
          `✅ [AIService] Inferencia completada con éxito vía "${option.provider}".`,
        );
        return object as T;
      } catch (error: unknown) {
        const errMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ [AIService] Falló la inferencia estructurada con "${option.provider}":`,
          errMessage,
        );
        lastError = error;
      }
    }

    const finalErrMessage =
      lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(
      `[AIService] Todos los proveedores e inferencias de fallback fallaron: ${finalErrMessage}`,
    );
  }
}
