import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

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

if (!parsedEnv.success) {
  console.error("❌ Error en la validación de variables de entorno:", parsedEnv.error.format());
  throw new Error("Variables de entorno inválidas o faltantes");
}

// Advertencias en desarrollo para APIs opcionales faltantes
if (!isProd) {
  const missingApis: string[] = [];
  if (!parsedEnv.data.GEMINI_API_KEY) missingApis.push("GEMINI_API_KEY");
  if (!parsedEnv.data.UPLOADTHING_SECRET) missingApis.push("UPLOADTHING_SECRET");
  if (!parsedEnv.data.UPLOADTHING_APP_ID) missingApis.push("UPLOADTHING_APP_ID");
  
  if (missingApis.length > 0) {
    console.warn(
      `⚠️ [Warning] Las siguientes variables de APIs externas no están configuradas en desarrollo: ${missingApis.join(", ")}. Algunas funciones (como la carga de CV y el análisis con IA) no estarán disponibles.`
    );
  }
}

export const env = parsedEnv.data;
