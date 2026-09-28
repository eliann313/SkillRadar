"use server";

import { auth } from "@/infrastructure/auth";
import { db } from "@/infrastructure/db";
import { isGuestSession } from "@/infrastructure/guest-guard";

/**
 * Solicitud de verificación (la revisa un admin). */
export async function requestRecruiterVerification(note: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "recruiter" || isGuestSession(session)) {
        return { success: false as const, error: "No autorizado." };
    }
    const clean = note.trim().slice(0, 500);
    if (clean.length < 10) {
        return { success: false as const, error: "Contanos en al menos 10 caracteres dónde reclutás." };
    }
    await db.user.update({
        where: { id: session.user.id },
        data: { verificationRequestedAt: new Date(), verificationNote: clean },
    });
    return { success: true as const };
}
