"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function updateUserRole(role: "developer" | "recruiter") {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" };
    }

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: { role },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: unknown) {
        console.error("[updateUserRole] Error al actualizar rol:", error);
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
});

export async function registerUserAction(input: {
    name?: string;
    email: string;
    password: string;
    role: "developer" | "recruiter";
}) {
    const result = registerSchema.safeParse(input);
    if (!result.success) {
        const errorMsg = result.error.issues[0]?.message || "Datos de entrada inválidos.";
        return { success: false, error: errorMsg };
    }

    const { name, email, password, role } = result.data;
    const sanitizedEmail = email.toLowerCase().trim();

    try {
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

        await db.user.create({
            data: {
                name: name || null,
                email: sanitizedEmail,
                passwordHash,
                role,
            },
        });

        return { success: true, message: "Usuario registrado con éxito." };
    } catch (error: unknown) {
        console.error("[registerUserAction] Error registrando usuario:", error);
        return {
            success: false,
            error: "Ocurrió un error inesperado al registrar el usuario.",
        };
    }
}

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
        .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
});

export async function requestPasswordResetAction(email: string) {
    if (!email) return { success: false, error: "El correo es requerido." };
    const sanitizedEmail = email.toLowerCase().trim();

    try {
        const user = await db.user.findUnique({
            where: { email: sanitizedEmail },
        });

        if (!user) {
            return { success: true, message: "Si el correo está registrado, se enviarán las instrucciones." };
        }

        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        await db.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: token,
                passwordResetExpires: expires,
            },
        });

        const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;

        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
            try {
                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${resendApiKey}`,
                    },
                    body: JSON.stringify({
                        from: "SkillRadar <onboarding@resend.dev>",
                        to: sanitizedEmail,
                        subject: "Restablece tu contraseña - SkillRadar",
                        html: `<p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla (expira en 15 minutos):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
                    }),
                });
                console.warn(`✉️ [Resend] Correo enviado a ${sanitizedEmail}`);
            } catch (mailError) {
                console.error("❌ Error al enviar email con Resend:", mailError);
            }
        } else {
            console.warn(
                `\n🔑 [Reset Password Simulation] Link de restablecimiento para ${sanitizedEmail}:\n🔗 ${resetLink}\n`,
            );
        }

        return { success: true, message: "Si el correo está registrado, se enviarán las instrucciones." };
    } catch (error: unknown) {
        console.error("[requestPasswordResetAction] Error:", error);
        return { success: false, error: "Error al solicitar el restablecimiento." };
    }
}

export async function resetPasswordAction(input: z.infer<typeof resetPasswordSchema>) {
    const result = resetPasswordSchema.safeParse(input);
    if (!result.success) {
        return { success: false, error: result.error.issues[0]?.message || "Datos inválidos." };
    }

    const { token, password } = result.data;

    try {
        const user = await db.user.findFirst({
            where: { passwordResetToken: token },
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
        console.error("[resetPasswordAction] Error:", error);
        return { success: false, error: "Error al restablecer la contraseña." };
    }
}
