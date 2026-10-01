# SkillRadar 🎯

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.x-2C3E50?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Postgres-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-5A29E4?style=for-the-badge&logo=next.js)](https://authjs.dev/)

🌎 [Read in English](../README.md)

SkillRadar es una plataforma moderna y de grado industrial para el **análisis de talento, evaluación de currículums (CV) y optimización para Sistemas de Seguimiento de Candidatos (ATS)**. La aplicación utiliza modelos avanzados de Inteligencia Artificial Generativa para extraer habilidades estructuradas, estimar el seniority de perfiles técnicos, auditar perfiles de LinkedIn y calcular métricas críticas de adecuación a ofertas laborales.

Diseñada con un fuerte enfoque en seguridad, rendimiento y localización, SkillRadar implementa patrones avanzados de ingeniería de software que incluyen encriptación criptográfica de base de datos, privacidad de doble ciego y protección de rutas en el middleware de forma agnóstica al idioma.

---

## 🏗️ Arquitectura del Sistema y Flujo de Datos

A continuación se detalla el diagrama de arquitectura que describe el flujo de subida de CVs, análisis con IA, moderación de doble ciego e interacciones cliente-servidor de forma segura:

```mermaid
graph TD
    subgraph Client [Capa de Cliente - React 19]
        C[Candidato Developer] -->|1. Sube PDF de CV| BLOB[Subida cliente a Vercel Blob]
        C -->|3. Entrevista Interactiva AI| UT
        R[Reclutador / Admin] -->|7. Visualiza Perfil de Candidato| DBV[Sanitizador de Doble Ciego]
    end

    subgraph Security [Pasarelas de Seguridad]
        UT -->|2. Webhook Callback| SSRF[Validación SSRF y Protocolos]
        DBV -->|Verifica estado de postulación| DB_Sec{¿Postulación Aceptada?}
    end

    subgraph Service [Servicios de Aplicación]
        SSRF -->|Signed URL con expiración de 1h| AI[AI CV Analysis Service]
        AI -->|4. Request estructurado vía Zod| VSDK[Vercel AI SDK]
        VSDK -->|API Key Primaria/BYOK| LLM["Motor Multi-Modelo: Gemini 3.8 Flash / Groq gpt-oss / OpenRouter / BYOK Propio (OpenAI GPT-6, Claude, etc.)"]
        VSDK -->|Offline Fallback| MOCK[Simulador Local de Palabras Clave y Seniority]
        AI -->|5. JSON de CV Estructurado| Prisma[Prisma Client Pooler]
    end

    subgraph DB [Capa de Base de Datos - Neon Postgres]
        Prisma -->|6. Persistencia| PGDB[(Postgres DB)]
        DB_Sec -->|Si NO está aceptado: remueve PII| R
        DB_Sec -->|Si está aceptado: expone perfil completo| R
    end

    style Security fill:#f9f2f4,stroke:#3a1a1a,stroke-width:1px
    style DB fill:#eef9f2,stroke:#1a3a2a,stroke-width:1px
```

La lógica de dominio vive en `src/features/*` como módulos hexagonales (`domain/` tipos + puertos, `application/` servicios + casos de uso, `infrastructure/` repositorios, `presentation/` pantallas cliente). Los ficheros de ruta de Next (`page|layout|error|loading|route`) son nombres reservados y quedan como adaptadores finos que delegan a `features/*/presentation`. Los contratos puros transversales viven en el shared kernel (`src/shared-kernel/action-result.ts`, `sanitize.ts`, `seniority.ts`, `pii.ts`); los adaptadores de IO viven en `src/infrastructure/` (`db`, `auth`, `ai/`, `crypto`, `file-storage`): **ningún feature importa de otro feature** — los bordes hexagonales se verifican en CI con dependency-cruiser (ver `docs/adr/`, ADR-003).

---

## 🚀 Características Principales

- **Análisis ATS Estructurado de CV**: Carga currículums en formato PDF de manera segura y obtén análisis estructurados impulsados por **Google Gemini 3.8 Flash** (elegido conscientemente por su costo eficiente, velocidad y alta precisión).
- **Motor de IA Híbrido y Selección Dinámica en Chat**: Utiliza **Gemini 3.8 Flash** como modelo primario del sistema. En los módulos interactivos (Career Copilot y Entrevista Técnica), los usuarios pueden seleccionar dinámicamente su proveedor y modelo preferido (Google Gemini, Groq `openai/gpt-oss-120b`, OpenAI GPT-6, Anthropic Claude, OpenRouter o IDs de modelo personalizados) utilizando sus propias API Keys encriptadas **BYOK (Bring Your Own Key)** para evitar límites de cuotas del sistema.
- **Mecanismo de Fallback en Cascada Multi-Nivel**: El sistema intenta la inferencia estructurada priorizando el proveedor y modelo configurado por el usuario y degrada suavemente a través de las cuotas gratuitas del sistema (Gemini → Groq → OpenRouter) ante tiempo de espera de API o límite de peticiones, garantizando un 99.9% de disponibilidad.
- **Aislamiento de Demo Invitada**: Las sesiones demo anónimas (`guest-developer-id` / `guest-recruiter-id`) nunca persisten en la base de datos real; todas las escrituras se bloquean en el servidor.
- **Verificación de Recruiters**: Las cuentas recruiter requieren verificación de un admin (`recruiterVerified`) antes de usar las herramientas de sourcing; las cuentas pendientes ven un gate dedicado con flujo de re-solicitud.
- **Etapas de Pipeline Personalizadas**: Cada oferta define sus propias etapas de selección; el tablero renderiza columnas por oferta con embudo y analítica de conversión.
- **Alertas de Talento y Contacto Masivo**: Cron diario (`/api/cron/talent-alerts`) que notifica a developers compatibles; los recruiters pueden contactar shortlists en masa con reporte enviado/omitido por destinatario.
- **Privacidad de Doble Ciego**: Sanitización estricta en servidor. Los datos de contacto sensibles (`name`, `email`, `githubUsername`, `image`) de los candidatos se eliminan automáticamente para perfiles que no han sido aceptados (`status !== "accepted"`), previniendo sesgos en la fase de reclutamiento.
- **Moderación del Portal de Empleo**: Reportes de contenido con pase automático a `under_review` al 3er reporte, chequeos IDOR de propiedad en cada mutación y manejo de expiración.
- **Entrevista Técnica Interactiva con IA**: Simulación de entrevistas técnicas personalizadas usando LLMs mediante generación dinámica de preguntas basadas en el currículum del candidato, culminando en un reporte de rendimiento detallado.
- **Defensa Activa contra SSRF y Privacidad de Archivos**: Acceso a archivos CV protegido por sesión. Las descargas se resuelven mediante URLs firmadas temporales (1 hora de validez). Previene ataques SSRF validando nombres de dominio autorizados y forzando protocolos `https:`.
- **Cifrado Criptográfico de Base de Datos (AES-256-GCM)**: Las claves de API de los usuarios (OpenAI, Claude, Gemini, Groq, OpenRouter) se encriptan en reposo en PostgreSQL como `ivHex:authTagHex:encryptedTextHex`, desencriptándose únicamente en la memoria del servidor.
- **Middleware combinado i18n & NextAuth**: Middleware unificado (`src/proxy.ts`) que combina la protección de rutas de **Auth.js v5** con el enrutamiento localizado de **next-intl**, logrando redirecciones automáticas coherentes (ej. `/es/dashboard`).
- **Diseño Visual Premium**: Modos claro y oscuro, interfaces con estética de cristal (glassmorphic) usando Tailwind CSS v4, animaciones suaves y un selector de idioma localizado y adaptado a Base UI v1 (empleando la propiedad `render` en lugar de `asChild` para los triggers).

---

## 🛠️ Stack Tecnológico y Versiones

- **Frontend**: Next.js ^16.3 (App Router con Turbopack) & React 19.2.
- **Lenguaje**: TypeScript 6.0 (compilador primario `tsc`) + chequeo de compatibilidad side-by-side con TypeScript 7 (`npm run type-check:ts7`, verificado en CI).
- **Estilos**: Tailwind CSS v4.3 & shadcn/ui.
- **Componentes Interactivos**: `@base-ui/react` ^1.6.0 (Base UI v1).
- **ORM**: Prisma 7.8.0.
- **Base de Datos**: Neon PostgreSQL Serverless (con transaction pooling activo).
- **Autenticación**: Auth.js v5 (NextAuth `5.0.0-beta`) con estrategia basada en JWT.
- **Seguridad**: `bcryptjs` para hash de contraseñas y `jose` para la firma de JWT de sesión.
- **Límites de Ratio (Rate Limiting)**: Upstash Redis Web SDK (`@upstash/ratelimit`).
- **Orquestación de IA y Modelos LLM**: Vercel AI SDK (`ai` v7 / `@ai-sdk` v4) con soporte multi-proveedor (Google Gemini, OpenAI, Anthropic Claude, Groq y OpenRouter) y sistema de fallback automático en cascada.
- **Internacionalización**: `next-intl` ^4.x.
- **Pruebas Unitarias**: Vitest 4.x & `@testing-library/react` (139 tests, ~40% cobertura de líneas con piso anti-regresión).
- **Pruebas E2E**: Playwright ^1.61.0.
- **Arquitectura y Código Muerto**: dependency-cruiser 18 (gates hexagonales) + Knip.

---

## 📁 Estructura del Proyecto

```text
├── .dependency-cruiser.cjs      # Gates hexagonales (severidad error en CI)
├── .github/                     # Workflows de CI/CD y plantillas de PRs e Issues
├── docs/adr/                    # Architecture Decision Records (ver ADR-003 screaming/hexagonal)
├── knip.json                    # Config de auditoría de código muerto / dependencias
├── messages/                    # Diccionarios de traducción JSON (es.json, en.json)
├── prisma/                      # Definición de esquema de base de datos y migraciones
├── scripts/
│   ├── audit-high.mjs           # Gate de npm audit (high/critical + allowlist)
│   └── refactor/                # Scripts de renombre screaming/hexagonal de un solo uso (ADR-003)
├── src/
│   ├── app/                     # App Router de Next.js: adaptadores finos (page/layout/error/loading/route son reservados)
│   │   └── [locale]/
│   │       ├── dashboard/       # Rutas protegidas que delegan a features/*/presentation
│   │       ├── legal/           # Páginas de políticas de privacidad y términos
│   │       ├── login/           # Formulario de login/registro localizado
│   │       └── page.tsx         # Página de inicio / landing page localizada
│   ├── components/              # UI reutilizable (ui/ genérico + componentes de dominio usados por presentation)
│   │   ├── auth/                # Formularios de autenticación
│   │   ├── layout/              # Sidebar, Navbar, LanguageSwitcher y ThemeToggle
│   │   └── ui/                  # Componentes base de shadcn/ui
│   ├── features/                # Dominios hexagonales: domain/ application/ infrastructure/ presentation/
│   │   │                        # Nomenclatura: <contexto>.<capa>.ts (ej. github.use-cases.ts, jobs.ports.ts)
│   │   ├── cv-analysis/         # Análisis de CV + puerto ResumeStore
│   │   ├── github/              # Señales, seniority + presentation/github-dashboard.client.tsx
│   │   ├── jobs/                # Portal, ofertas, pantallas de pipeline + domain/jobs.ports.ts (MatchProvider)
│   │   ├── job-match/           # Algoritmo de emparejamiento ATS + puerto JobMatchStore
│   │   └── recruiter/           # Gestión de candidatos, pantalla de solicitudes y Doble Ciego
│   ├── shared-kernel/           # Contratos puros transversales (action-result, sanitize, seniority, pii, types, utils)
│   ├── infrastructure/          # Adaptadores de IO (db, auth, ai/, crypto, file-storage, mail, rate-limit, guards)
│   ├── i18n/                    # Configuración, enrutamiento y cargador de next-intl
│   └── proxy.ts                 # Interceptor del middleware combinado (Auth + next-intl)
├── tests/
│   └── e2e/                     # Pruebas End-to-End con Playwright (developer, recruiter)
└── vitest.config.ts             # Config de Vitest con umbrales anti-regresión de cobertura
```

---

## 📦 Instalación y Configuración

### 1. Clonar el repositorio y configurar variables de entorno

Duplica el archivo de plantilla `.env.example`:

```bash
cp .env.example .env
```

Completa las variables necesarias (ver `.env.example` para la lista completa de ~30 vars):

```ini
# Conexión a Base de Datos (Neon Postgres)
DATABASE_URL="postgresql://usuario:clave@host/dbname?sslmode=require"
DATABASE_URL_UNPOOLED=""

# Auth.js + override AES-256-GCM (por defecto usa AUTH_SECRET)
AUTH_SECRET="tu-clave-secreta-larga-generada"
NEXTAUTH_SECRET="tu-clave-secreta-larga-generada"
ENCRYPTION_KEY="tu-clave-cripto-de-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"

# Proveedores de OAuth (GitHub & Google)
GITHUB_CLIENT_ID="tu_github_client_id"
GITHUB_CLIENT_SECRET="tu_github_client_secret"
GOOGLE_CLIENT_ID="tu_google_client_id"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# Vercel Blob (almacenamiento de CVs)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
BLOB_STORE_ID=""

# API Keys de IA (globales o BYOK por usuario)
GEMINI_API_KEY="tu_gemini_api_key"
OPENROUTER_API_KEY="tu_openrouter_api_key"
GROQ_API_KEY="tu_groq_api_key"
OPENAI_API_KEY="tu_openai_api_key"
ANTHROPIC_API_KEY="tu_anthropic_api_key"

# Email transaccional (reseteo) + cron de talent-alerts
RESEND_API_KEY=""
CRON_SECRET=""

# Demo invitada + flags de Neon
ENABLE_GUEST_LOGIN="false"
USE_NEON_WEBSOCKETS="true"

# Upstash Redis (Límites de ratio)
UPSTASH_REDIS_REST_URL="https://...upstash.io"
UPSTASH_REDIS_REST_TOKEN="tu_token_de_upstash"
```

### 2. Sincronizar la Base de Datos

Instala las dependencias y sincroniza el esquema de base de datos utilizando Prisma:

```bash
cmd /c npm install
npx prisma db push
```

### 3. Iniciar Servidor en Local

Ejecuta el servidor de desarrollo local de Next.js (utilizando Turbopack):

```bash
cmd /c npm run dev
```

Ingresa a [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

---

## 🧪 Pruebas, Calidad de Código y QA

Los gates de calidad corren en local y en CI (`quality` → `test` + `arch` → `build` + `e2e`):

```bash
# Comprobación de Tipos (TypeScript)
cmd /c npm run type-check

# Comprobación de formato de código (Prettier)
cmd /c npm run format:check

# Análisis estático y linter (ESLint + React Compiler)
cmd /c npm run lint

# Pruebas unitarias y de integración con piso de cobertura (Vitest, 139 tests / ~40% líneas)
cmd /c npm run test -- --coverage

# Gates de arquitectura hexagonal (dependency-cruiser, severidad error)
cmd /c npm run arch

# Código muerto y dependencias sin uso (Knip)
cmd /c npm run knip

# Auditoría de dependencias: high/critical con allowlist documentada
cmd /c npm run audit:high

# Escaneo estático de seguridad (Semgrep)
cmd /c npm run security:scan

# Pruebas automatizadas de navegador (Playwright E2E)
cmd /c npx playwright test

# Comprobar compilación de Next.js para producción
cmd /c npm run build
```

---

## 🛡️ Flujo de Trabajo en Git y Automatización Pre-commit

Ramas atómicas desde `develop` (`feature/*`, `bugfix/*`, `docs/*`, `chore/*`, `test/*`); los PRs apuntan a `develop` — nunca pushear directo a `main`/`develop`. Pre-push obligatorio: `npm run type-check` + `npm run test`.

Cada `git commit` corre vía **Husky** + **lint-staged**: `eslint --fix`, `prettier --write`, React Doctor (los errores bloquean) y un escaneo local con Semgrep. Si alguna validación falla, el commit se cancela en local para que sea corregido, garantizando que el código subido siempre esté en estado óptimo.
