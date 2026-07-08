# SkillRadar 🎯

🌎 [Read in English](../README.md)

SkillRadar es una plataforma moderna y de grado industrial para el **análisis de talento, evaluación de currículums (CV) y optimización para Sistemas de Seguimiento de Candidatos (ATS)**. La aplicación utiliza modelos avanzados de Inteligencia Artificial para extraer de forma estructurada habilidades, estimar el seniority de perfiles técnicos y calcular métricas críticas de adecuación a ofertas laborales.

---

## 🚀 Características Principales

- **Análisis ATS Estructurado de CV**: Carga tu currículum en formato PDF y obtén de inmediato un análisis estructurado utilizando **Gemini 2.5 Flash** (habilidades, áreas de mejora, puntaje ATS y seniority).
- **Simulador Offline Inteligente**: Si no cuentas con claves de API configuradas, la plataforma conmuta automáticamente a un motor híbrido de simulación reactiva que analiza palabras clave e infiere métricas lógicas en local.
- **Privacidad y Seguridad de Archivos**: Rutas de UploadThing completamente protegidas con sesiones activas y URLs firmadas de corta duración (1 hora). Incluye validaciones y mitigaciones contra SSRF.
- **Internacionalización Nativa (i18n)**: Soporte completo en Español e Inglés gestionado con **next-intl** utilizando rutas dinámicas (`/[locale]`) y protección de rutas agnóstica combinada con el middleware de NextAuth.
- **Selector de Tema e Idioma de Nivel Premium**: Alternancia fluida entre tema claro/oscuro y locales de español/inglés en la landing page, página de login/registro (manejando parámetros de registro) y el panel del dashboard.
- **Control de Versiones y Calidad pre-commit**: Escudo de validación local mediante **Husky** y **lint-staged** que formatea y valida sintácticamente el código antes de cada commit.
- **Etiquetado Automático de PRs**: Flujo de CI-CD en GitHub que clasifica de forma automática las capas afectadas en cada Pull Request.

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router con Turbopack) + React 19 + TypeScript (Strict Mode).
- **Estilos & UI**: Tailwind CSS v4.0 + shadcn/ui + `@base-ui/react` (Base UI v1).
- **Base de Datos & ORM**: PostgreSQL (Neon Serverless Pooler) + Prisma ORM.
- **Autenticación**: Auth.js v5 (NextAuth v5 beta) con estrategia JWT segura.
- **Internacionalización**: `next-intl` (enrutamiento nativo del sistema de archivos y diccionarios estáticos).
- **Integración de IA**: Vercel AI SDK (Gemini `gemini-2.5-flash` como primario, OpenRouter y Groq como alternativas manuales).

---

## 📦 Instalación y Configuración

### 1. Clonar el repositorio y configurar variables de entorno

Copia el archivo de plantilla `.env.example` a un nuevo archivo `.env` en la raíz de tu proyecto:

```bash
cp .env.example .env
```

### 2. Configurar las Claves de API de Inteligencia Artificial

La plataforma soporta tres proveedores de IA con niveles de acceso gratuitos:

- **Google Gemini (Primario)**:
    1.  Ingresa a [Google AI Studio](https://aistudio.google.com/).
    2.  Haz clic en **"Get API Key"** y genérala de forma 100% gratuita.
    3.  Copia la clave en tu `.env` bajo `GEMINI_API_KEY`.
- **OpenRouter (Fallback/Alternativo)**:
    1.  Crea una cuenta en [OpenRouter](https://openrouter.ai/).
    2.  Genera una API Key gratuita en la sección de Keys. Puedes usar modelos marcados como `:free` sin necesidad de tarjeta de crédito.
    3.  Copia la clave en tu `.env` bajo `OPENROUTER_API_KEY`.
- **Groq (Baja Latencia)**:
    1.  Regístrate en [Groq Console](https://console.groq.com/).
    2.  Crea una API Key gratuita de inmediato. Cuenta con límites rotativos muy generosos.
    3.  Copia la clave en tu `.env` bajo `GROQ_API_KEY`.

### 3. Sincronizar la Base de Datos

1.  Asegúrate de que tu `DATABASE_URL` apunte a tu proyecto de Neon en tu archivo `.env`.
2.  Genera el cliente de Prisma e implementa las migraciones o sincroniza el esquema:
    ```bash
    cmd /c npm install
    npx prisma db push
    ```

### 4. Ejecutar el Servidor de Desarrollo

Inicia tu servidor local de desarrollo:

```bash
cmd /c npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

---

## 🧪 Pruebas y Verificación

Para ejecutar la verificación estática, chequeo de formato, pruebas unitarias y de integración, así como de Playwright E2E:

```bash
# Comprobación de Tipos (Typecheck)
cmd /c npm run type-check

# Comprobación de formato (Prettier)
cmd /c npm run format:check

# Comprobación de reglas (ESLint)
cmd /c npm run lint

# Pruebas unitarias e integración (Vitest)
cmd /c npm run test

# Pruebas E2E (Playwright)
cmd /c npx playwright test

# Compilación de producción (Next Build)
cmd /c npm run build
```

---

## 🛡️ Calidad de Código Local (Git Hooks)

Para evitar subir código con errores de linter o problemas de estilo que bloqueen los bots de validación en GitHub, el repositorio cuenta con **Husky** y **lint-staged** configurados.

Cada vez que ejecutes `git commit`, el sistema interceptará el commit local y ejecutará automáticamente:

- `eslint --fix` (Corrección automática de reglas de linter de React/TypeScript).
- `prettier --write` (Formateo automático de estilo).

Si hay un error insalvable (como un tipo incorrecto o una variable no declarada), el commit se cancelará de forma segura en local para que lo repares, garantizando que tus Pull Requests siempre pasen en **verde brillante (success)** en GitHub.
