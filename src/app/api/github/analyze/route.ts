import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkGithubRateLimit } from "@/lib/rate-limit";
import { GithubAnalysisService } from "@/features/github/service";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { username } = body;

        if (!username || typeof username !== "string") {
            return NextResponse.json({ error: "El nombre de usuario de GitHub es requerido." }, { status: 400 });
        }

        // Sanitización estricta (SSRF Prevention)
        const sanitizedUsername = username.trim();
        if (!/^[a-zA-Z0-9\-]+$/.test(sanitizedUsername)) {
            return NextResponse.json(
                { error: "Nombre de usuario inválido. Solo se permiten caracteres alfanuméricos y guiones." },
                { status: 400 },
            );
        }

        // Rate Limiting
        const limitResult = await checkGithubRateLimit(`user:${session.user.id}`);
        if (!limitResult.success) {
            return NextResponse.json(
                { error: "Límite de solicitudes de análisis de GitHub excedido. Inténtalo de nuevo más tarde." },
                { status: 429 },
            );
        }

        const analysis = await GithubAnalysisService.analyzeUser(session.user.id, sanitizedUsername);

        return NextResponse.json({ success: true, data: analysis });
    } catch (error: unknown) {
        console.error("[GitHub Analyze Route] Error:", error);
        const message = error instanceof Error ? error.message : "Error interno del servidor.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
