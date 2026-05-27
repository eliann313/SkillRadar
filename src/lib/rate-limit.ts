import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env";
import { headers } from "next/headers";
import { db } from "./db";

// Tipo para el resultado del rate limiting que coincide con la firma de Upstash
export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // Timestamp en milisegundos cuando se restablece la ventana
}
// ... [rest of top definitions kept unmodified] ...
class InMemorySlidingWindow {
    private history = new Map<string, number[]>();

    constructor(
        private limit: number,
        private windowMs: number,
    ) {
        // Rutina de limpieza autónoma para evitar fugas de memoria (DoS)
        // Revisa y elimina del mapa las llaves cuya ventana de tiempo haya expirado por completo
        if (typeof window === "undefined") {
            setInterval(
                () => {
                    const now = Date.now();
                    const cutoff = now - this.windowMs;
                    for (const [key, timestamps] of this.history.entries()) {
                        const activeTimestamps = timestamps.filter((time) => time > cutoff);
                        if (activeTimestamps.length === 0) {
                            this.history.delete(key);
                        } else {
                            this.history.set(key, activeTimestamps);
                        }
                    }
                },
                60 * 60 * 1000,
            ).unref(); // Corre cada hora y permite apagar el proceso limpiamente
        }
    }

    async limitRequest(key: string): Promise<RateLimitResult> {
        const now = Date.now();
        const cutoff = now - this.windowMs;

        // Obtener y limpiar timestamps antiguos
        let timestamps = this.history.get(key) || [];
        timestamps = timestamps.filter((time) => time > cutoff);

        if (timestamps.length < this.limit) {
            timestamps.push(now);
            this.history.set(key, timestamps);

            return {
                success: true,
                limit: this.limit,
                remaining: this.limit - timestamps.length,
                reset: now + this.windowMs,
            };
        }

        // Si se ha excedido el límite, el tiempo de reset es cuando expira la petición más antigua del bloque actual
        const oldestTimestamp = timestamps[0];
        const resetTime = oldestTimestamp + this.windowMs;

        return {
            success: false,
            limit: this.limit,
            remaining: 0,
            reset: resetTime,
        };
    }
}

// Inicializar limitadores de Upstash o InMemory dependientes de la configuración
let cvLimiter: Ratelimit | InMemorySlidingWindow | null = null;
let jobMatchLimiter: Ratelimit | InMemorySlidingWindow | null = null;
let loginLimiter: Ratelimit | InMemorySlidingWindow | null = null;

const CV_LIMIT = 5; // 5 análisis de CV por día
const JOB_MATCH_LIMIT = 10; // 10 Job Matches por día
const LOGIN_LIMIT = 5; // 5 intentos de login por 15 min
const WINDOW_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

const hasUpstashConfig = !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

if (hasUpstashConfig) {
    try {
        const redis = new Redis({
            url: env.UPSTASH_REDIS_REST_URL!,
            token: env.UPSTASH_REDIS_REST_TOKEN!,
        });

        cvLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(CV_LIMIT, "24 h"),
            analytics: true,
            prefix: "ratelimit:cv",
        });

        jobMatchLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(JOB_MATCH_LIMIT, "24 h"),
            analytics: true,
            prefix: "ratelimit:job-match",
        });

        loginLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(LOGIN_LIMIT, "15 m"),
            analytics: true,
            prefix: "ratelimit:login",
        });

        console.warn("🛡️ [RateLimit] Upstash Redis inicializado correctamente para Rate Limiting.");
    } catch (error) {
        console.error(
            "❌ [RateLimit] Falló la inicialización de Upstash Redis, cayendo en fallback en memoria:",
            error,
        );
    }
}

// Inicializar limitadores de memoria si Upstash no está disponible o falló
if (!cvLimiter) {
    console.warn("⚠️ [RateLimit] Usando limitador en memoria para análisis de CV (Límite: 5/día).");
    cvLimiter = new InMemorySlidingWindow(CV_LIMIT, WINDOW_DURATION_MS);
}

if (!jobMatchLimiter) {
    console.warn("⚠️ [RateLimit] Usando limitador en memoria para Job Match (Límite: 10/día).");
    jobMatchLimiter = new InMemorySlidingWindow(JOB_MATCH_LIMIT, WINDOW_DURATION_MS);
}

if (!loginLimiter) {
    console.warn("⚠️ [RateLimit] Usando limitador en memoria para login (Límite: 5/15min).");
    loginLimiter = new InMemorySlidingWindow(LOGIN_LIMIT, LOGIN_WINDOW_MS);
}

/**
 * Resuelve la dirección IP del cliente desde los headers HTTP de Next.js.
 */
export async function getClientIp(): Promise<string> {
    try {
        const headersList = await headers();

        // 1. Priorizar cabeceras de IP verificadas y sanitizadas por el proxy de confianza (Vercel / Cloudflare)
        const realIp = headersList.get("x-real-ip") || headersList.get("x-vercel-forwarded-for");
        if (realIp) return realIp.trim();

        // 2. Si no están, caer en la cadena estándar de X-Forwarded-For
        const forwardedFor = headersList.get("x-forwarded-for");
        if (forwardedFor) {
            const ip = forwardedFor.split(",")[0].trim();
            if (ip) return ip;
        }
    } catch (e) {
        console.warn("⚠️ [RateLimit] No se pudieron leer las cabeceras HTTP de Next.js, cayendo en localhost:", e);
    }
    return "127.0.0.1";
}

/**
 * Helper interno para verificar si un usuario tiene configurada alguna API Key personal.
 */
async function checkUserHasApiKeyBypass(identifier: string): Promise<boolean> {
    if (identifier.startsWith("user:")) {
        const userId = identifier.substring(5);
        try {
            const user = await db.user.findUnique({
                where: { id: userId },
                select: {
                    geminiApiKey: true,
                    groqApiKey: true,
                    openrouterApiKey: true,
                    openaiApiKey: true,
                    anthropicApiKey: true,
                },
            });

            const hasOwnKey = !!(
                user?.geminiApiKey ||
                user?.groqApiKey ||
                user?.openrouterApiKey ||
                user?.openaiApiKey ||
                user?.anthropicApiKey
            );

            if (hasOwnKey) {
                console.warn(
                    `🛡️ [RateLimit] Bypass activado para el usuario ${userId} por poseer API Keys personales.`,
                );
                return true;
            }
        } catch (dbError) {
            console.error("❌ [RateLimit] Error consultando API Keys de usuario para bypass:", dbError);
        }
    }
    return false;
}

/**
 * Verifica el límite de análisis de CV para un identificador (UserId o IP).
 */
export async function checkCVRateLimit(identifier: string): Promise<RateLimitResult> {
    // Primero verificar el bypass de llaves personales de usuario
    if (await checkUserHasApiKeyBypass(identifier)) {
        return {
            success: true,
            limit: 999,
            remaining: 999,
            reset: Date.now() + WINDOW_DURATION_MS,
        };
    }

    const sanitizedIdentifier = identifier.replace(/[^a-zA-Z0-9_\-:]/g, "");

    if (cvLimiter instanceof Ratelimit) {
        const result = await cvLimiter.limit(sanitizedIdentifier);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    } else {
        return await cvLimiter!.limitRequest(sanitizedIdentifier);
    }
}

/**
 * Verifica el límite de Job Match para un identificador (UserId o IP).
 */
export async function checkJobMatchRateLimit(identifier: string): Promise<RateLimitResult> {
    // Primero verificar el bypass de llaves personales de usuario
    if (await checkUserHasApiKeyBypass(identifier)) {
        return {
            success: true,
            limit: 999,
            remaining: 999,
            reset: Date.now() + WINDOW_DURATION_MS,
        };
    }

    const sanitizedIdentifier = identifier.replace(/[^a-zA-Z0-9_\-:]/g, "");

    if (jobMatchLimiter instanceof Ratelimit) {
        const result = await jobMatchLimiter.limit(sanitizedIdentifier);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    } else {
        return await jobMatchLimiter!.limitRequest(sanitizedIdentifier);
    }
}

/**
 * Verifica el límite de intentos de login para un identificador (IP).
 */
export async function checkLoginRateLimit(identifier: string): Promise<RateLimitResult> {
    const sanitizedIdentifier = identifier.replace(/[^a-zA-Z0-9_\-:]/g, "");

    if (loginLimiter instanceof Ratelimit) {
        const result = await loginLimiter.limit(sanitizedIdentifier);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    } else {
        return await loginLimiter!.limitRequest(sanitizedIdentifier);
    }
}
