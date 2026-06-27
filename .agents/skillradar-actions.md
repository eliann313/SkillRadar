---
trigger: always_on
description: Reglas y mejores prácticas para Server Actions en Next.js (Mutaciones, Seguridad y Flujo)
globs: src/features/**/actions.ts, src/lib/auth-actions.ts
---

# Convenciones de Server Actions - SkillRadar

## 🚨 Reglas Críticas de Server Actions

### 1. Directiva `"use server"` obligatoria

Toda Server Action debe residir en archivos dedicados de actions (por feature) y tener `"use server";` al inicio del archivo para compilarse como endpoints POST de Next.js seguros.

### 2. Patrón de Resultados Obligatorio (Result Pattern)

No arrojes excepciones sin capturar en una Server Action; esto causará fallos en producción y un comportamiento inconsistente en el cliente.

- **Estructura Requerida:** Retorna siempre un objeto consistente del tipo `ActionResult<T>` dentro de bloques `try/catch`.
- **Definición de Tipo:**
    ```typescript
    export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
    ```
- **Ejemplo Correcto:**
    ```typescript
    export async function myAction(input: InputType): Promise<ActionResult<ResultType>> {
        try {
            // 1. Validaciones e IA
            const result = await myService.run(input);
            return { success: true, data: result };
        } catch (error) {
            console.error("[myAction] Error:", error);
            return { success: false, error: "Ocurrió un error al realizar la operación" };
        }
    }
    ```

### 3. Autenticación y Verificación de Roles en Servidor

No confíes en las validaciones de sesión del cliente. Cada Server Action _debe_ verificar el contexto de seguridad llamando a `auth()` de NextAuth:

```typescript
import { auth } from "@/lib/auth";

const session = await auth();
if (!session?.user?.id) {
    return { success: false, error: "Sesión expirada o no autorizado." };
}
```

### 4. Validación Estricta con Zod en Servidor

Siempre valida los datos de entrada en el servidor usando schemas de **Zod**, incluso si ya los has validado en el cliente para UX:

```typescript
const parsed = myZodSchema.safeParse(input);
if (!parsed.success) {
    return { success: false, error: "Datos de formulario inválidos." };
}
```

### 5. Revalidación de Caché (`revalidatePath`)

Después de realizar con éxito una escritura en base de datos en una Server Action, refresca la caché de las páginas afectadas para asegurar consistencia en la UI:

```typescript
import { revalidatePath } from "next/cache";

// Después de insertar un CV
revalidatePath("/dashboard");
```
