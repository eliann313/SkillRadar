# Reglas Operativas de SkillRadar

<!-- ──────────────────────────────────────────── -->

## 🔀 Flujo de Trabajo con Ramas y Pull Requests (Git Workflow)

<!-- ──────────────────────────────────────────── -->

Para asegurar la estabilidad de la rama principal (`main`) y garantizar que el pipeline de Integración Continua (CI) valide correctamente todas las modificaciones antes de integrarlas:

1. **Rama Base `develop`:** Todo desarrollo atómico (features, bugfixes, refactors) debe basarse y crearse a partir de la rama `develop` (no `main`), a menos que el usuario indique lo contrario de forma explícita:
   `git checkout develop && git pull origin develop`
2. **Ramas Separadas:** Crear una rama dedicada con el prefijo correspondiente (ej. `feature/job-match-ui` o `bugfix/auth-flow`) a partir de `develop`:
   `git checkout -b feature/<nombre-de-tarjeta>`
3. **Prohibido el Merge Directo a main o develop:** El agente de IA no debe fusionar directamente sus ramas de características localmente, ni hacer push directo a la rama `main` o `develop` remotas.
4. **Creación de Pull Requests (PR):**
    - Al finalizar la codificación, tests y linter, subir los cambios a la rama remota correspondiente.
    - Crear una Pull Request (PR) en GitHub apuntando a `develop`.
    - Permitir que el pipeline de CI en GitHub valide la compilación.
5. **Fusión Exclusiva por el Usuario:** La fusión (merge) de la PR a `develop` queda delegada al usuario. El agente no debe forzar la fusión automática sin revisión previa en la Pull Request.

---

## 🛠️ Validación y Calidad de Código

1. **Chequeo de Tipos y Compilación Manual:**
    - Correr **siempre** el chequeo de tipos manualmente antes de subir la rama:
      `cmd /c npm run type-check`
    - Ejecutar los tests de regresión locales:
      `cmd /c npm run test`
2. **Husky Hooks (Pre-Commit):**
    - El proyecto tiene Husky y `lint-staged` configurados. Al ejecutar `git commit`, se ejecutarán automáticamente Prettier y ESLint sobre los archivos staged. No es necesario correrlos a mano antes.

---

<!-- ──────────────────────────────────────────── -->

## 🏗️ Stack del Proyecto (v1.1)

<!-- ──────────────────────────────────────────── -->

- **Framework:** Next.js 16.2.9 (App Router)
- **Estilos:** Tailwind CSS v4.0
- **Base de Datos:** Prisma 7.x + Neon PostgreSQL (Connection pooling WebSocket en runtime)
- **Autenticación:** Auth.js v5 (NextAuth - beta) usando estrategia JWT
- **UI Components:** shadcn/ui integrado con `@base-ui/react ^1.5.0` (Base UI v1)

---

<!-- ──────────────────────────────────────────── -->

## 🚨 Reglas Críticas de Programación

<!-- ──────────────────────────────────────────── -->

### 1. No usar `asChild` en Elementos Interactivos

- **Motivo:** El proyecto utiliza Base UI v1 (`@base-ui/react`). En Base UI v1, la propiedad `asChild` está deprecada.
- **Solución:** Utilizar la propiedad `render={}` de Base UI.
    - _Correcto:_ `<Tooltip.Trigger render={<button type="button" className="..." />} />`
    - _Incorrecto:_ `<Tooltip.Trigger asChild><button className="..." /></Tooltip.Trigger>`

### 2. Zero `any` e Integridad de Tipos

- La tipación estricta en TypeScript es obligatoria. No está permitido el uso del tipo `any`.
- Si se requiere tipar la sesión de Auth.js, la interfaz ya está extendida en `src/types/next-auth.d.ts` e incluye `session.user.id` y `session.user.role`.

### 3. Server Components por Defecto

- Todos los archivos dentro de `src/app/` son **Server Components** por defecto.
- Agregar `"use client"` únicamente si se requiere interactividad, estado local (`useState`), efectos (`useEffect`) o eventos del navegador.

### 4. Patrón de Resultados Obligatorio en Server Actions

- Todas las Server Actions deben retornar el **Result Pattern**:
    ```typescript
    export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
    ```

### 5. Estilos Consistentes con Tailwind 4.0

- Usar clases utilitarias de Tailwind 4.0 sin parches ad-hoc fuera del sistema de diseño core.

---

<!-- ──────────────────────────────────────────── -->

## 📡 Next.js 16 — Cambios de API Críticos

<!-- ──────────────────────────────────────────── -->

### 1. Convención `src/proxy.ts` (Adiós `middleware.ts`)

- En Next.js 16, `middleware.ts` a nivel de raíz está deprecada y renombrada a `src/proxy.ts`.
- El middleware se define con un **named export** llamado `proxy`:
    ```typescript
    import NextAuth from "next-auth";
    import { authConfig } from "./lib/auth.config";
    export const proxy = NextAuth(authConfig).auth;
    export const config = { matcher: ["/", "/dashboard/:path*"] };
    ```

### 2. APIs Asíncronas Obligatorias

En Next.js 16, las siguientes APIs son **async** y deben consumirse con `await`:

- `cookies()`, `headers()`, `params`, `searchParams`

### 3. Server Actions como Mutations principales

- No usar endpoints REST internos (`app/api/**/*`) para mutaciones de componentes cliente.
- Usar Server Actions con `"use server"` al inicio del archivo.

---

<!-- ──────────────────────────────────────────── -->

## 🔒 Seguridad y Gobernanza Criptográfica

<!-- ──────────────────────────────────────────── -->

### 1. Cifrado de Secretos (API Keys de LLMs)

- **Algoritmo:** AES-256-GCM (`src/lib/crypto.ts`).
- **Formato en DB:** `ivHex:authTagHex:encryptedTextHex`. IV aleatorio único de 12 bytes por operación.
- **Prohibido** enviar ciphertext o IV al cliente. Solo exponer booleanos (`hasKey`).
- Descifrado exclusivamente en memoria del servidor antes de llamar al proveedor de IA.

### 2. Autenticación Híbrida Premium

- **Login:** Google/GitHub OAuth + Email/Contraseña. Passkeys (WebAuthn) a futuro.
- **Magic Links:** Reservados exclusivamente para "Forgot Password" vía Resend.
- **Bcrypt:** `bcryptjs` con mínimo 10–12 salt rounds. Zod: mínimo 8 chars, mayúscula, minúscula y número.
- **Rate Limiting:** Upstash Redis (máximo 5 intentos en 15 min por IP/email) en el endpoint de login.

### 3. Privacidad de Archivos (CVs)

- Routers de UploadThing deben validar sesión con `auth()`.
- No exponer URLs públicas estáticas al cliente. Usar `getSignedFileUrlAction` para URLs firmadas (máx. 1 hora).
- **SSRF Prevention:** Validar hostname contra allowlist (`utfs.io`, `ufs.sh`), sanitizar `fileKey` con `/^[a-zA-Z0-9\-_.]+$/`, reconstruir URL con strings estáticos.

### 4. Plataforma Recruiter & Doble Ciego

- Para perfiles con `status !== "accepted"`, excluir en DB: `name`, `email`, `githubUsername`, `image`. **Nunca enviarlos al browser y ocultarlos en UI.**
- Sanitizar JDs y pitches de reclutamiento contra XSS.

### 5. Prevención de Inyecciones de Prompts

- Encapsular inputs del usuario en delimitadores claros (`=== INICIO ===`) e inyectar instrucciones en el prompt de sistema para tratar las entradas como datos pasivos.

---

<!-- ──────────────────────────────────────────── -->

## 🗄️ Base de Datos — Convenciones Prisma & Neon

<!-- ──────────────────────────────────────────── -->

### 1. Selective Repository Pattern (Evitar Capas Anémicas)

- **NO usar repository** para CRUD básico (`findUnique`, inserciones simples, actualizaciones de un campo).
- **SÍ usar `repository.ts`** para: joins complejos, filtros reutilizables, queries compartidas entre features.

### 2. Connection Pooling en Vercel Serverless

- Usar `@neondatabase/serverless` + `@prisma/adapter-neon` en `src/lib/db.ts`.
- En producción si es necesario: `?pgbouncer=true&connection_limit=1` en `DATABASE_URL`.

### 3. Tipos Generados

- Ejecutar `npx prisma generate` tras modificar `prisma/schema.prisma`.
- Evitar casts manuales a retornos de Prisma; usar los tipos implícitos generados.

---

<!-- ──────────────────────────────────────────── -->

## 🧠 Integración de Inteligencia Artificial

<!-- ──────────────────────────────────────────── -->

- **SDK:** Vercel AI SDK (`ai` + `@ai-sdk/google`). Proveedor: Gemini → fallback OpenRouter.

### 1. Streaming Obligatorio para Procesos Largos

- Vercel Hobby: timeout de 10–15 segundos. El análisis de CV / Job Match tarda 15–25 seg.
- **Regla:** Todo proceso > 8 segundos usa **`streamObject`** (Server-Sent Events) para mantener la conexión viva.

### 2. Structured Outputs con Zod

- **Prohibido** pedir JSON con prompts planos. Usar **`generateObject`** / **`streamObject`** con schema Zod:
    ```typescript
    const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: atsAnalysisSchema,
        system: "Actúa como reclutador técnico...",
        prompt: `Analiza: ${cvText}`,
    });
    ```

### 3. Resiliencia y Modo Mock

- Si Gemini falla (rate limits), redirigir a OpenRouter de forma transparente.
- En desarrollo sin `GEMINI_API_KEY`, activar **Mock offline** para prototipar sin API Keys.

---

## 📖 Referencias de Reglas Específicas

Los archivos fuente de cada regla están en `.agents/` (espejo de `.cursor/rules/`):

- **[skillradar-security.md](.agents/skillradar-security.md)**: Cifrado AES-256-GCM, Auth Híbrida, SSRF, Doble Ciego.
- **[skillradar-db.md](.agents/skillradar-db.md)**: Convenciones Prisma y Neon.
- **[skillradar-ai.md](.agents/skillradar-ai.md)**: AIService multi-modelo y prompts pasivos.
- **[skillradar-nextjs16.md](.agents/skillradar-nextjs16.md)**: Convenciones Next.js 16 y Tailwind v4.
- **[skillradar-actions.md](.agents/skillradar-actions.md)**: Server Actions y Result Pattern.
- **[skillradar-workflow.md](.agents/skillradar-workflow.md)**: Git workflow completo y CI/CD.
- **[skillradar-global.md](.agents/skillradar-global.md)**: Reglas globales de arquitectura.
