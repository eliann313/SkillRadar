# SkillRadar 🎯

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
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
        C[Candidato Developer] -->|1. Sube PDF de CV| UT[UploadThing Button]
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
        VSDK -->|API Key Primaria| LLM[Google Gemini 2.5 Flash / OpenRouter]
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

---

## 🚀 Características Principales

- **Análisis ATS Estructurado de CV**: Carga currículums en formato PDF de manera segura y obtén análisis estructurados utilizando **Gemini 2.5 Flash** (identificación de fortalezas, mejoras, sugerencias de formato, puntaje ATS y nivel de seniority).
- **Privacidad de Doble Ciego**: Sanitización estricta en servidor. Los datos de contacto sensibles (`name`, `email`, `githubUsername`, `image`) de los candidatos se eliminan automáticamente para perfiles que no han sido aceptados (`status !== "accepted"`), previniendo sesgos en la fase de reclutamiento.
- **Entrevista Técnica Interactiva con IA**: Simulación de entrevistas técnicas personalizadas usando Gemini mediante generación dinámica de preguntas basadas en el currículum del candidato, culminando en un reporte de rendimiento detallado.
- **Defensa Activa contra SSRF y Privacidad de Archivos**: Acceso a archivos CV protegido por sesión. Las descargas se resuelven mediante URLs firmadas temporales (1 hora de validez). Previene ataques SSRF validando nombres de dominio autorizados y forzando protocolos `https:`.
- **Cifrado Criptográfico de Base de Datos (AES-256-GCM)**: Las claves de API de los usuarios se encriptan en reposo en PostgreSQL como `ivHex:authTagHex:encryptedTextHex`, desencriptándose únicamente en la memoria del servidor.
- **Middleware combinado i18n & NextAuth**: Middleware unificado (`src/proxy.ts`) que combina la protección de rutas de **Auth.js v5** con el enrutamiento localizado de **next-intl**, logrando redirecciones automáticas coherentes (ej. `/es/dashboard`).
- **Diseño Visual Premium**: Modos claro y oscuro, interfaces con estética de cristal (glassmorphic) usando Tailwind CSS v4, animaciones suaves y un selector de idioma localizado y adaptado a Base UI v1 (empleando la propiedad `render` en lugar de `asChild` para los triggers).

---

## 🛠️ Stack Tecnológico y Versiones

- **Frontend**: Next.js 16.2.10 (App Router con Turbopack) & React 19.0.0.
- **Estilos**: Tailwind CSS v4.0.0 & shadcn/ui.
- **Componentes Interactivos**: `@base-ui/react` ^1.5.0 (Base UI v1).
- **ORM**: Prisma ^7.8.0.
- **Base de Datos**: Neon PostgreSQL Serverless (con transaction pooling activo).
- **Autenticación**: Auth.js v5 (NextAuth `5.0.0-beta`) con estrategia basada en JWT.
- **Seguridad**: `bcryptjs` para hash de contraseñas y `jose` para la firma de JWT de sesión.
- **Límites de Ratio (Rate Limiting)**: Upstash Redis Web SDK (`@upstash/ratelimit`).
- **Modelos de IA**: Vercel AI SDK (`ai` v4) con `@google/generative-ai`.
- **Internacionalización**: `next-intl` ^3.x.
- **Pruebas Unitarias**: Vitest ^3.0.0 & `@testing-library/react`.
- **Pruebas E2E**: Playwright ^1.50.0.

---

## 📁 Estructura del Proyecto

```text
├── .agents/                    # Reglas, workflows e instrucciones del agente de desarrollo
├── .github/                    # Workflows de CI/CD y plantillas de PRs e Issues
├── messages/                   # Diccionarios de traducción JSON (es.json, en.json)
├── prisma/                     # Definición de esquema de base de datos y migraciones
├── src/
│   ├── app/                    # Rutas de Next.js App Router (localizadas bajo [locale]/)
│   │   └── [locale]/
│   │       ├── dashboard/      # Rutas protegidas de panel (admin, settings, cv-analysis, etc.)
│   │       ├── legal/          # Páginas de políticas de privacidad y términos
│   │       ├── login/          # Formulario de login/registro localizado
│   │       └── page.tsx        # Página de inicio / landing page localizada
│   ├── components/             # Componentes de UI reutilizables
│   │   ├── auth/               # Formularios de autenticación
│   │   ├── layout/             # Sidebar, Navbar, LanguageSwitcher y ThemeToggle
│   │   └── ui/                 # Componentes base de shadcn/ui
│   ├── features/               # Módulos de dominio (lógica de negocio, servicios y actions)
│   │   ├── cv-analysis/        # Análisis de CV y pruebas unitarias
│   │   ├── job-match/          # Algoritmo de emparejamiento ATS
│   │   ├── jobs/               # Portal de empleo, moderación y guardas IDOR
│   │   └── recruiter/          # Gestión de candidatos y sanitizador de Doble Ciego
│   ├── i18n/                   # Configuración, enrutamiento y cargador de next-intl
│   ├── lib/                    # Utilidades compartidas (db client, rate limiters, auth options)
│   └── proxy.ts                # Interceptor del middleware combinado (Auth + next-intl)
├── tests/
│   └── e2e/                    # Pruebas End-to-End con Playwright (developer, recruiter)
└── vitest.config.ts            # Configuración del ejecutor de pruebas unitarias (Vitest)
```

---

## 📦 Instalación y Configuración

### 1. Clonar el repositorio y configurar variables de entorno

Duplica el archivo de plantilla `.env.example`:

```bash
cp .env.example .env
```

Completa las variables necesarias en el archivo `.env`:

```ini
# Conexión a Base de Datos (Neon Postgres)
DATABASE_URL="postgresql://usuario:clave@host/dbname?sslmode=require"

# Secreto de Auth.js
AUTH_SECRET="tu-clave-secreta-larga-generada"
NEXTAUTH_URL="http://localhost:3000"

# Proveedores de OAuth (GitHub & Google)
GITHUB_CLIENT_ID="tu_github_client_id"
GITHUB_CLIENT_SECRET="tu_github_client_secret"
GOOGLE_CLIENT_ID="tu_google_client_id"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# UploadThing (Carga de archivos PDF)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="tu_uploadthing_app_id"

# API Keys de Inteligencia Artificial
GEMINI_API_KEY="tu_gemini_api_key"
OPENROUTER_API_KEY="tu_openrouter_api_key"
GROQ_API_KEY="tu_groq_api_key"

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

El repositorio cuenta con validaciones de código estáticas, de formato, unitarias y automatizadas en navegadores:

```bash
# Comprobación de Tipos (TypeScript)
cmd /c npm run type-check

# Comprobación de formato de código (Prettier)
cmd /c npm run format:check

# Análisis estático y linter (ESLint)
cmd /c npm run lint

# Ejecutar pruebas unitarias y de integración (Vitest)
cmd /c npm run test

# Ejecutar pruebas automatizadas de navegador (Playwright E2E)
cmd /c npx playwright test

# Comprobar compilación de Next.js para producción
cmd /c npm run build
```

---

## 🛡️ Flujo de Trabajo en Git y Automatización Pre-commit

Con el fin de mantener un repositorio limpio y robusto, el proyecto cuenta con hooks locales automáticos mediante **Husky** y **lint-staged**.

Cada vez que realizas un `git commit`, el sistema intercepta el comando y ejecuta automáticamente:

1.  Filtra los archivos en stage (`*.ts`, `*.tsx`, `*.js`).
2.  Corre `eslint --fix` para resolver advertencias de sintaxis automáticamente.
3.  Corre `prettier --write` para normalizar los estilos del código.
4.  Realiza chequeos estáticos de seguridad locales para evitar filtración de claves.

Si alguna de las validaciones falla, el commit se cancela en local para que sea corregido, garantizando que el código subido siempre esté en estado óptimo.
