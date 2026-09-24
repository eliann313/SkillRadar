import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    // Verificar autenticación mediante cabecera Authorization (también en preview/dev si hay secreto)
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return new NextResponse("Cron no configurado", { status: 503 });
    }
    if (authHeader !== `Bearer ${secret}`) {
        return new NextResponse("No autorizado", { status: 401 });
    }

    try {
        const now = new Date();
        const result = await db.jobPosting.updateMany({
            where: {
                status: "published",
                expiresAt: {
                    lt: now,
                },
            },
            data: {
                status: "closed",
            },
        });

        console.warn(`[Cron Expire Jobs] Éxito: ${result.count} ofertas laborales expiradas.`);
        return NextResponse.json({
            success: true,
            message: `Se expiraron automáticamente ${result.count} ofertas laborales.`,
        });
    } catch (error) {
        console.error("[Cron Expire Jobs] Error:", error);
        return NextResponse.json(
            { success: false, error: (error as Error).message || "Error al procesar el cron job" },
            { status: 500 },
        );
    }
}
