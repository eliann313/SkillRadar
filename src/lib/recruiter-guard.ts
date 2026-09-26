"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isGuestSession } from "@/lib/guest-guard";

export const RECRUITER_PENDING_ERROR =
    "Cuenta recruiter pendiente de verificación. Completá la solicitud y te avisaremos por email.";

/**
 * Gate central de recruiter verificado.
 * Sesión + rol recruiter + no guest + recruiterVerified en DB.
 * Devuelve la sesión si pasa, null si no.
 */
export async function requireVerifiedRecruiter() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "recruiter" || isGuestSession(session)) {
        return null;
    }
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { recruiterVerified: true },
    });
    if (!user?.recruiterVerified) return null;
    return session;
}

/** Solicitud de verificación (la revisa un admin). */
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
