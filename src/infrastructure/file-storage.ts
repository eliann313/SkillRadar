/**
 * Validación centralizada de URLs de Vercel Blob (barrera anti-SSRF).
 *
 * Solo se aceptan URLs https cuyo host sea `<store>.public.blob.vercel-storage.com`
 * o `<store>.private.blob.vercel-storage.com` (el modo lo define el store).
 * La URL validada se reconstruye con el host verificado y un fileKey de
 * caracteres seguros, desacoplando el host destino del input del usuario.
 */

const BLOB_URL_REGEX = /^https:\/\/[a-z0-9-]+\.(public|private)\.blob\.vercel-storage\.com\/.+/i;
// El fileKey de Blob incluye carpetas (`cvs/<userId>/...`), por eso se permite `/`.
// Se rechaza `..` por separado para bloquear path traversal.
const SAFE_BLOB_KEY_REGEX = /^[a-zA-Z0-9\-_./]+$/;

export const MAX_CV_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export type BlobUrlValidation = { ok: true; fileKey: string; validatedUrl: string } | { ok: false; error: string };

export function validateBlobFileUrl(fileUrl: string): BlobUrlValidation {
    if (!fileUrl || typeof fileUrl !== "string") {
        return { ok: false, error: "URL de archivo no proporcionada." };
    }

    if (!BLOB_URL_REGEX.test(fileUrl)) {
        return { ok: false, error: "URL de archivo no permitida por razones de seguridad." };
    }

    let parsed: URL;
    try {
        parsed = new URL(fileUrl);
    } catch {
        return { ok: false, error: "URL de archivo inválida o no permitida." };
    }

    if (parsed.protocol !== "https:") {
        return { ok: false, error: "URL de archivo no permitida por razones de seguridad." };
    }

    const host = parsed.hostname.toLowerCase();
    if (!/^[a-z0-9-]+\.(public|private)\.blob\.vercel-storage\.com$/.test(host)) {
        return { ok: false, error: "URL de archivo no permitida por razones de seguridad." };
    }

    const fileKey = parsed.pathname.startsWith("/") ? parsed.pathname.substring(1) : parsed.pathname;
    if (!fileKey || fileKey.includes("..") || !SAFE_BLOB_KEY_REGEX.test(fileKey)) {
        return { ok: false, error: "Nombre de archivo contiene caracteres no permitidos." };
    }

    // Reconstrucción con host verificado: el destino ya no depende del input crudo.
    return { ok: true, fileKey, validatedUrl: `https://${host}/${fileKey}` };
}
