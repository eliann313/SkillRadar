# Roadmap Técnico — SkillRadar

| Campo        | Valor                  |
| ------------ | ---------------------- |
| **Proyecto** | SkillRadar             |
| **Tipo**     | Architecture + Roadmap |
| **Versión**  | v1.1.0                 |
| **Estado**   | Draft                  |
| **Autor**    | Elian                  |
| **Fecha**    | 2026-05-21             |

---

## Tabla de Contenidos

1. [Visión y Problema Real](#1-visión-y-problema-real)
2. [Stack Final y Por Qué](#2-stack-final-y-por-qué)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Estructura de Carpetas](#4-estructura-de-carpetas)
5. [Convenciones del Proyecto](#5-convenciones-del-proyecto)
6. [Conceptos Clave de Next.js que Debés Dominar](#6-conceptos-clave-de-nextjs-que-debés-dominar)
7. [Estrategias Transversales](#7-estrategias-transversales)
8. [Fases de Desarrollo](#8-fases-de-desarrollo)
9. [Deployment y CI/CD](#9-deployment-y-cicd)
10. [Testing](#10-testing)
11. [Escalabilidad Futura](#11-escalabilidad-futura)
12. [Guía Personal: Cómo Presentarlo en Entrevistas](#12-guía-personal-cómo-presentarlo-en-entrevistas)

---

## 1. Visión y Problema Real

### 1.1 Qué es el producto

Una plataforma web que permite a desarrolladores tech analizar su perfil profesional de forma integral: CV, GitHub y una oferta laboral específica, y recibir feedback accionable generado por IA.

No es un chatbot. Es una herramienta con flujos definidos, datos estructurados, y resultados reproducibles.

### 1.2 Usuarios objetivo

| Perfil                      | Problema que tiene               | Cómo el producto lo resuelve    |
| --------------------------- | -------------------------------- | ------------------------------- |
| Developer Jr/Mid            | No sabe si su CV llega a un ATS  | Score + análisis de keywords    |
| Developer buscando trabajo  | No sabe si encaja en una oferta  | Job matching con su CV y GitHub |
| Developer que quiere crecer | No tiene claro qué aprender      | Career roadmap personalizado    |
| Recruiter técnico           | Quiere evaluar candidatos rápido | Vista de perfil integrado (V2)  |

### 1.3 Features por versión

**MVP (lo que importa para portfolio):**

- Subir CV en PDF → análisis ATS + score
- Pegar job offer → match contra CV + gaps detectados
- Conectar GitHub → análisis de repos + score técnico
- Dashboard con resultados

**V2 (muestra que pensaste en escala):**

- Career roadmap generado por IA
- Comparación histórica de análisis
- Vista recruiter
- Mock interview

---

## 2. Stack Final y Por Qué

### 2.1 Decisión de Stack

```
Frontend:  Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
Backend:   Next.js Route Handlers + Server Actions (mismo proyecto)
Database:  PostgreSQL via Neon (free tier, con connection pooling activado)
ORM:       Prisma
Auth:      Auth.js v5 (NextAuth) con GitHub OAuth
Files:     UploadThing (free tier)
IA:        Vercel AI SDK + Google Gemini (proveedor) + OpenRouter (fallback manual)
Deploy:    Vercel (free tier, Hobby plan)
Dev local: Docker Compose solo para PostgreSQL local
```

### 2.2 Por qué cada elección

#### Next.js 16 (App Router) — no NestJS

NestJS es excelente pero requiere aprender Angular-style DI, decoradores, módulos, providers, y además deployarlo separado. Para este scope, Next.js App Router ya te da:

- Routing automático
- Server Components (no frontend/backend, son lo mismo)
- Server Actions para mutations
- Route Handlers para APIs externas
- Deploy en Vercel en un click

El trade-off es claro: si en el futuro el backend crece demasiado, extraés los Route Handlers a un servicio separado. Pero esa migración es mucho más simple que arrancar con dos proyectos desde cero.

> 💡 **Para entrevistas:** "Elegí Next.js full-stack porque para el scope del MVP la colocación de frontend/backend en el mismo proyecto reducía complejidad operacional significativamente. Tengo claro cómo separarlo si el backend escala."

#### TypeScript

No opcional. Los recruiters técnicos van a ver tu código. TypeScript muestra disciplina.

#### Tailwind + shadcn/ui

shadcn/ui no es una librería de componentes — es un sistema de copy/paste de componentes que viveen _tu_ proyecto. No dependés de actualizaciones externas. Podés modificar cualquier componente. Esto es importante para entrevistas: podés explicar que sabés la diferencia entre una librería externa y un sistema de componentes propio.

#### Neon (PostgreSQL)

Free tier con branching de base de datos (muy útil para no romper producción mientras desarrollás). PostgreSQL es la DB más común en el mercado.

> ⚠️ **Configuración crítica para Vercel:** Las funciones serverless abren múltiples conexiones a DB simultáneamente. Sin connection pooling, Neon puede saturarse. Activar **pgBouncer** agregando `?pgbouncer=true&connection_limit=1` a la `DATABASE_URL` de producción. Neon lo provee nativamente — es un parámetro de la connection string.

#### Prisma

ORM con generación de tipos automática. Cuando hacés una query, TypeScript ya sabe exactamente qué te devuelve. Excelente para aprender porque el schema es declarativo y fácil de leer.

#### Auth.js v5

No reinventés auth. Es complejo, tiene edge cases de seguridad, y no es lo que querés mostrar en portfolio. Auth.js maneja sesiones, tokens, OAuth, y tiene integración nativa con Next.js.

#### Vercel AI SDK + Google Gemini + OpenRouter

El Vercel AI SDK es la librería estándar del ecosistema para integrar LLMs en Next.js. Resuelve un problema crítico que no es obvio hasta que llegás a producción:

> ⚠️ **Riesgo crítico sin SDK:** Vercel Hobby plan tiene timeout de 10-15s por función. Un LLM analizando un CV completo tarda 15-25s. Sin streaming, tu Server Action da **error 504 en producción** aunque funcione perfecto en local (sin límite de tiempo). Con `streamObject` del AI SDK, la conexión se mantiene viva y el usuario ve resultados aparecer progresivamente.

Además, el SDK incluye `generateObject` que usa **Structured Outputs** a nivel API — en lugar de pedirle al modelo "respondé solo JSON" (que puede alucinar y romper el `z.parse`), el modelo tiene el schema como restricción nativa y garantiza un objeto válido.

Usamos **Gemini como proveedor principal** (free tier generoso) con un **fallback manual a OpenRouter** para cuando Gemini excede rate limits. El AI SDK no cubre OpenRouter natively de forma completa, así que el fallback es código propio pero minimal.

#### Docker solo para local

`docker-compose.yml` con un container de PostgreSQL para desarrollo local. Nada más. No vas a dockerizar la app en sí porque Vercel maneja el deploy. Pero tener el `docker-compose.yml` en el repo muestra que sabés.

### 2.3 Lo que deliberadamente NO usás

| Tecnología     | Por qué no                                                     |
| -------------- | -------------------------------------------------------------- |
| NestJS         | Overkill para este scope, dos deployments                      |
| Redux/Zustand  | El estado que necesitás es principalmente server-side          |
| Microservicios | Complejidad operacional innecesaria                            |
| MongoDB        | PostgreSQL es más relevante para el mercado                    |
| Kubernetes     | No aplica para este scope                                      |
| tRPC           | Útil, pero agrega abstracción antes de entender Route Handlers |

---

## 3. Arquitectura del Sistema

### 3.1 Patrón elegido: Feature-Based Layered Architecture

No usamos Clean Architecture completa ni Onion Architecture. Ambas son válidas pero agregan capas de abstracción (interfaces, mappers, adapters) que en Next.js App Router generan fricción innecesaria.

Lo que usamos es una **arquitectura por features con capas internas**, que es pragmática y se ve en empresas reales:

```
Cada feature tiene su propia carpeta con:
  - UI (componentes React)
  - Actions (Server Actions / mutations)
  - Services (lógica de negocio pura)
  - Repository (acceso a DB via Prisma)
  - Types (tipos TypeScript de esa feature)
```

### 3.2 Por qué no Clean Architecture completa

Clean Architecture dice: "las capas internas no conocen las externas". Esto es correcto en sistemas grandes. Pero en Next.js, los Server Components _son_ la capa de presentación _y_ pueden acceder a la DB directamente via Prisma sin que eso sea un error de diseño — es una característica del framework.

**Sobre el Repository Pattern — postura pragmática:**
Un `repository.ts` que solo hace `return prisma.resume.findMany({ where: { userId } })` es una capa anémica y no agrega valor. Usamos repositories **selectivamente**:

| Cuándo SÍ usar repository                | Cuándo NO (query directa en service/action) |
| ---------------------------------------- | ------------------------------------------- |
| Query con múltiples joins o subqueries   | `findById`, `findByUserId` simples          |
| Lógica de filtrado compleja reutilizable | Inserts directos sin transformación         |
| Query que se usa en más de un lugar      | Operaciones únicas y simples                |

Esto es defendible en entrevistas: "Usé el repository pattern selectivamente, donde la complejidad de la query lo justifica, evitando capas anémicas en operaciones CRUD básicas."

Lo que sí tomamos de Clean/Onion:

- **Service layer** siempre: la lógica de negocio nunca va en componentes ni en actions directamente
- **Types/DTOs** claros en los boundaries entre capas

### 3.3 Flujo de una request típica

```
Browser
  └─→ Next.js App Router (routing)
        └─→ Server Component (renderiza con datos)
              └─→ Service Layer (lógica de negocio)
                    └─→ Repository (queries Prisma)
                          └─→ Neon PostgreSQL

Mutación (form submit):
Browser
  └─→ Client Component (form)
        └─→ Server Action (validación + lógica)
              └─→ Service Layer
                    └─→ Repository
                          └─→ DB
```

### 3.4 Cuándo usar qué en Next.js

Esta es la pregunta más importante que te van a hacer en una entrevista técnica sobre Next.js:

| Mecanismo            | Cuándo usarlo                                        | Ejemplo en este proyecto                                               |
| -------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| **Server Component** | Renderizar datos, no necesita interactividad         | Dashboard con resultados del análisis                                  |
| **Client Component** | Interactividad, estado local, eventos del browser    | Form de upload, botones, tabs                                          |
| **Server Action**    | Mutations (crear, actualizar, borrar), forms         | Guardar análisis, subir CV                                             |
| **Route Handler**    | APIs para consumo externo, webhooks, oauth callbacks | GitHub OAuth callback, endpoint para consultar análisis desde otra app |

> ⚠️ **Regla práctica:** Por default, todo es Server Component. Solo agregás `"use client"` cuando necesitás `useState`, `useEffect`, event handlers del browser, o librerías que no funcionan en server.

### 3.5 Modelo de datos

```prisma
// schema.prisma

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  githubUsername String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  resumes       Resume[]
  jobMatches    JobMatch[]
  githubAnalyses GithubAnalysis[]
}

model Resume {
  id          String   @id @default(cuid())
  userId      String
  fileName    String
  fileUrl     String
  rawText     String   @db.Text
  atsScore    Int?
  analysis    Json?    // { keywords: [], missing: [], suggestions: [] }
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobMatches  JobMatch[]
}

model JobMatch {
  id           String   @id @default(cuid())
  userId       String
  resumeId     String?
  jobOfferText String   @db.Text
  matchScore   Int?
  analysis     Json?    // { requiredSkills: [], missingSkills: [], seniority: "", recommendations: [] }
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  resume       Resume?  @relation(fields: [resumeId], references: [id])
}

model GithubAnalysis {
  id           String   @id @default(cuid())
  userId       String
  githubUser   String
  profileScore Int?
  languages    Json?    // { TypeScript: 45, Python: 30, ... }
  repos        Json?    // array de repo summaries
  activity     Json?    // commits/week, streak, etc
  analysis     Json?    // { strengths: [], weaknesses: [], suggestions: [] }
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 4. Estructura de Carpetas

```
project-root/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions: lint + typecheck
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── (assets estáticos)
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group: páginas de auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (marketing)/              # Route group: landing, pricing
│   │   │   ├── page.tsx              # Landing page (/)
│   │   │   └── layout.tsx
│   │   ├── dashboard/                # App principal (protegida)
│   │   │   ├── layout.tsx            # Sidebar + shell del dashboard
│   │   │   ├── page.tsx              # Overview
│   │   │   ├── cv/
│   │   │   │   └── page.tsx
│   │   │   ├── job-match/
│   │   │   │   └── page.tsx
│   │   │   ├── github/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/                      # Route Handlers
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── uploadthing/
│   │   │   │   └── route.ts
│   │   │   └── github/
│   │   │       └── analyze/
│   │   │           └── route.ts
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   │
│   ├── features/                     # Lógica por feature (el corazón del proyecto)
│   │   ├── cv-analysis/
│   │   │   ├── actions.ts            # Server Actions
│   │   │   ├── service.ts            # Lógica de negocio
│   │   │   ├── repository.ts         # Queries Prisma
│   │   │   ├── types.ts              # Tipos TypeScript
│   │   │   └── components/           # Componentes UI de esta feature
│   │   │       ├── CVUploadForm.tsx
│   │   │       ├── ATSScoreCard.tsx
│   │   │       └── AnalysisResults.tsx
│   │   ├── job-match/
│   │   │   ├── actions.ts
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │       ├── JobOfferInput.tsx
│   │   │       ├── MatchScoreCard.tsx
│   │   │       └── GapAnalysis.tsx
│   │   ├── github-analysis/
│   │   │   ├── actions.ts
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   ├── types.ts
│   │   │   └── components/
│   │   │       ├── ConnectGithubButton.tsx
│   │   │       ├── RepoList.tsx
│   │   │       └── LanguageChart.tsx
│   │   └── auth/
│   │       ├── components/
│   │       │   └── SignInButton.tsx
│   │       └── types.ts
│   │
│   ├── lib/                          # Utilidades compartidas
│   │   ├── auth.ts                   # Config de Auth.js
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── ai/
│   │   │   ├── gemini.ts             # Cliente Gemini
│   │   │   ├── openrouter.ts         # Cliente OpenRouter (fallback)
│   │   │   └── index.ts              # Abstracción: intenta Gemini, fallback a OpenRouter
│   │   ├── uploadthing.ts            # Config UploadThing
│   │   ├── validations/              # Schemas Zod
│   │   │   ├── cv.ts
│   │   │   ├── job-match.ts
│   │   │   └── github.ts
│   │   └── utils.ts                  # cn(), formatters, etc
│   │
│   ├── components/                   # Componentes UI compartidos (no de features)
│   │   ├── ui/                       # shadcn/ui components (generados)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── DashboardShell.tsx
│   │   └── shared/
│   │       ├── ScoreCircle.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAnalysis.ts
│   │   └── useGithubConnect.ts
│   │
│   └── types/                        # Tipos globales
│       ├── next-auth.d.ts            # Extend session types
│       └── index.ts
│
├── docker-compose.yml                # Solo PostgreSQL local
├── .env.local                        # Variables de entorno (no commiteado)
├── .env.example                      # Template de variables (sí commiteado)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Convenciones del Proyecto

### 5.1 Naming

| Elemento                | Convención                               | Ejemplo                               |
| ----------------------- | ---------------------------------------- | ------------------------------------- |
| Componentes React       | PascalCase                               | `ATSScoreCard.tsx`                    |
| Funciones/variables     | camelCase                                | `analyzeResume()`                     |
| Archivos no-componentes | kebab-case                               | `cv-analysis/service.ts`              |
| Constantes globales     | SCREAMING_SNAKE                          | `MAX_FILE_SIZE_MB`                    |
| Variables de entorno    | SCREAMING_SNAKE                          | `GEMINI_API_KEY`                      |
| Tipos/Interfaces TS     | PascalCase                               | `ResumeAnalysis`, `JobMatchResult`    |
| Schemas Zod             | camelCase + Schema                       | `resumeUploadSchema`                  |
| Server Actions          | verbNoun                                 | `analyzeResume()`, `createJobMatch()` |
| Route Handlers          | archivo `route.ts`, función `GET`/`POST` |

### 5.2 Regla de imports

Usar path aliases configurados en `tsconfig.json`:

```typescript
// ✅ Correcto
import { db } from "@/lib/db";
import { ATSScoreCard } from "@/features/cv-analysis/components/ATSScoreCard";

// ❌ Evitar
import { db } from "../../../../lib/db";
```

### 5.3 Regla de componentes: cuándo separar

Un componente se separa cuando:

- Tiene más de ~100 líneas
- Se reutiliza en más de un lugar
- Tiene su propia lógica de estado
- Tiene responsabilidad claramente distinta

---

## 6. Conceptos Clave de Next.js que Debés Dominar

Estos son los conceptos que te van a preguntar. Aprendelos bien antes de seguir adelante.

### 6.1 Server Components vs Client Components

```typescript
// SERVER COMPONENT (por default, sin 'use client')
// - Se ejecuta en el servidor
// - Puede hacer async/await directamente
// - Puede acceder a DB, secrets, filesystem
// - No puede usar useState, useEffect, event handlers
// - No tiene acceso a browser APIs

// app/dashboard/cv/page.tsx
export default async function CVPage() {
  const session = await getServerSession()
  const resumes = await resumeRepository.findByUserId(session.user.id) // directo, sin API!

  return <ResumeList resumes={resumes} />
}
```

```typescript
// CLIENT COMPONENT ('use client' al inicio)
// - Se ejecuta en el browser
// - Puede usar hooks, eventos, estado local
// - NO puede hacer queries a DB directamente
// - No tiene acceso a secrets

"use client"

// features/cv-analysis/components/CVUploadForm.tsx
export function CVUploadForm() {
  const [isUploading, setIsUploading] = useState(false)

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={...} />
    </form>
  )
}
```

**La regla mental:** ¿Necesita interactuar con el usuario? → Client Component. ¿Solo muestra datos? → Server Component.

### 6.2 Server Actions

Son funciones que se ejecutan en el servidor pero pueden ser llamadas desde un Client Component. Reemplazan el patrón fetch a una API propia.

```typescript
// features/cv-analysis/actions.ts
"use server";

export async function analyzeResume(formData: FormData) {
  // Esta función corre en el servidor aunque la llame un Client Component
  const session = await getServerSession();
  if (!session) throw new Error("No autorizado");

  const file = formData.get("file") as File;
  // validar, parsear, llamar IA, guardar en DB...

  revalidatePath("/dashboard/cv"); // refresca los datos del Server Component
}
```

```typescript
// features/cv-analysis/components/CVUploadForm.tsx
"use client"

import { analyzeResume } from "../actions"

export function CVUploadForm() {
  return (
    <form action={analyzeResume}> {/* Next.js maneja el submit automáticamente */}
      <input type="file" name="file" />
      <button type="submit">Analizar</button>
    </form>
  )
}
```

### 6.3 Route Handlers

Son APIs REST de toda la vida, pero dentro de Next.js. Usarlos cuando:

- Una app externa necesita consumir un endpoint tuyo
- Estás manejando webhooks
- Necesitás más control sobre la request/response HTTP

```typescript
// app/api/github/analyze/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  // lógica...
  return Response.json({ data });
}
```

### 6.4 Cuándo usar Server Action vs Route Handler

| Criterio                         | Server Action | Route Handler            |
| -------------------------------- | ------------- | ------------------------ |
| Form submit desde UI             | ✅            | No necesario             |
| Mutación desde Client Component  | ✅            | Posible pero más verbose |
| Webhook externo (GitHub, Stripe) | No            | ✅                       |
| API consumida por app externa    | No            | ✅                       |
| Necesitás controlar headers HTTP | No            | ✅                       |

---

## 7. Estrategias Transversales

### 7.1 Manejo de Estado

Este proyecto **no necesita Redux ni Zustand** para el MVP. El estado se divide así:

| Tipo de estado                            | Dónde vive             | Cómo                                  |
| ----------------------------------------- | ---------------------- | ------------------------------------- |
| Datos del servidor (análisis, resultados) | Server Components + DB | Fetch directo en Server Component     |
| Estado de UI local (loading, modal open)  | Client Component       | `useState`                            |
| Estado del formulario                     | Client Component       | `useState` o `useFormState`           |
| Sesión de usuario                         | Auth.js                | `useSession()` / `getServerSession()` |

Si en V2 aparece estado global complejo (ej: comparación de múltiples análisis), agregar **Zustand** — es simple, no-opinado, y muy popular.

### 7.2 Validación

Usar **Zod** en todas las boundaries:

```typescript
// lib/validations/cv.ts
import { z } from "zod";

export const uploadCVSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, "El archivo no puede superar 5MB")
    .refine((f) => f.type === "application/pdf", "Solo se aceptan PDFs"),
});

export type UploadCVInput = z.infer<typeof uploadCVSchema>;
```

Regla: **validar siempre en el servidor**, aunque también valides en el cliente (UX). Un user puede bypassear la validación del cliente.

### 7.3 Manejo de Errores

Estrategia de dos capas:

**En Server Actions — Result pattern:**

```typescript
// En lugar de throw, retornar un objeto con estado
export async function analyzeResume(
  input: UploadCVInput,
): Promise<ActionResult<ResumeAnalysis>> {
  try {
    const parsed = uploadCVSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }
    const result = await cvAnalysisService.analyze(parsed.data);
    return { success: true, data: result };
  } catch (err) {
    console.error("[analyzeResume]", err);
    return { success: false, error: "Error interno al analizar el CV" };
  }
}
```

**En UI — Error boundaries de Next.js:**

```
app/dashboard/cv/
  ├── page.tsx      ← Server Component principal
  ├── error.tsx     ← se renderiza si page.tsx tira un error
  └── loading.tsx   ← se renderiza mientras page.tsx carga
```

### 7.4 Auth y Seguridad

```typescript
// lib/auth.ts — configuración Auth.js v5
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [GitHub],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id; // agregar id al session type
      return session;
    },
  },
});
```

**Proteger rutas en proxy.ts (Next.js 16):**

En Next.js 16, la convención `middleware.ts` en la raíz se ha deprecado en favor de `src/proxy.ts` usando un named export llamado `proxy`:

```typescript
// src/proxy.ts (Next.js 16 Route Protection)
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export const proxy = NextAuth(authConfig).auth;

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
```

_(La lógica de autorización y redirección se gestiona dentro de la callback `authorized` en `src/lib/auth.config.ts`)_.

**Verificar sesión siempre en Server Actions:**

```typescript
export async function analyzeResume(...) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized") // o redirect
  // ...
}
```

### 7.5 Rate Limiting

Para el MVP, una solución simple con **Upstash Redis** (free tier) o una alternativa in-memory:

```typescript
// lib/rate-limit.ts
// Con Upstash (tiene free tier):
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests por minuto por user
})

// Uso en Server Action:
export async function analyzeResume(...) {
  const session = await auth()
  const { success } = await rateLimiter.limit(session.user.id)
  if (!success) return { success: false, error: "Demasiadas solicitudes. Esperá un minuto." }
  // ...
}
```

> 💡 Para MVP puedes skipear Upstash y hacer un rate limit simple en memoria. Pero mencionarlo en entrevistas muestra que pensaste en el problema.

### 7.6 Abstracción de IA con Vercel AI SDK

El AI SDK unifica la interfaz para distintos proveedores. En lugar de clientes HTTP manuales:

```typescript
// lib/ai/index.ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, streamObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
});

// Para análisis que requieren streaming (Server Actions con UI progresiva):
export async function streamAnalysis<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
) {
  try {
    return await streamObject({
      model: google("gemini-1.5-flash"),
      prompt,
      schema,
    });
  } catch (error) {
    // Fallback a OpenRouter (Llama 3 gratis)
    console.warn("[AI] Gemini failed, falling back to OpenRouter", error);
    return await streamObjectWithOpenRouter(prompt, schema);
  }
}

// Para análisis que NO necesitan streaming (background, pequeños):
export async function generateAnalysis<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
): Promise<T> {
  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    prompt,
    schema,
  });
  return object; // TypeScript sabe exactamente qué tipo es
}
```

**Por qué `generateObject` en lugar de prompts "respondé solo JSON":**
`generateObject` pasa el schema Zod como Structured Output a la API de Gemini. El modelo tiene restricción a nivel de inferencia — no puede devolver JSON inválido o campos incorrectos. Esto elimina la necesidad de `try/catch` en el parse y los crashes silenciosos por alucinaciones.

### 7.7 Variables de Entorno

```bash
# .env.example (sí va al repo)
DATABASE_URL=
NEXTAUTH_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Para rate limiting (opcional MVP)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Validar variables de entorno al inicio de la app con Zod:

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  // ...
});

export const env = envSchema.parse(process.env);
// Si falta una variable, la app explota en startup con un mensaje claro
```

### 7.8 Logging

Para MVP, `console.error` estructurado es suficiente. Patrón que muestra criterio:

```typescript
// Siempre incluir contexto: [módulo] mensaje + datos relevantes
console.error("[cv-analysis/service] Error al parsear PDF:", {
  userId: session.user.id,
  fileName,
  error: err.message,
});
```

En V2 se puede integrar **Axiom** o **Sentry** (ambos tienen free tier).

### 7.9 Docker para desarrollo local

```yaml
# docker-compose.yml
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: platform_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Para levantar en local:
docker compose up -d
# DATABASE_URL=postgresql://devuser:devpass@localhost:5432/platform_dev
```

En producción usás Neon directamente. No necesitás Docker en Vercel.

---

## 8. Fases de Desarrollo

### FASE 0 — Setup y Fundamentos (Semana 1)

**Objetivo:** Tener el proyecto configurado correctamente y entender la estructura antes de tocar features.

**Tareas:**

- [ ] `npx create-next-app@latest` con TypeScript + Tailwind + App Router
- [ ] Instalar y configurar Prisma + Neon
- [ ] Instalar shadcn/ui e inicializar
- [ ] Crear `docker-compose.yml` para PostgreSQL local
- [ ] Configurar path aliases en `tsconfig.json`
- [ ] Configurar `lib/env.ts` con validación Zod
- [ ] Crear `.env.example`
- [ ] Primer deploy en Vercel (vacío, solo que funcione)
- [ ] Configurar GitHub repo + branch protection en `main`

**Conceptos a aprender esta fase:**

- Cómo funciona el App Router (diferencia con Pages Router)
- Qué es un `layout.tsx` y por qué existe
- Cómo funciona Prisma schema + `prisma migrate dev`
- Qué son las variables de entorno en Next.js (`.env.local` vs `.env`)

**Hacé vos solo:** Todo el setup. Seguí la documentación oficial de cada herramienta paso a paso. Es lento pero fundamental.

**Podés delegar a IA:** El `docker-compose.yml` (es boilerplate), la config inicial de `tsconfig.json`.

---

### FASE 1 — Auth + Shell del Dashboard (Semana 1-2)

**Objetivo:** Usuario puede hacer login con GitHub y ver un dashboard vacío pero funcional.

**Tareas:**

- [ ] Instalar Auth.js v5
- [ ] Configurar GitHub OAuth App en github.com/settings/developers
- [ ] Implementar `lib/auth.ts`
- [x] Configurar `src/proxy.ts` para proteger `/dashboard` (Completado en base de código)
- [ ] Crear `app/api/auth/[...nextauth]/route.ts`
- [ ] Diseñar layout del dashboard: sidebar + main content
- [ ] Implementar `Sidebar.tsx` con navegación
- [ ] Implementar dark mode con `next-themes`
- [ ] Página de login con botón "Continuar con GitHub"

**Conceptos a aprender esta fase:**

- Cómo funciona OAuth 2.0 a alto nivel (importante para entrevistas)
- Qué es una sesión vs un JWT
- Cómo funciona `src/proxy.ts` en Next.js 16
- Cómo extender los tipos de `Session` en TypeScript

**Hacé vos solo:** El diseño del sidebar y dashboard shell. La configuración del proxy.

**Podés delegar a IA:** La config boilerplate de Auth.js (es verbosa y específica de la versión).

> 💡 **Para entrevistas:** "Implementé autenticación OAuth con GitHub usando Auth.js. El middleware de Next.js intercepta todas las rutas bajo `/dashboard` y verifica la sesión antes de renderizar."

---

### FASE 2 — Upload de CV y Parsing (Semana 2-3)

**Objetivo:** Usuario puede subir un PDF, el sistema extrae el texto y lo guarda en DB.

**Tareas:**

- [ ] Configurar UploadThing para subida de PDFs
- [ ] Implementar `CVUploadForm` (Client Component)
- [ ] Implementar Server Action `uploadAndParseCV`
- [ ] Parsear PDF con `pdf-parse` (npm package)
- [ ] Guardar texto extraído + URL en DB via `resumeRepository`
- [ ] Mostrar lista de CVs subidos en `/dashboard/cv`

**Conceptos a aprender esta fase:**

- Cómo funciona el upload de archivos en web (FormData, multipart)
- Qué hace `pdf-parse` y sus limitaciones (no funciona con PDFs escaneados/imagen)
- Repository pattern: por qué separar las queries de la lógica

**Hacé vos solo:** El `resumeRepository.ts` y el parsing básico. Intentá escribir la query Prisma sin copiar.

**Podés delegar a IA:** La configuración de UploadThing (tiene mucho boilerplate específico).

**Problema conocido:** PDFs generados por Canva o como imagen no tienen texto extraíble. Documentá esta limitación en el README.

---

### FASE 3 — ATS Analysis (Semana 3-4)

**Objetivo:** El sistema analiza el CV y devuelve un score ATS + recomendaciones usando streaming para evitar timeouts.

**Tareas:**

- [ ] Instalar `ai`, `@ai-sdk/google`
- [ ] Implementar `lib/ai/index.ts` con `generateAnalysis` y `streamAnalysis`
- [ ] Implementar `lib/ai/openrouter.ts` como fallback
- [ ] Agregar **textarea de fallback** en la UI de CV upload: "¿No se pudo leer tu PDF? Pegá el texto acá"
- [ ] Diseñar el schema Zod del análisis ATS (pasado a `generateObject`)
- [ ] Implementar `cvAnalysisService.analyze(text: string)`
- [ ] Implementar Server Action con **streaming** usando `createStreamableValue` de `ai/rsc`
- [ ] Implementar `ATSScoreCard`, `AnalysisResults` con actualización progresiva

**El schema de análisis (reemplaza el prompt de texto libre):**

```typescript
// features/cv-analysis/types.ts
import { z } from "zod";

export const atsAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  keywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  formatIssues: z.array(z.string()),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  estimatedSeniority: z.enum(["junior", "semi-senior", "senior"]),
});

export type ATSAnalysis = z.infer<typeof atsAnalysisSchema>;
```

```typescript
// features/cv-analysis/service.ts
import { generateAnalysis } from "@/lib/ai";
import { atsAnalysisSchema } from "./types";

export async function analyzeCV(cvText: string) {
  // generateObject pasa el schema como Structured Output a Gemini
  // El modelo NO puede devolver JSON inválido — es una restricción a nivel de inferencia
  return await generateAnalysis(
    `Analizá este CV como experto en ATS y selección tech:\n\n${cvText}`,
    atsAnalysisSchema,
  );
  // TypeScript ya sabe que el return es ATSAnalysis — sin casteos, sin try/catch de parse
}
```

**Fallback textarea:**

```typescript
// features/cv-analysis/components/CVUploadForm.tsx
// Mostrar si el parsing del PDF devuelve texto vacío o error
{parseError && (
  <div className="mt-4">
    <p className="text-sm text-amber-600">
      No pudimos leer el texto de tu PDF (puede ser un PDF con imágenes).
    </p>
    <Textarea
      placeholder="Pegá el contenido de tu CV acá..."
      onChange={(e) => setManualText(e.target.value)}
    />
  </div>
)}
```

**Conceptos a aprender esta fase:**

- Cómo funciona el streaming en HTTP (Server-Sent Events)
- Por qué Structured Outputs es más confiable que "respondé solo JSON"
- Por qué los timeouts serverless son distintos al desarrollo local
- Rate limiting: por qué no podés llamar a la IA sin límites

**Hacé vos solo:** El schema Zod del análisis y el diseño del prompt. Es la parte más creativa y donde más aprendés del dominio.

**Podés delegar a IA:** El boilerplate del cliente AI SDK y la configuración de streaming.

---

### FASE 4 — Job Offer Matching (Semana 4-5)

**Objetivo:** Usuario pega una oferta laboral, el sistema compara contra su CV y da un match score.

**Tareas:**

- [ ] Implementar `JobOfferInput` (textarea + botón analizar)
- [ ] Server Action `analyzeJobMatch(jobText, resumeId)`
- [ ] Prompt de extracción de requisitos de la oferta
- [ ] Prompt de comparación CV vs oferta
- [ ] Implementar `MatchScoreCard` y `GapAnalysis` components
- [ ] Guardar resultado en `JobMatch`

**El flujo de análisis:**

```
1. Extraer requisitos de la oferta → { skills, seniority, yearsRequired, niceToHave }
2. Extraer skills del CV guardado
3. Comparar: { matchScore, missingSkills, matchedSkills, recommendation }
4. Generar mensaje human-readable
```

> 💡 **Feature estrella del producto.** El output tiene que ser específico: no "te falta experiencia" sino "La oferta requiere Next.js y testing con Jest. Tu GitHub muestra proyectos React sin tests. Para este rol específico encajás mejor como Jr Frontend que como Fullstack Mid."

**Hacé vos solo:** La lógica de comparación y el diseño de los prompts.

---

### FASE 5 — Landing Page y Polish (Semana 5-6)

**Objetivo:** La app se ve profesional, está lista para mostrar, y tiene algo real para poner en el portfolio.

**Tareas:**

- [ ] Landing page con hero, features, CTA, y **screenshots reales** del dashboard
- [ ] Loading states con Skeletons (shadcn/ui tiene `Skeleton`)
- [ ] Empty states cuando no hay datos
- [ ] Toast notifications (shadcn/ui `Sonner`)
- [ ] Mobile responsive (revisar cada pantalla en 375px)
- [ ] Meta tags y OpenGraph para preview en redes
- [ ] Dark mode funcionando en todas las pantallas
- [ ] README profesional con screenshots, stack, decisiones técnicas, y cómo correr el proyecto

**Esta fase es la puerta de entrada.** Lo que el recruiter ve primero es la landing. Si no está, el proyecto no existe para ellos.

**Hacé vos solo:** La landing page entera. Es lo que más te representa.

---

### FASE 6 (V2) — GitHub Analyzer

> 💡 Esta feature se movió de MVP a V2 deliberadamente. El MVP completo (CV + ATS + Job Match + Landing) ya es portfolio premium y deployable. El GitHub Analyzer es una feature colosal con sus propios edge cases que merecen una iteración separada.

**Moverla a V2 permite:**

- Hacer deploy del MVP antes
- Compartirlo en LinkedIn y obtener feedback real
- Abordarlo sin presión de "esto bloquea el lanzamiento"

**Cuando llegue el momento:**

**Objetivo:** Conectar GitHub del usuario y analizar sus repos públicos.

**Tareas:**

- [ ] Auth.js ya guardó el `githubUsername` — usarlo
- [ ] Implementar `lib/github.ts` con wrapper de GitHub API
- [ ] Endpoint `/api/github/analyze` (Route Handler)
- [ ] Extraer: repos, languages, frecuencia de commits, calidad de READMEs
- [ ] Prompt de análisis técnico del perfil GitHub
- [ ] Implementar `GithubAnalysis` components
- [ ] Manejar rate limit de GitHub API (60 req/hora sin auth)

**GitHub API sin autenticación:**

```
GET https://api.github.com/users/{username}/repos?sort=updated&per_page=20
GET https://api.github.com/users/{username}/events
```

**Métricas a calcular (lógica pura, sin IA):**

- Distribución de lenguajes por bytes
- Repos con README vs sin README
- Fecha del último commit (¿está activo?)
- Presencia de tests (buscar `/test`, `/spec`, archivos `.test.ts`)
- Repos con descripción vs sin descripción

---

## 9. Deployment y CI/CD

### 9.1 Vercel

- El deploy es automático desde `main` branch
- Configurar `preview deployments` para PRs (gratis en Vercel)
- Variables de entorno en Vercel Dashboard (no commitear `.env.local`)
- Configurar `NEXTAUTH_URL` = URL de producción de Vercel

### 9.2 GitHub Actions — CI básico

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check # tsc --noEmit
      - run: npx prisma validate # valida el schema
```

### 9.3 Branch strategy

```
main       ← producción (Vercel deploy automático)
develop    ← desarrollo activo
feature/*  ← una feature, merge a develop
```

---

## 10. Testing

**Para el MVP, testing mínimo pero estratégico.** No hagas tests de todo — hacé tests de lo que importa.

**Qué testear:**

- Lógica de scoring (funciones puras — fáciles de testear)
- Validaciones Zod
- Parsing de respuestas de IA (el JSON que devuelve puede estar malformado)

**Stack:**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Ejemplo:**

```typescript
// features/cv-analysis/service.test.ts
import { describe, it, expect } from "vitest";
import { calculateATSScore } from "./service";

describe("calculateATSScore", () => {
  it("should return 0 for empty CV", () => {
    expect(calculateATSScore("")).toBe(0);
  });

  it("should detect missing contact information", () => {
    const result = calculateATSScore("John Doe, React developer");
    expect(result.issues).toContain("missing_email");
  });
});
```

> 💡 Para entrevistas: "Implementé tests unitarios sobre la lógica de scoring y el parsing de respuestas de IA, que son las partes más críticas y más propensas a romperse silenciosamente."

---

## 11. Escalabilidad Futura

Si el proyecto crece, estas son las migraciones naturales:

| Cuando                      | Qué hacer                                                          |
| --------------------------- | ------------------------------------------------------------------ |
| El análisis tarda demasiado | Mover procesamiento a background jobs con **Inngest** (free tier)  |
| Muchas llamadas a IA        | Implementar caché de resultados en DB (mismo CV → mismo resultado) |
| Backend muy complejo        | Extraer Route Handlers a **NestJS** separado en Railway            |
| Muchos usuarios             | Agregar **Redis** para caché y sesiones                            |
| Análisis más preciso        | Implementar embeddings + RAG con **pgvector** en Neon              |

---

## 12. Guía Personal: Cómo Presentarlo en Entrevistas

### 12.1 Decisiones técnicas que podés explicar

Preparate para responder estas preguntas con fluidez:

**"¿Por qué Next.js y no React + Node separado?"**

> "Para el scope del MVP, colocar frontend y backend en el mismo proyecto reducía la complejidad operacional. Los Server Components de Next.js me permiten acceder a la DB directamente sin una API intermedia cuando no es necesaria, lo que reduce latencia y código. Tengo claro cómo separar el backend si escala."

**"¿Por qué usaste Server Actions y no una API REST tradicional?"**

> "Para mutaciones iniciadas desde la UI propia, Server Actions eliminan el boilerplate de crear un endpoint REST, manejar CORS, y hacer fetch desde el cliente. Para endpoints que consumen servicios externos o que necesitan ser consumidos por terceros, usé Route Handlers que sí son API REST."

**"¿Cómo manejás la seguridad?"**

> "Auth con OAuth via Auth.js, middleware que protege todas las rutas del dashboard, verificación de sesión en cada Server Action, validación de inputs con Zod en el servidor, y rate limiting para las llamadas a IA."

**"¿Por qué una abstracción sobre los proveedores de IA?"**

> "Para que el sistema sea resiliente. Si Gemini falla por rate limit, automáticamente usa OpenRouter como fallback. Esto también me permite cambiar o agregar proveedores de IA sin modificar la lógica de negocio."

**"¿Qué harías diferente si lo reescribieras?"**

> Esta es una pregunta trampa para ver si aprendiste. Preparate una respuesta honesta basada en problemas reales que encontraste.

### 12.2 Métricas para mostrar en entrevistas

- Tiempo de análisis promedio (ej: "un análisis ATS tarda ~3s en promedio")
- Precisión del score (si podés compararlo con análisis humano)
- Número de usuarios / análisis realizados (aunque sea poco, es real)

### 12.3 Lo que NO decir

- "Lo hice con IA" (sin contexto de qué hiciste vos)
- "No sé por qué lo hice así, fue el default"
- "Copié del tutorial de X"

Lo que SÍ decir:

- "Tomé la decisión de X porque Y fue el problema que quería resolver"
- "Consideré también Z pero lo descarté porque..."
- "Encontré el problema W y lo resolví haciendo..."

---

## Apéndice A — Nombre del Producto

**Nombre elegido: SkillRadar** ✅

Verificar disponibilidad en namecheap.com y GitHub antes de crear el repo público.

---

## Apéndice B — Recursos para Aprender

| Tema               | Recurso                                   |
| ------------------ | ----------------------------------------- |
| Next.js App Router | docs.nextjs.org (oficial, excelente)      |
| Vercel AI SDK      | sdk.vercel.ai/docs                        |
| Auth.js v5         | authjs.dev                                |
| Prisma             | prisma.io/docs                            |
| shadcn/ui          | ui.shadcn.com                             |
| TypeScript         | typescript-handbook (oficial)             |
| Zod                | zod.dev                                   |
| Git workflow       | "GitHub Flow" (leer el artículo original) |

> ⚠️ **Advertencia:** Usá los docs oficiales como fuente primaria. YouTube tutorials y blogs suelen estar desactualizados para Next.js App Router porque cambió mucho en 2023-2024.

---

## Historial de Cambios

| Versión | Fecha      | Cambios                                                                                                                                                                                                                                                  |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-05-21 | Versión inicial del roadmap                                                                                                                                                                                                                              |
| v1.1.0  | 2026-05-21 | Incorpora audit técnico: Vercel AI SDK para streaming, `generateObject` para Structured Outputs, fallback textarea para PDFs con imagen, repository pattern pragmático, GitHub Analyzer movido a V2, Neon connection pooling, nombre fijado a SkillRadar |
