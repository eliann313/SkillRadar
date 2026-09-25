import { auth } from "@/lib/auth";
import { checkCVRateLimit } from "@/lib/rate-limit";
import { validateBlobFileUrl } from "@/lib/file-storage";

/**
 * Proxy de descarga de CVs con control de ownership.
 *
 * El cliente nunca recibe la URL cruda de Vercel Blob de forma persistente:
 * esta ruta verifica sesión + ownership en DB y retransmite el PDF.
 * Query: GET /api/files?url=<blobUrl codificada>
 */
export async function GET(request: Request): Promise<Response> {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: "No autorizado. Inicie sesión nuevamente." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const validation = validateBlobFileUrl(searchParams.get("url") ?? "");
    if (!validation.ok) {
        return Response.json({ error: validation.error }, { status: 400 });
    }

    // Ownership: solo el dueño del resume puede descargar su fileKey (evita IDOR)
    const { db } = await import("@/lib/db");
    const owned = await db.resume.findFirst({
        where: { userId: session.user.id, fileUrl: validation.validatedUrl },
        select: { id: true, fileName: true },
    });
    if (!owned) {
        return Response.json({ error: "Archivo no encontrado para este usuario." }, { status: 404 });
    }

    const rl = await checkCVRateLimit(`user:${session.user.id}`);
    if (!rl.success) {
        return Response.json({ error: "Límite diario de descargas alcanzado." }, { status: 429 });
    }

    const upstream = await fetch(validation.validatedUrl);
    if (!upstream.ok || !upstream.body) {
        return Response.json({ error: "No se pudo descargar el archivo." }, { status: 502 });
    }

    return new Response(upstream.body, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${encodeURIComponent(owned.fileName || "cv.pdf")}"`,
            "Cache-Control": "private, max-age=300",
        },
    });
}
