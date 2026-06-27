---
description: Guía de cambios de API y convenciones específicas de Next.js 16 (App Router)
globs: src/app/**/*, src/proxy.ts
---

# Guía Next.js 16 (App Router) para SkillRadar

## 1. Convención `src/proxy.ts` (Adiós `middleware.ts`)

- **Motivo:** En Next.js 16, la convención `middleware.ts` a nivel de raíz ha sido deprecada y renombrada a `proxy.ts` bajo la carpeta `src/`.
- **Uso:** El middleware de la aplicación se define en `src/proxy.ts` con un **named export** llamado `proxy`.
- **Ejemplo Correcto:**

    ```typescript
    import NextAuth from "next-auth";
    import { authConfig } from "./lib/auth.config";

    export const proxy = NextAuth(authConfig).auth;

    export const config = {
        matcher: ["/", "/dashboard/:path*"],
    };
    ```

## 2. APIs Asíncronas obligatorias

En Next.js 16, las siguientes APIs de cabeceras y cookies son **asíncronas** de forma obligatoria y deben ser consumidas con `await`:

- `cookies()`
- `headers()`
- `params` y `searchParams` en componentes de página y layouts

### Ejemplos de uso correcto:

```typescript
// En un Server Component o Server Action
import { cookies, headers } from "next/headers";

export async function MyServerComponent({ params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const theme = cookieStore.get("theme");

    const headerList = await headers();
    const userAgent = headerList.get("user-agent");

    const resolvedParams = await params;
    const id = resolvedParams.id;

    // ...
}
```

## 3. Server Actions como Mutations principales

- No utilizar endpoints de API REST internos (`app/api/**/*`) para mutaciones procedentes de componentes clientes.
- Utilizar Server Actions mediante la declaración `"use server"` al inicio del archivo o de la función.
