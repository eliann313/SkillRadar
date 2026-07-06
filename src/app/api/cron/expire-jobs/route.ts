import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    // Verificar autenticación mediante cabecera Authorization en producción
    const authHeader = request.headers.get("authorization");
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
