"use server";

import { auth } from "@/infrastructure/auth";
import { db } from "@/infrastructure/db";
import { isGuestSession } from "@/infrastructure/guest-guard";

/**
 * Solicitud de verificación (la revisa un admin, salvo auto-aprobación).
 *
 * Auto-aprobación: email verificado (OAuth) + dominio corporativo (no freemail).
 * El resto sigue a revisión manual. Nunca auto-aprueba guests ni emails sin verificar.
 */
const FREE_EMAIL_DOMAINS = new Set([
    "gmail.com",
    "googlemail.com",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "msn.com",
    "yahoo.com",
    "yahoo.com.ar",
    "ymail.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "proton.me",
    "protonmail.com",
    "tutanota.com",
    "aol.com",
    "zoho.com",
    "gmx.com",
    "mail.com",
]);

function isCorporateEmailDomain(email: string): boolean {
    const domain = email.trim().toLowerCase().split("@")[1] ?? "";
    if (!domain || !domain.includes(".")) return false;
    return !FREE_EMAIL_DOMAINS.has(domain);
}

export async function requestRecruiterVerification(note: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "recruiter" || isGuestSession(session)) {
        return { success: false as const, error: "No autorizado." };
    }
    const clean = note.trim().slice(0, 500);
    if (clean.length < 10) {
        return { success: false as const, error: "Contanos en al menos 10 caracteres dónde reclutás." };
    }
    const me = await db.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, emailVerified: true, recruiterVerified: true },
    });
    if (me?.recruiterVerified) {
        return { success: true as const, autoApproved: true as const };
    }
    // Dominio corporativo + email verificado → verificación inmediata, sin cola de admin.
    if (me?.email && me.emailVerified && isCorporateEmailDomain(me.email)) {
        await db.user.update({
            where: { id: session.user.id },
            data: { recruiterVerified: true, verificationRequestedAt: new Date(), verificationNote: clean },
        });
        return { success: true as const, autoApproved: true as const };
    }
    await db.user.update({
        where: { id: session.user.id },
        data: { verificationRequestedAt: new Date(), verificationNote: clean },
    });
    return { success: true as const, autoApproved: false as const };
}
