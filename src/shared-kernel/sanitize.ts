/**
 * Shared kernel: sanitización XSS básica para texto que se persiste o renderiza.
 * Fuente única de verdad — los features no deben acoplarse entre sí
 * para usarla (hex-no-feature-to-feature).
 */
export function sanitizeText(text: string): string {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}
