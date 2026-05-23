# Skill: Template de Server Action Limpia

Este template define el estándar e industria de codificación para crear **Server Actions** seguras, limpias y altamente tipadas en SkillRadar.

---

## Estructura Estándar

Toda Server Action debe seguir este flujo quirúrgico:

1. **Directiva `"use server"`** al inicio del archivo.
2. **Control de Autenticación:** Validar la sesión del servidor con `auth()`.
3. **Validación con Zod:** Usar `safeParse` para validar los parámetros de entrada.
4. **Try/Catch Block:** Capturar errores internos y hacer log estructurado.
5. **Result Pattern:** Retornar `{ success: true, data }` o `{ success: false, error }`.
6. **Revalidación (Opcional):** Usar `revalidatePath()` o `revalidateTag()` para actualizar el caché de Next.js.

---

## Ejemplo Completo

```typescript
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// 1. Definición del Schema con Zod
const analyzeResumeSchema = z.object({
  resumeId: z.string().cuid("El ID de CV no es válido"),
  jobText: z
    .string()
    .min(50, "La oferta laboral debe tener al menos 50 caracteres"),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// 2. La Server Action
export async function analyzeResume(
  input: AnalyzeResumeInput,
): Promise<ActionResult<{ matchScore: number }>> {
  // A. Control de Autenticación
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado. Inicie sesión." };
  }

  // B. Validación Zod
  const parsed = analyzeResumeSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
    return { success: false, error: errorMsg };
  }

  const { resumeId, jobText } = parsed.data;

  try {
    // C. Simulación o lógica de negocio (Llamada al servicio)
    // const result = await jobMatchService.analyze(resumeId, jobText, session.user.id);

    // Log estructurado para trazabilidad
    console.log(`[job-match/action] CV analizado exitosamente`, {
      userId: session.user.id,
      resumeId,
    });

    // D. Revalidar la vista en Next.js
    revalidatePath("/dashboard/job-match");

    // E. Retornar éxito
    return { success: true, data: { matchScore: 85 } };
  } catch (error: any) {
    // Log estructurado del error
    console.error("[job-match/action] Error interno en análisis:", {
      userId: session.user.id,
      resumeId,
      error: error.message || error,
    });

    return {
      success: false,
      error: "Ocurrió un error inesperado al procesar la compatibilidad.",
    };
  }
}
```
