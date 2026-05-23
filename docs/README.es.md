# SkillRadar 🎯

🌎 [Read in English](../README.md)

SkillRadar es una plataforma moderna y de grado industrial para el **análisis de talento, evaluación de currículums (CV) y optimización para Sistemas de Seguimiento de Candidatos (ATS)**. La aplicación utiliza modelos avanzados de Inteligencia Artificial para extraer de forma estructurada habilidades, estimar el seniority de perfiles técnicos y calcular métricas críticas de adecuación a ofertas laborales.

---

## 🚀 Características Principales

- **Análisis ATS Estructurado de CV**: Carga tu currículum en formato PDF y obtén de inmediato un análisis estructurado utilizando **Gemini 2.5 Flash** (habilidades, áreas de mejora, puntaje ATS y seniority).
- **Simulador Offline Inteligente**: Si no cuentas con claves de API configuradas, la plataforma conmuta automáticamente a un motor híbrido de simulación reactiva que analiza palabras clave e infiere métricas lógicas en local.
- **Gestión Segura de Archivos**: Integración directa con **UploadThing** para la carga de currículums en la nube, protegido con defensas activas contra ataques de inyección SSRF (Server-Side Request Forgery).
- **Control de Versiones y Calidad pre-commit**: Escudo de validación local mediante **Husky** y **lint-staged** que formatea y valida sintácticamente el código antes de cada commit.
- **Etiquetado Automático de PRs**: Flujo de CI-CD en GitHub que triplica y clasifica de forma automática las capas afectadas en cada Pull Request.

---

## 🛠️ Tech Stack

- **Framework**: Next.js ^16 (App Router) + React 19 + TypeScript (Strict Mode).
- **Estilos & UI**: Tailwind CSS + shadcn/ui.
- **Base de Datos & ORM**: PostgreSQL (Neon Serverless) + Prisma ORM.
- **Autenticación**: Auth.js v5 (NextAuth) con proveedor GitHub OAuth.
- **Integración de IA**: Vercel AI SDK (Gemini como primario, OpenRouter y Groq como alternativas).

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
  3.  Copia y pega la clave en tu `.env` bajo `GEMINI_API_KEY`.
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
    npm install
    npx prisma db push
    ```

### 4. Ejecutar el Servidor de Desarrollo

Inicia tu servidor local de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

---

## 🛡️ Calidad de Código Local (Git Hooks)

Para evitar subir código con errores de linter o problemas de estilo que bloqueen los bots de validación en GitHub, el repositorio cuenta con **Husky** y **lint-staged** configurados.

Cada vez que ejecutes `git commit`, el sistema interceptará el commit local y ejecutará automáticamente:

- `eslint --fix` (Corrección automática de reglas de linter de React/TypeScript).
- `prettier --write` (Formateo automático de estilo).

Si hay un error insalvable (como un tipo incorrecto o una variable no declarada), el commit se cancelará de forma segura en local para que lo repares, garantizando que tus Pull Requests siempre pasen en **verde brillante (success)** en GitHub.
