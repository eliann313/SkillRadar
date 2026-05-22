"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
