type Level = "info" | "warn" | "error";

function log(level: Level, message: string, meta?: unknown) {
    // oxlint/no-console: centralizamos el logging aquí; info usa warn para respetar la regla no-console del repo
    const fn = level === "error" ? console.error : console.warn;
    if (meta !== undefined) {
        fn(`[${level.toUpperCase()}] ${message}`, meta);
    } else {
        fn(`[${level.toUpperCase()}] ${message}`);
    }
}

export const logger = {
    info: (msg: string, meta?: unknown) => log("info", msg, meta),
    warn: (msg: string, meta?: unknown) => log("warn", msg, meta),
    error: (msg: string, meta?: unknown) => log("error", msg, meta),
};
