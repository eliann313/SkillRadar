"use server";

import { createHash, randomBytes } from "node:crypto";
import { logger } from "@/infrastructure/logger";
import { db } from "@/infrastructure/db";
import { auth } from "@/infrastructure/auth";
import { getEmailFrom } from "@/infrastructure/mail";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { trackServerEvent } from "@/infrastructure/analytics";
import { checkLoginRateLimit, getClientIp } from "@/infrastructure/rate-limit";
import { rejectGuestWrite } from "@/infrastructure/guest-guard";

export async function updateUserRole(role: "developer" | "recruiter") {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" };
    }

    const blocked = rejectGuestWrite(session);
    if (blocked) return blocked;

    try {
        await db.user.update({
            where: { id: session.user.id },
            data:
                role === "recruiter"
                    ? { role, recruiterVerified: false, verificationRequestedAt: null, verificationNote: null }
                    : { role },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: unknown) {
        logger.error("[updateUserRole] Error al actualizar rol:", error);
        return { success: false, error: "Error interno al actualizar el rol" };
    }
}

const registerSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional().or(z.literal("")),
    email: z.string().email("Correo electrónico inválido"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
        .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
    role: z.enum(["developer", "recruiter"]),
    ageConfirmed: z.boolean().refine((v) => v === true, "Debes confirmar que tienes al menos 13 años."),
});

export async function registerUserAction(input: {
    name?: string;
    email: string;
    password: string;
    role: "developer" | "recruiter";
    ageConfirmed: boolean;
}) {
    const result = registerSchema.safeParse(input);
    if (!result.success) {
        const errorMsg = result.error.issues[0]?.message || "Datos de entrada inválidos.";
        return { success: false, error: errorMsg };
    }

    const { name, email, password, role } = result.data;
    const sanitizedEmail = email.toLowerCase().trim();

    try {
        const rl = await checkLoginRateLimit(`register:${await getClientIp()}`);
        if (!rl.success) {
            return { success: false, error: "Demasiados registros. Inténtalo más tarde." };
        }

        const existingUser = await db.user.findUnique({
            where: { email: sanitizedEmail },
        });

        if (existingUser) {
            return {
                success: false,
                error: "El correo electrónico ya está registrado.",
            };
        }

        // 12 salt rounds para máxima resistencia a ataques de fuerza bruta en reposo
        const passwordHash = await bcrypt.hash(password, 12);

        const user = await db.user.create({
            data: {
                name: name || null,
                email: sanitizedEmail,
                passwordHash,
                role,
            },
        });

        // Registrar analítica
        await trackServerEvent("user_registered", user.id, { role });

        return { success: true, message: "Usuario registrado con éxito." };
    } catch (error: unknown) {
        logger.error("[registerUserAction] Error registrando usuario:", error);
        return {
            success: false,
            error: "Ocurrió un error inesperado al registrar el usuario.",
        };
    }
}

const resetPasswordSchema = z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/i, "El token de restablecimiento no es válido."),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
        .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
});

export async function requestPasswordResetAction(email: string) {
    const emailResult = z.string().email("Correo electrónico inválido.").safeParse(email);
    if (!emailResult.success) {
        return { success: false, error: "Correo electrónico inválido." };
    }

    const sanitizedEmail = emailResult.data.toLowerCase().trim();
    const genericResponse = {
        success: true,
        message: "Si el correo está registrado, se enviarán las instrucciones.",
    };

    try {
        const ip = await getClientIp();
        const [ipLimit, emailLimit] = await Promise.all([
            checkLoginRateLimit(`password-reset:ip:${ip}`),
            checkLoginRateLimit(`password-reset:email:${sanitizedEmail}`),
        ]);
        if (!ipLimit.success || !emailLimit.success) {
            return genericResponse;
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            logger.error("[requestPasswordResetAction] Resend no está configurado; no se emitió un token.");
            return genericResponse;
        }

        const user = await db.user.findUnique({
            where: { email: sanitizedEmail },
        });

        if (!user) {
            return genericResponse;
        }

        // El token aleatorio solo se guarda en forma de hash; el enlace nunca se escribe en logs.
        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(token).digest("hex");
        const expires = new Date(Date.now() + 15 * 60 * 1000);

        await db.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: tokenHash,
                passwordResetExpires: expires,
            },
        });

        const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
                from: getEmailFrom(),
                to: sanitizedEmail,
                subject: "Restablece tu contraseña - SkillRadar",
                html: `<p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla (expira en 15 minutos):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
            }),
            signal: AbortSignal.timeout(10_000),
        });

        if (!response.ok) {
            await db.user.update({
                where: { id: user.id },
                data: { passwordResetToken: null, passwordResetExpires: null },
            });
            logger.error("[requestPasswordResetAction] Resend rechazó el correo de restablecimiento.");
        }

        return genericResponse;
    } catch (error: unknown) {
        logger.error("[requestPasswordResetAction] Error:", error);
        return genericResponse;
    }
}
export async function resetPasswordAction(input: z.infer<typeof resetPasswordSchema>) {
    const result = resetPasswordSchema.safeParse(input);
    if (!result.success) {
        return { success: false, error: result.error.issues[0]?.message || "Datos inválidos." };
    }

    const { token, password } = result.data;

    try {
        const tokenHash = createHash("sha256").update(token).digest("hex");
        const user = await db.user.findFirst({
            where: { passwordResetToken: tokenHash },
        });

        if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            return { success: false, error: "El token de restablecimiento es inválido o ha expirado." };
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await db.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        return { success: true, message: "Tu contraseña ha sido restablecida con éxito." };
    } catch (error: unknown) {
        logger.error("[resetPasswordAction] Error:", error);
        return { success: false, error: "Error al restablecer la contraseña." };
    }
}
