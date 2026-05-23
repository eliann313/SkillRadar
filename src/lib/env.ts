import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";
const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  !!process.env.CI ||
  process.env.VERCEL === "1" ||
  process.env.VITEST === "true" ||
  process.env.NODE_ENV === "test";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL debe ser una URL válida"),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET es requerido"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID es requerido"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET es requerido"),
  // Variables de servicios de terceros (estrictas en producción, opcionales en desarrollo)
  UPLOADTHING_SECRET: isProd
    ? z.string().min(1, "UPLOADTHING_SECRET es requerido en producción")
    : z.string().optional(),
  UPLOADTHING_APP_ID: isProd
    ? z.string().min(1, "UPLOADTHING_APP_ID es requerido en producción")
    : z.string().optional(),
  GEMINI_API_KEY: isProd
    ? z.string().min(1, "GEMINI_API_KEY es requerido en producción")
    : z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
});

// Realizar el parseo seguro
const parsedEnv = envSchema.safeParse(process.env);

let validatedEnv: z.infer<typeof envSchema>;

if (!parsedEnv.success) {
  if (isBuildTime) {
    // En fase de construcción o CI, permitimos continuar con placeholders para evitar crasheos de compilación/despliegue
    console.warn(
      "⚠️ [Warning] Faltan variables de entorno requeridas, pero se permiten placeholders por encontrarse en fase de build/CI:",
      parsedEnv.error.format(),
    );
    // Crear un objeto con placeholders que se adapte al tipo
    validatedEnv = {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://placeholder:placeholder@localhost:5432/placeholder",
      DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
      AUTH_SECRET: process.env.AUTH_SECRET || "placeholder-secret",
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "placeholder-github-id",
      GITHUB_CLIENT_SECRET:
        process.env.GITHUB_CLIENT_SECRET || "placeholder-github-secret",
      UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
      UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    };
  } else {
    console.error(
      "❌ Error en la validación de variables de entorno:",
      parsedEnv.error.format(),
    );
    throw new Error("Variables de entorno inválidas o faltantes");
  }
} else {
  validatedEnv = parsedEnv.data;
}

// Advertencias en desarrollo para APIs opcionales faltantes
if (!isProd && parsedEnv.success) {
  const missingApis: string[] = [];
  if (!parsedEnv.data.GEMINI_API_KEY) missingApis.push("GEMINI_API_KEY");
  if (!parsedEnv.data.UPLOADTHING_SECRET)
    missingApis.push("UPLOADTHING_SECRET");
  if (!parsedEnv.data.UPLOADTHING_APP_ID)
    missingApis.push("UPLOADTHING_APP_ID");

  if (missingApis.length > 0) {
    console.warn(
      `⚠️ [Warning] Las siguientes variables de APIs externas no están configuradas en desarrollo: ${missingApis.join(", ")}. Algunas funciones (como la carga de CV y el análisis con IA) no estarán disponibles.`,
    );
  }
}

export const env = validatedEnv;
