/* eslint-disable no-console */
/**
 * Logger centralizado de SkillRadar (único lugar con `console.*` permitido).
 *
 * Envoltorio fino sobre `console.*` con prefijo `[SkillRadar]` y niveles
 * debug/info/warn/error. Firma variádica: `logger.error("ctx", err, meta)`.
 * - Seguro en cliente, servidor y Edge (sin dependencias Node).
 * - `debug` se silencia en producción.
 * - Llama a `console.*` por lookup dinámico en cada llamada para no romper
 *   spies de tests (`vi.spyOn(console, ...)`).
 *
 * Regla: no usar `console.*` directo en `src/` (ver `no-console` en eslint).
 */
type LogMethod = "debug" | "info" | "warn" | "error";

function emit(method: LogMethod, args: unknown[]): void {
    if (method === "debug" && process.env.NODE_ENV === "production") {
        return;
    }
    console[method]("[SkillRadar]", ...args);
}

export const logger = {
    debug: (...args: unknown[]): void => emit("debug", args),
    info: (...args: unknown[]): void => emit("info", args),
    warn: (...args: unknown[]): void => emit("warn", args),
    error: (...args: unknown[]): void => emit("error", args),
};
