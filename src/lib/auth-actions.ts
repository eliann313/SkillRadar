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
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional()
    .or(z.literal("")),
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
    const errorMsg =
      result.error.issues[0]?.message || "Datos de entrada inválidos.";
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
