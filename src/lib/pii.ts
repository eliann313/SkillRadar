import { createHash } from "crypto";

/** Remove emails, phones, URLs and header-like PII lines before sending text to an LLM. */
export function stripPIIForLLM(rawText: string, maxChars = 6000): string {
    if (!rawText) return "";
    let text = rawText.slice(0, maxChars);

    // Emails
    text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]");
    // Phones (international, with spaces/dashes, 7+ digits)
    text = text.replace(/(\+?\d[\d\s\-().]{6,}\d)/g, (m) => {
        const digits = m.replace(/\D/g, "");
        return digits.length >= 7 ? "[PHONE_REDACTED]" : m;
    });
    // URLs (keep domain hint for github/linkedin as signal, redact rest)
    text = text.replace(/https?:\/\/[^\s)]+/gi, (url) => {
        const lower = url.toLowerCase();
        if (lower.includes("github.com") || lower.includes("linkedin.com")) return "[PROFILE_LINK_REDACTED]";
        return "[URL_REDACTED]";
    });
    // LinkedIn / GitHub handles on plain text
    text = text.replace(/(linkedin\.com\/in\/[^\s)]+)/gi, "[PROFILE_LINK_REDACTED]");
    text = text.replace(/(github\.com\/[^\s)]+)/gi, "[PROFILE_LINK_REDACTED]");

    // Drop first lines that look like a header with name + contact (max 6 lines)
    const lines = text.split("\n");
    let dropped = 0;
    const cleaned: string[] = [];
    for (const line of lines) {
        const trimmed = line.trim();
        const looksHeader =
            dropped < 6 &&
            (trimmed.includes("[EMAIL_REDACTED]") ||
                trimmed.includes("[PHONE_REDACTED]") ||
                trimmed.includes("[PROFILE_LINK_REDACTED]"));
        if (looksHeader && trimmed.length < 120) {
            dropped += 1;
            continue;
        }
        cleaned.push(line);
    }
    return cleaned.join("\n").slice(0, maxChars);
}

/** Remove emails/phones/urls that the model may have echoed back in generated text. */
export function redactPIIFromModelOutput(text: string): string {
    if (!text) return "";
    return text
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[redactado]")
        .replace(/(\+?\d[\d\s\-().]{6,}\d)/g, (m) => (m.replace(/\D/g, "").length >= 7 ? "[redactado]" : m))
        .replace(/https?:\/\/[^\s)]+/gi, "[enlace redactado]");
}

/** Stable anonymous id per viewer scope (avoids enumerable DEV-last4). */
export function buildAnonymousId(candidateId: string, scope: string): string {
    const hash = createHash("sha256").update(`${scope}:${candidateId}`).digest("hex").slice(0, 6).toUpperCase();
    return `DEV-${hash}`;
}

/** Escape text for interpolation into HTML emails. */
export function escapeHtml(text: string): string {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

/** Escape text for interpolation into SVG (XML). */
export function escapeXml(text: string): string {
    return escapeHtml(text);
}

/** Allow-list check for internal links used in emails/notifications. */
export function isSafeInternalLink(link: string): boolean {
    if (!link) return false;
    return link.startsWith("/dashboard") || link.startsWith("/u/") || link.startsWith("/login");
}

/** Safe JSON parse with fallback (avoids 500 on legacy corrupt analysis). */
export function safeParseJson<T>(value: unknown, fallback: T | null): T | null {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") return value as T;
    if (typeof value !== "string") return fallback;
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}
