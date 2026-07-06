# 📋 SkillRadar — Trello Backlog & Roadmap Sync (Orden Secuencial v1.4)

Este archivo sirve como el inventario de desarrollo oficial y priorizado de **SkillRadar**. Contiene la definición exacta de las tarjetas del tablero de Trello, organizadas de forma **estrictamente secuencial por orden de ejecución real** — no por número de módulo. Las tarjetas de infraestructura y las que desbloquean funcionalidades críticas aparecen primero.

Cada tarjeta incluye su prioridad (Alta 🔴, Media 🟡, Baja 🟢) y su estado actual (`[x] Completada` o `[ ] Pendiente`).

> 💡 **Nota:** Los números de módulo (M1–M18) se mantienen como referencia para el tablero de Trello. El orden de lectura de este archivo **es el orden de ejecución**.

---

## Secuencia de Ejecución — Resumen

| #   | Tarjeta | Módulo | Descripción breve                           | Tier          |
| --- | ------- | ------ | ------------------------------------------- | ------------- |
| 1   | 9.0 ✅  | M9     | Modo Demo / Guest Sessions                  | Base          |
| 2   | 1.1 ✅  | M1     | Dashboard Shell compartido                  | Base          |
| 3   | 16.1 ✅ | M16    | Rate Limiting con Upstash                   | 🔴 Bloqueante |
| 4   | 16.2 ✅ | M16    | Error Boundaries del Dashboard              | 🔴 Bloqueante |
| 5   | 7.1 ✅  | M7     | AI Multi-Model Service                      | 🔴 Bloqueante |
| 6   | 7.3 ✅  | M7     | Auditoría y Verificación del Criptosistema  | 🔴 Bloqueante |
| 7   | 8.1 ✅  | M8     | Google OAuth Provider                       | 🔴 Bloqueante |
| 8   | 2.1 ✅  | M2     | CV Upload con UploadThing                   | Core MVP      |
| 9   | 2.2 ✅  | M2     | CV Parse con Gemini Real                    | Core MVP      |
| 10  | 2.3 ✅  | M2     | Textarea Fallback (OCR/Canva)               | Core MVP      |
| 11  | 3.1 ✅  | M3     | Job Match Backend                           | Core MVP      |
| 12  | 3.2 ✅  | M3     | Job Match AI Service                        | Core MVP      |
| 13  | 3.3 ✅  | M3     | Job Match Frontend                          | Core MVP      |
| 14  | 10.1 ✅ | M10    | Dashboard con Datos Reales                  | Core MVP      |
| 15  | 10.2 ✅ | M10    | Context Pipeline CV→Match                   | Core MVP      |
| 16  | 4.1 ✅  | M4     | Landing Page Comercial                      | Core MVP      |
| 17  | 4.2 ✅  | M4     | Skeletons + Toasts (UX Polish)              | Core MVP      |
| 18  | 6.1     | M6     | Mock Interview con AI real                  | Diferenciador |
| 19  | 5.1     | M5     | GitHub Analyzer Backend                     | Diferenciador |
| 20  | 5.2     | M5     | GitHub Dashboard Frontend                   | Diferenciador |
| 21  | 8.2     | M8     | Magic Links con Resend                      | Diferenciador |
| 22  | 1.2     | M1     | Dark & Light Theme                          | Diferenciador |
| 23  | 11.1    | M11    | Reverse Job-Matching (Recruiter)            | Recruiter     |
| 24  | 11.2    | M11    | Skill Gap Action Plan                       | Recruiter     |
| 25  | 11.3    | M11    | Explainability Layer                        | Recruiter     |
| 26  | 12.1    | M12    | Doble Ciego (Contact Request)               | Recruiter     |
| 27  | 12.2 ✅ | M12    | Smart Shortlist                             | Recruiter     |
| 28  | 12.3 ✅ | M12    | Market Intelligence Heatmaps                | Recruiter     |
| 29  | 13.1 ✅ | M13    | AI Resume Builder                           | Recruiter     |
| 30  | 13.2 ✅ | M13    | Impact Verb Analyzer                        | Recruiter     |
| 31  | 13.3 ✅ | M13    | LinkedIn Profile Audit                      | Recruiter     |
| 32  | 14.1    | M14    | Job Tracker Kanban                          | Recruiter     |
| 33  | 14.2    | M14    | Smart Pitch / Cover Letter                  | Recruiter     |
| 34  | 15.1    | M15    | Observaciones Técnicas                      | Recruiter     |
| 35  | 15.2    | M15    | Generador de Preguntas de Entrevista        | Recruiter     |
| 36  | 17.1 ✅ | M17    | Score Progression Analytics                 | Growth        |
| 37  | 17.2 ✅ | M17    | Perfil Público Compartible                  | Growth        |
| 38  | 17.3 ✅ | M17    | Badge Embebible para GitHub README          | Growth        |
| 39  | 7.2     | M7     | Career Copilot Widget                       | Growth        |
| 40  | 18.1    | M18    | GitHub Schema Extendido (Seniority Signals) | Intelligence  |
| 41  | 18.2    | M18    | Modos de Entrevista Avanzados               | Intelligence  |
| 42  | 4.3     | M4     | i18n con next-intl                          | Opcional      |

---

## ✅ TIER BASE — Fundamentos ya completados

> Estas tarjetas ya están implementadas. Se listan primero como referencia del punto de partida.

---

## 🔒 Módulo 9: Modo Demo / Simulación

### 🎴 Tarjeta 9.0: Implementar Modo Demo / Simulación Seguro (Server-Side Guest Sessions para Dev y Recruiter)

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Añadir dos vías de acceso instantáneas en el inicio de sesión que inicien una sesión real de "Invitado/Guest" en el servidor utilizando Auth.js v5 (vía Credentials Provider). Se inyectarán dinámicamente credenciales con los roles reales `"developer"` o `"recruiter"`, acompañados de una propiedad `isGuest: true` securizada en el JWT, permitiendo evaluar toda la interfaz correspondiente sin comprometer datos reales ni incurrir en cobros a APIs de terceros.
- **Criterios de Aceptación:**
    - [x] Añadir dos botones distintos en `LoginForm`: "Dev Demo" y "Recruiter Demo".
    - [x] Configurar un Credentials Provider en Auth.js v5 que reciba el rol como parámetro de credencial y genere un JWT válido con el rol respectivo (`"developer"` o `"recruiter"`) e inyecte `isGuest: true`.
    - [x] En las Server Actions y APIs, verificar la propiedad `isGuest`: si `session.user.isGuest === true`, interceptar el flujo y retornar datos simulados estructurados (los mocks correspondientes a cada rol) sin alterar tablas de Neon Postgres ni realizar peticiones de red reales (UploadThing, Gemini).
    - [x] Desplegar un banner superior visual ("Sticky Top" de color degradado ámbar/índigo) integrado en el shell del dashboard avisando al usuario que navega en modo Demo según su rol actual.
- **Rama Git:** `feature/guest-demo-simulation-mode`

---

## 🏗️ Módulo 1: Layout & Core Shell (parcial)

### 🎴 Tarjeta 1.1: Migrar Dashboard Shell a Layout Compartido (Next.js App Router)

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Actualmente, cada página de ruta del cliente (overview, cv-analysis, job-match, settings) importa y se envuelve manualmente en `<DashboardShell>`, lo que duplica código e invalida la persistencia del estado en el servidor. Vamos a migrar el shell a un archivo de layout real de Next.js.
- **Criterios de Aceptación:**
    - [x] Crear el archivo `src/app/dashboard/layout.tsx`.
    - [x] Trasladar el componente `DashboardShell` de uso manual a este layout compartido de Next.js.
    - [x] Eliminar los envoltorios redundantes de `DashboardShell` en `/dashboard/page.tsx`, `/dashboard/cv-analysis/page.tsx`, `/dashboard/job-match/page.tsx`, `/dashboard/settings/page.tsx` y `/dashboard/interview/page.tsx`.
    - [x] Verificar que las navegaciones internas a través del Sidebar no recarguen el menú ni parpadeen visualmente.
- **Rama Git:** `feature/dashboard-shared-layout`

---

## 🔴 TIER 1 — Infraestructura & Bloqueantes Críticos

> ⚠️ **Ejecutar antes de cualquier feature de IA o autenticación.** Estas tarjetas son precondiciones de producción — si no están implementadas, un bot puede quemar toda la quota de Gemini en minutos y el botón de Google en la landing está roto para usuarios reales.

---

## 🛡️ Módulo 16: Infraestructura & Seguridad de Producción

> ⚠️ **Precondición:** Las tarjetas de este módulo deben implementarse **antes** de hacer cualquier merge a producción de los módulos de análisis de IA (2.x, 3.x, 6.x). Son infraestructura base, no features opcionales.

### 🎴 Tarjeta 16.1: Rate Limiting & Quota Protection con Upstash

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴 — **Bloqueante de producción**
- **Descripción:**
  Ninguna tarjeta del backlog aborda el rate limiting de los endpoints de IA. Con la app pública en Vercel y los free tiers de Gemini/Groq, un único usuario (o bot) puede quemar toda la quota disponible en minutos. Implementar rate limiting por `userId` autenticado y por IP para usuarios no autenticados (modo demo), usando Upstash Redis como backend de contadores con ventana deslizante.
- **Criterios de Aceptación:**
    - [x] Crear cuenta gratuita en [Upstash](https://upstash.com/) y configurar una base de datos Redis.
    - [x] Instalar `@upstash/ratelimit` y `@upstash/redis` en el proyecto.
    - [x] Crear `src/lib/rate-limit.ts` con la abstracción del `Ratelimit` configurado con `slidingWindow`.
    - [x] Aplicar el limiter en las Server Actions de análisis de CV (`uploadAndParseCVAction`) y Job Match, retornando `{ success: false, error: "Límite alcanzado..." }` con el tiempo de reset.
    - [x] Definir límites iniciales conservadores: 5 análisis de CV por usuario por día, 10 Job Matches por usuario por día.
    - [x] Mostrar en la UI un mensaje amigable indicando el límite alcanzado y el tiempo aproximado de reset.
    - [x] Registrar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` en `.env.example` y en las variables de Vercel.
- **Rama Git:** `feature/rate-limiting-upstash`

### 🎴 Tarjeta 16.2: Error Boundaries Globales del Dashboard

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  Con un pipeline de análisis de IA que puede fallar por network, timeout o schema inválido del LLM, es crítico tener error boundaries que muestren estados de error amigables en lugar de pantallas en blanco. Next.js App Router provee `error.tsx` y `loading.tsx` por ruta como convención nativa.
- **Criterios de Aceptación:**
    - [x] Crear `src/app/dashboard/error.tsx` que capture errores de Server Components con un mensaje claro y un botón "Reintentar" (usando el callback `reset` de Next.js).
    - [x] Crear `src/app/dashboard/cv-analysis/error.tsx` y `src/app/dashboard/job-match/error.tsx` con mensajes contextuales por feature.
    - [x] Crear `src/app/dashboard/loading.tsx` con un skeleton global del layout del dashboard para transiciones de navegación.
    - [x] Verificar que los errores de Server Actions en el cliente muestren el toast de error de `sonner` en lugar de silenciarse.
- **Rama Git:** `feature/dashboard-error-boundaries`

---

## 🧠 Módulo 7: AI Services (parcial — tarjeta bloqueante)

### 🎴 Tarjeta 7.1: Crear Servicio de IA Multi-Modelo Unificado (Gemini + Groq + OpenRouter + OpenAI + Anthropic)

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴 — **Bloqueante de todo el pipeline de IA**
- **Descripción:**
  Desacoplar la llamada a la IA de los servicios de negocio individuales. Crear un motor de IA unificado y flexible en `src/lib/ai/` que permita a los usuarios configurar sus propias **API Keys** de Gemini, Groq, OpenRouter, OpenAI y Anthropic cifradas en base de datos de forma ultra-segura (AES-256-GCM). Habilitar la selección granular de modelos avanzados de última generación en cada feature y la **exención inteligente de rate limiting** para usuarios que traigan sus propias llaves.
- **Criterios de Aceptación:**
    - [x] Extender el modelo `User` en `prisma/schema.prisma` agregando campos opcionales cifrados para las API Keys de los 5 proveedores y preferencias por defecto.
    - [x] Implementar un módulo criptográfico `src/lib/crypto.ts` para encriptar y desencriptar transparente y robustamente las API Keys en el servidor mediante **AES-256-GCM** y un secret `ENCRYPTION_KEY`. Cada operación de encriptación debe generar un **IV de 12 bytes aleatorio único y un Auth Tag de 16 bytes**, concatenados como `iv:tag:ciphertext` en la base de datos de Neon Postgres para evitar patrones de repetición y blindar la seguridad contra ingeniería inversa.
    - [x] Crear el factory central de IA en `src/lib/ai/index.ts` integrando los proveedores dinámicos `@ai-sdk/google`, `@ai-sdk/openai` y `@ai-sdk/anthropic` de Vercel AI SDK.
    - [x] Diseñar el soporte para modelos de vanguardia (Gemini 3.5 Flash, Gemini 3.1 Pro, GPT-5.5, Claude Opus 4.7) mediante dropdowns preconfigurados e inputs de texto libre para IDs de modelos personalizados en la UI.
    - [x] Configurar las Server Actions de `cv-analysis` y `job-match` para **omitir el rate limit de Upstash** si el usuario tiene su propia API Key configurada para la acción elegida.
    - [x] Adaptar `src/features/cv-analysis/ai-service.ts` para que consuma esta nueva abstracción flexible en lugar del cliente estático.
    - [x] Crear la tarjeta de configuración interactiva de IA en la página de `/dashboard/settings` ocultando las claves en texto plano y mostrando solo indicadores booleanos (`hasKey`).
- **💡 Razón del Cambio:** Sentar las bases del pipeline de IA premium y flexible antes de codificar Job Match y Mock Interview para que hereden toda la resiliencia y el soporte multi-modelo de vanguardia automáticamente.
- **Rama Git:** `feature/ai-multimodel-service`

### 🎴 Tarjeta 7.3: Auditoría, Testing Unitario y Verificación en Producción del Criptosistema (AES-256-GCM)

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  Aunque la librería de criptografía central `src/lib/crypto.ts` y el motor `AIService` ya están codificados en el repositorio, es crítico realizar un proceso de auditoría formal. Implementaremos pruebas de integración que validen el ciclo de vida completo: inserción en base de datos de Neon, correcto almacenamiento del formato `iv:tag:ciphertext`, verificación de que el IV cambie en cada guardado de la misma llave (evitando patrones repetitivos), y manejo de errores ante corrupción de datos.
- **Criterios de Aceptación:**
    - [x] Escribir tests unitarios con Vitest en `src/lib/crypto.test.ts` que demuestren que dos llamadas consecutivas de encriptación sobre el mismo texto plano devuelven textos cifrados diferentes (gracias a IVs distintos).
    - [x] Validar que un texto cifrado alterado intencionadamente falle al descifrar por error de Auth Tag de forma segura.
    - [x] Ejecutar una prueba de persistencia real en Neon Postgres con datos cifrados de prueba simulando la acción de `/dashboard/settings`.
- **Rama Git:** `feature/crypto-system-verification`

---

## 🔑 Módulo 8: Autenticación Novedosa (parcial — Google OAuth)

### 🎴 Tarjeta 8.1: Configurar Google OAuth Provider

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴 — **Bug activo: botón visible en landing sin funcionalidad**
- **Descripción:**
  Habilitar el inicio de sesión con Google OAuth creando las credenciales de cliente en Google Cloud Console, vinculando el botón "Google" de la UI y configurando las variables de entorno seguras. El botón "Continue with Google" ya está visible en la landing pero no tiene provider configurado — es un bug activo de primera impresión.
- **Criterios de Aceptación:**
    - [x] Crear un proyecto en Google Cloud Console y configurar la pantalla de consentimiento de OAuth.
    - [x] Agregar las URLs autorizadas de redirección de NextAuth en la consola de Google.
    - [x] Registrar las variables `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en el archivo `.env.local` y validarlas en `src/lib/env.ts`.
    - [x] Probar el inicio de sesión en local y verificar que asocie correctamente al usuario en la base de datos de Neon Prisma.
- **Rama Git:** `feature/auth-google-provider`

---

## 🟠 TIER 2 — Core MVP

> El núcleo del producto. El backlog avanza estrictamente en este orden: sin CV real no hay Job Match, sin Job Match no hay Dashboard útil.

---

## 📂 Módulo 2: CV Upload & Parse (Developer)

### 🎴 Tarjeta 2.1: Conectar Subida de Archivos con UploadThing en Frontend

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Vincular el componente maqueta de v0 `CVUploadForm` (`src/components/cv-analysis/cv-upload-form.tsx`) para que suba el archivo PDF seleccionado por el usuario al CDN real de UploadThing usando el endpoint de backend que ya está expuesto en `src/app/api/uploadthing/route.ts`. Para resguardar la privacidad de la información altamente sensible del CV (PII), se establecerá un esquema de almacenamiento privado con URLs firmadas temporales de corta duración (ej: AWS S3 privado o similar).
- **Criterios de Aceptación:**
    - [x] Importar e integrar el hook `useUploadThing` de `@uploadthing/react` en `cv-upload-form.tsx`.
    - [x] Configurar el estado de progreso visual en el área drag-and-drop mientras se realiza la subida.
    - [x] Capturar adecuadamente la respuesta del servidor con la URL de archivo segura y configurar el acceso privado en la nube.
    - [x] Implementar la generación de URLs firmadas temporales (Pre-signed URLs) de corta duración para la visualización del archivo.
    - [x] Manejar errores de red o restricciones de archivos de más de 4MB de forma amigable.
- **Rama Git:** `feature/cv-uploadthing-frontend`

### 🎴 Tarjeta 2.2: Enlazar Formulario de CV con Server Action y Gemini Real

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Reemplazar el análisis simulado de 2.5 segundos en la página de carga de CV y conectar la interfaz con la Server Action del backend `uploadAndParseCVAction` para que ejecute el análisis estructurado de Gemini con Zod en Neon Postgres.
- **Criterios de Aceptación:**
    - [x] Reemplazar la constante estática `mockAnalysis` en `src/app/dashboard/cv-analysis/page.tsx` por datos reales.
    - [x] Invocar a `uploadAndParseCVAction` pasándole la URL de UploadThing obtenida tras subir el archivo y el nombre del PDF.
    - [x] En la Server Action, verificar estrictamente que la sesión de usuario sea válida y aplicar el validador de SSRF y Regex de la URL de UploadThing antes de descargar el archivo.
    - [x] Mantener las barreras de prompt del sistema en `CVAnalysisAIService.ts` que marcan el CV como datos pasivos de entrada para neutralizar inyecciones de prompt.
    - [x] Renderizar en los componentes `ATSScoreCard` y `AnalysisResults` la información real proveniente del objeto de base de datos Neon.
    - [x] Comprobar que la base de datos de Neon almacena correctamente el JSON del análisis estructurado bajo la fila de la tabla `Resume`.
- **💡 Arquitectura de IA:** Conectar esta acción a la abstracción multi-modelo desarrollada en la **Tarjeta 7.1** para permitir la conmutación por error (fallback a Groq/OpenRouter) sin acoplar la llamada a Google de forma rígida.
- **Rama Git:** `feature/cv-actions-neon-integration`

### 🎴 Tarjeta 2.3: Integrar Textarea Fallback para CVs no Legibles (OCR/Canva)

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  Si el parseador de PDF devuelve un texto crudo vacío (debido a PDFs escaneados o imágenes complejas sin OCR), mostrar un textarea alternativo para que el desarrollador pegue su CV en texto plano y no interrumpir su flujo.
- **Criterios de Aceptación:**
    - [x] Detectar si el texto extraído en el servicio es nulo o excesivamente corto.
    - [x] Desplegar en la UI de forma condicional un aviso advirtiendo la limitación y habilitar el campo `Textarea` para pegar texto crudo.
    - [x] Implementar la conexión de este texto directo a la Server Action de análisis y persistir el resultado.
- **Rama Git:** `feature/cv-text-fallback`

---

## 🎯 Módulo 3: Job Match (Developer)

### 🎴 Tarjeta 3.1: Crear Capa de Negocio y Estructura Backend de Job Match

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Actualmente no existe la feature `job-match` en el backend. Debemos extraer la lógica del servidor en la carpeta `src/features/job-match/` definiendo sus actions, service, repository y tipaciones para Gemini y Prisma.
- **Criterios de Aceptación:**
    - [x] Crear el directorio `src/features/job-match/`.
    - [x] Definir el Zod Schema para la evaluación estructurada del cruzado de datos (seniority match, alignedSkills, missingSkills, matchScore y recomendaciones).
    - [x] Implementar la query Prisma en `repository.ts` para crear y guardar las comparaciones en la tabla `JobMatch`.
    - [x] **Seguridad (IDOR / Scope Guard):** Validar en la acción del servidor que el `resumeId` consultado pertenezca estrictamente al `userId` autenticado de la sesión. Bloquear e impedir cualquier consulta sobre CVs ajenos.
- **Rama Git:** `feature/job-match-backend`

### 🎴 Tarjeta 3.2: Diseñar Prompt e Inferencia de Match en Servidor con IA

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Desarrollar la lógica en `service.ts` para extraer los requisitos principales de la oferta laboral e invocar a Gemini con Structured Outputs (o Groq Llama 3 en su defecto) para compararla contra el texto crudo del currículum que el usuario elija de su historial.
- **Criterios de Aceptación:**
    - [x] Diseñar el prompt sistemático y estructurado en `src/features/job-match/service.ts`.
    - [x] Utilizar el cliente de la **Tarjeta 7.1** para invocar la llamada estructurada con el schema Zod correspondiente.
    - [x] Escribir tests unitarios con Vitest para corroborar el cálculo y formateo del score de coincidencia.
- **Rama Git:** `feature/job-match-ai-evaluation`

### 🎴 Tarjeta 3.3: Conectar Frontend de Job Match con Server Actions

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Modificar la maqueta estática `/dashboard/job-match` de v0. Permitir al usuario seleccionar mediante un `Select` qué currículum de su historial quiere comparar, pegar la oferta de trabajo y gatillar la Server Action real de comparación.
- **Criterios de Aceptación:**
    - [x] Eliminar `mockMatch` en `src/app/dashboard/job-match/page.tsx`.
    - [x] Agregar un menú desplegable (`Select` de shadcn/ui) para cargar los CVs previamente subidos y guardados del desarrollador desde la base de datos Neon.
    - [x] Invocar a la Server Action de comparación y renderizar en los componentes `MatchScoreCard` e `GapAnalysis` los datos vivos de la DB.
- **Rama Git:** `feature/job-match-frontend`

---

## 📊 Módulo 10: Live Dashboard & Context Pipeline

### 🎴 Tarjeta 10.1: Dashboard con Datos Reales y "Next Action"

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  El Dashboard muestra métricas vivas de Neon (último score, uso de base de datos). Agregar "Next Action Cards" dinámicas basadas en la progresión del usuario (ej: "Sube tu CV para empezar", "Toma una Mock Interview").
- **Criterios de Aceptación:**
    - [x] Reemplazar todos los datos estáticos del overview del Dashboard con queries reales de Prisma que consulten los últimos scores de `Resume`, `JobMatch` y `GithubAnalysis`.
    - [x] Implementar un componente dinámico "Next Action" que evalúe el estado del usuario en la DB y renderice una tarjeta interactiva con un llamado a la acción (ej: si no tiene CV, muestra "Subir CV"; si tiene CV pero no matches, muestra "Comparar Oferta").
    - [x] Agregar un gráfico pequeño de progreso histórico del Score ATS utilizando Recharts o componentes Tailwind.
- **Rama Git:** `feature/dashboard-landing-polish-pipeline`

### 🎴 Tarjeta 10.2: Context Pipeline - Conectar CV Real al Match

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Al iniciar un Job Match, el sistema debe precargar los skills extraídos del Resume del usuario desde la DB, no usar mocks genéricos. El dev solo pega la Oferta, la IA cruza Oferta vs CV real.
- **Criterios de Aceptación:**
    - [x] Modificar la query del servicio de Job Match para recibir el `resumeId` seleccionado por el desarrollador.
    - [x] Extraer el JSON estructurado de habilidades y experiencia de la tabla `Resume` en Postgres.
    - [x] Enviar al prompt de Gemini/Llama el texto estructurado del currículum real recuperado de la base de datos junto con el texto de la nueva Job Offer.
    - [x] Validar que los resultados del Match se guarden correctamente en la tabla `JobMatch` con su respectiva relación de clave foránea a la tabla `Resume`.
- **Rama Git:** `feature/dashboard-landing-polish-pipeline`

---

## 🎨 Módulo 4: Marketing Landing & UX (parcial)

### 🎴 Tarjeta 4.1: Diseñar Landing Page Comercial de Marketing en `/`

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  Actualmente, al ingresar a la raíz de la web `/`, se le muestra al usuario anónimo directamente el formulario de inicio de sesión. Vamos a crear una landing page comercial, moderna y descriptiva para captar a usuarios de marketing antes de iniciar sesión.
- **Criterios de Aceptación:**
    - [x] Modificar `src/app/page.tsx` para mostrar la landing de presentación del producto si no hay sesión activa.
    - [x] Diseñar un Hero premium con gradientes de fondo, micro-animaciones en Tailwind v4 y CTA atractivos de registro con GitHub.
    - [x] Trasladar el formulario de inicio de sesión `LoginForm` a una ruta dedicada `/login` (creando `src/app/login/page.tsx`).
    - [x] Garantizar SEO óptimo (meta tags, open graph, y headings estructurados semánticamente).
- **Rama Git:** `feature/dashboard-landing-polish-pipeline`

### 🎴 Tarjeta 4.2: Polishing de Interfaz (Skeletons de Carga & Toasts)

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  Añadir transiciones fluidas y estados visuales elegantes mediante Skeletons durante las peticiones a la IA y notificaciones dinámicas tipo Toast usando `sonner`.
- **Criterios de Aceptación:**
    - [x] Instalar y registrar el Toast Provider de `sonner` en el root layout.
    - [x] Crear loaders visuales de tipo `Skeleton` para los scores y listas de habilidades.
    - [x] Desplegar avisos flotantes interactivos de éxito o error tras subidas de archivos o ejecuciones de la IA.
- **Rama Git:** `feature/dashboard-landing-polish-pipeline`

---

## 🟡 TIER 3 — Diferenciadores del Producto

> Features que nos separan de Jobscan y Rezi. Requieren el Core MVP funcionando.

---

## 💬 Módulo 6: Mock Interview

### 🎴 Tarjeta 6.1: Conectar Chat de Mock Interview con Vercel AI SDK y Gemini

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡 (¡Subido desde Baja / Fase 2!)
- **Descripción:**
  Actualmente, el chat interactivo en `/dashboard/interview` responde preguntas aleatorias en base a un array plano en el cliente. Vamos a conectar esta UI con el Vercel AI SDK e implementar una Server Action real para simular una entrevista técnica en vivo adaptada al CV y habilidades del desarrollador, persistiendo el resultado en la base de datos.
- **Criterios de Aceptación:**
    - [x] Integrar el hook de chat dinámico en `src/components/interview/mock-interview-chat.tsx` utilizando `useChat` o Server Actions en streaming.
    - [x] Implementar la Server Action que inyecte el CV seleccionado y los gaps del Job Match al prompt del LLM (Gemini 2.5 Flash / Groq) como contexto de entrevista técnica estructurada.
    - [x] Escribir la lógica del disparador "Finalizar Entrevista": el chat termina, y el sistema invoca una llamada de LLM separada asíncrona para compilar el **Debrief JSON** estructurado con calificaciones por área (ej. comunicación técnica, arquitectura, testing).
    - [x] Guardar los datos de la entrevista en el nuevo modelo `InterviewSession` de Prisma (relacionando `userId`, `debrief`, `score` de match y el array serializado de `messages`).
    - [x] Validar que la UI del dashboard renderice adecuadamente los scores históricos de estas entrevistas para el "Score Progression Timeline".
- **Rama Git:** `feature/mvp-tier3-integration-bundle`

---

## 🔌 Módulo 5: GitHub Signal Translation

### 🎴 Tarjeta 5.1: Implementar Route Handler `/api/github/analyze` and API Connector

- **Estado:** `[x] Completada`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Crear la conexión con la API de GitHub usando el access token de GitHub OAuth del usuario, extraer datos de repos públicos y procesar con Gemini un reporte técnico sobre la calidad del código, READMEs y commits.
- **Criterios de Aceptación:**
    - [x] Crear el conector en `src/lib/github.ts` que consulte la API de GitHub.
    - [x] Crear el Route Handler `/src/app/api/github/analyze/route.ts`.
    - [x] **Seguridad (Cifrado de Tokens):** Encriptar los access tokens de GitHub OAuth si son guardados o expuestos de forma intermedia, utilizando el módulo criptográfico (`crypto.ts`).
    - [x] **Seguridad (Input Sanitization & SSRF Prevention):** Validar y sanitizar el nombre de usuario de GitHub recibido en el input para evitar inyecciones de cabeceras HTTP o SSRF. Solo permitir caracteres alfanuméricos y guiones (`/^[a-zA-Z0-9\-]+$/`).
    - [x] **Seguridad (Rate Limiting):** Proteger el endpoint aplicando el limitador de Upstash Redis por ID de usuario.
    - [x] Definir el Zod Schema para la respuesta estructurada de la IA sobre el perfil GitHub.
    - [x] Persistir los análisis técnicos y las estadísticas de lenguajes en la tabla `GithubAnalysis` de Prisma.
- **Rama Git:** `feature/mvp-tier3-integration-bundle`

### 🎴 Tarjeta 5.2: Crear Vista Dashboard de Análisis GitHub

- **Estado:** `[x] Completada`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Agregar la ruta `/dashboard/github` y crear la UI interactiva que muestre gráficos de distribución de lenguajes (bytes), frecuencias de commits e informes cualitativos generados por la IA.
- **Criterios de Aceptación:**
    - [x] Crear la página `src/app/dashboard/github/page.tsx` en el dashboard.
    - [x] Diseñar los componentes UI necesarios (LanguageChart, RepoList, StrengthsWeaknessesCard).
    - [x] Conectar los componentes a los datos reales de base de datos e implementar un botón de actualización de perfil en tiempo real.
- **Rama Git:** `feature/mvp-tier3-integration-bundle`

---

## 🔑 Módulo 8: Autenticación Novedosa (parcial — Credenciales Seguras)

### 🎴 Tarjeta 8.2: Autenticación Tradicional por Email y Contraseña con Hashing Seguro (Bcrypt) + Recuperación de Cuenta

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Configurar el inicio de sesión tradicional y seguro con credenciales de Email y Contraseña utilizando el Credentials Provider de Auth.js v5. Para proteger los datos del usuario, las contraseñas se almacenarán en Neon Postgres cifradas mediante hashing criptográfico con salt (usando `bcryptjs` para compatibilidad serverless/edge).
- **Criterios de Aceptación:**
    - [x] Instalar `bcryptjs` y `@types/bcryptjs` en el proyecto.
    - [x] Diseñar el formulario de Registro e Inicio de sesión en `/login` solicitando Email y Contraseña.
    - [x] Validar los inputs tanto en frontend como en backend usando Zod (contraseña mínimo 8 caracteres, al menos una letra mayúscula, una minúscula y un número).
    - [x] En la Server Action de registro, cifrar la contraseña usando `bcrypt.hash(password, 10)` antes de guardarla en la tabla `User` de Neon.
    - [x] En el Credentials Provider de Auth.js v5, comparar la contraseña ingresada con el hash de la base de datos usando `bcrypt.compare`.
    - [x] Proteger el endpoint de login aplicando el rate limiter de Upstash Redis (máximo 5 intentos fallidos en 15 minutos por IP/email) para mitigar ataques de fuerza bruta.
    - [x] Opcional: Integrar flujo de recuperación de contraseña ("Olvidé mi contraseña") enviando un token seguro y temporal (15 min) al correo del usuario vía **Resend**.
- **Rama Git:** `feature/mvp-tier3-integration-bundle`

---

## 🏗️ Módulo 1: Layout & Core Shell (parcial — Dark Mode)

### 🎴 Tarjeta 1.2: Implementar Dark & Light Theme con next-themes

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  Instalar y configurar `next-themes` para dar soporte dinámico de color en el frontend y añadir un selector visual de temas en la barra superior del dashboard.
- **Criterios de Aceptación:**
    - [x] Instalar la librería `next-themes` en el proyecto.
    - [x] Configurar el provider de temas en `src/app/layout.tsx`.
    - [x] Crear un componente selector `ThemeToggle` usando shadcn/ui.
    - [x] Comprobar que los estilos de Tailwind CSS v4 respondan adecuadamente al cambiar de modo en todas las vistas principales.
- **Rama Git:** `feature/combined-matching-theme-explainability`

---

## 🟢 TIER 4 — Plataforma Recruiter

> El lado B2B del producto. Requiere que el Tier 2 (Core MVP) esté completo y en producción. La cadena de dependencias es: M11 → M12 → M15.

---

## 🔍 Módulo 11: Recruiter Reverse Matching & Explainability

### 🎴 Tarjeta 11.1: Reverse Job-Matching (Recruiter)

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  El recruiter pega una JD y la IA rankea a todo el Talent Pool anónimo mostrando un % de match y una justificación breve para cada desarrollador.
- **Criterios de Aceptación:**
    - [x] Crear la interfaz del Recruiter con un campo de texto para pegar la Job Description (JD).
    - [x] Implementar una Server Action que consulte todos los perfiles de desarrolladores activos en la base de datos Postgres (de forma anónima).
    - [x] Procesar con la IA la JD en comparación con los perfiles del pool de talento y devolver un listado ordenado por el porcentaje de encaje.
    - [x] Renderizar una lista interactiva de candidatos ordenada por afinidad con información oculta (Doble Ciego) mostrando solo el matching % y el extracto de encaje.
- **Rama Git:** `feature/combined-matching-theme-explainability`

### 🎴 Tarjeta 11.2: Skill Gap Action Plan & Upskilling Roadmap

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  Después de un Job Match, si se detectan gaps, generar un mini-roadmap de 3 pasos de recursos para que el dev sepa cómo cubrirlos.
- **Criterios de Aceptación:**
    - [x] En el JSON retornado por la IA en el análisis de Job Match, inyectar un array estructurado de "Action Steps" para las habilidades faltantes (missingSkills).
    - [x] Generar para cada brecha un consejo práctico de estudio (ej: proyectos sugeridos, documentación oficial, conceptos clave a aprender).
    - [x] Renderizar de forma visual e interactiva este plan en una sección del dashboard llamada "Tu Ruta de Crecimiento" o "Action Plan".
- **Rama Git:** `feature/combined-matching-theme-explainability`

### 🎴 Tarjeta 11.3: Explainability Layer (Capa de Explicabilidad)

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  En la UI, cada vez que haya un Score (ATS o Match), incluir un botón/tooltip que desglose el razonamiento de la IA (Fortalezas detectadas, Evidencia faltante).
- **Criterios de Aceptación:**
    - [x] Crear un componente reutilizable de tipo Modal/Drawer de shadcn/ui llamado `ExplainabilityPanel`.
    - [x] Configurar el prompt del parser para extraer el razonamiento cualitativo de la IA detrás de los scores otorgados.
    - [x] Habilitar un botón interactivo (ej: icono de ojo o "Ver Razonamiento") junto a cada puntaje que abra este panel con las justificaciones, la evidencia encontrada y los puntos débiles detectados de forma clara.
    - [x] Implementar una política de seguridad estricta para las claves de API (OpenAI/Gemini/Anthropic): todas las llamadas se realizarán únicamente desde Server Actions, utilizando variables de entorno en Vercel con encriptación en reposo y sin exponer jamás las claves al lado cliente.
- **Rama Git:** `feature/combined-matching-theme-explainability`

---

## 🕶️ Módulo 12: Doble Ciego & Sourcing Avanzado

### 🎴 Tarjeta 12.1: Opt-In de Doble Ciego (Contact Request Flow)

- **Estado:** `[x] Completada`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Implementar el flujo asíncrono y seguro donde el reclutador pulsa "Solicitar Contacto" (enviando un "Pitch" anónimo) sobre un perfil del Talent Pool. El desarrollador recibe la propuesta anónima en su dashboard y puede aceptarla (revelando sus datos personales de contacto) o declinarla de forma silenciosa.
- **Criterios de Aceptación:**
    - [x] Diseñar el formulario en la vista de reclutador para ingresar el mensaje/pitch de contacto.
    - [x] Implementar la Server Action `createContactRequestAction` que valide el rol `"recruiter"` y cree la fila en la tabla `ContactRequest` con estado `"pending"`.
    - [x] **Seguridad (Sanitización XSS):** Validar y sanitizar el texto del mensaje/pitch del reclutador en la Server Action para impedir inyecciones de código malicioso antes de guardarlo en la base de datos y antes de renderizarlo en el panel del desarrollador.
    - [x] Crear la vista de "Peticiones de Contacto Recibidas" en el dashboard del Desarrollador (`/dashboard/requests` o sección de notificaciones) cargando las solicitudes donde `developerId === currentUser.id`.
    - [x] Implementar las Server Actions `acceptContactRequestAction` (cambia el estado a `"accepted"`) y `declineContactRequestAction` (cambia el estado a `"declined"`).
    - [x] Configurar el control de privacidad estricto del lado del servidor (Server-Only DTOs): si el estado no es `"accepted"`, la Server Action o API del Recruiter omite por completo los campos `name`, `email`, `githubUsername` e `image` en la consulta de base de datos. De esta forma, el payload JSON jamás viaja al navegador si el contacto está pendiente.
- **Rama Git:** `feature/combined-matching-theme-explainability`

### 🎴 Tarjeta 12.2: Smart Shortlist y Alertas de Recruiter

- **Estado:** `[x] Completada`
- **Prioridad:** Baja 🟢
- **Descripción:**
  El recruiter puede guardar búsquedas y marcar perfiles en shortlists. Notificaciones automáticas cuando un nuevo dev entra al pool y matchea su búsqueda guardada.
- **Criterios de Aceptación:**
    - [x] Crear el modelo `Shortlist` en Prisma relacionado con el `User` (Recruiter) y los `User` (Developer) agregados.
    - [x] Implementar un botón "Guardar en Favoritos/Shortlist" en la vista del Recruiter.
    - [x] Crear una sección "Mis Candidatos Guardados" en el panel del Recruiter para visualizar de forma centralizada sus perfiles seleccionados.
- **Rama Git:** `feature/modules-12-13-implementation`

### 🎴 Tarjeta 12.3: Market Intelligence (Pool Heatmaps)

- **Estado:** `[x] Completada`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Dashboard de estadísticas para el recruiter. Mostrar mapas de calor con los skills más escasos vs más abundantes del talent pool.
- **Criterios de Aceptación:**
    - [x] Crear un servicio de agregación en Prisma que recopile y agrupe por frecuencia todas las habilidades técnicas (`skills`) almacenadas en los currículums del Talent Pool.
    - [x] Integrar un gráfico de tipo Treemap, Nube de Palabras o Barras Horizontales con Recharts en la sección de Recruiter.
    - [x] Mostrar visualmente los "Skills Más Demandados vs. Más Abundantes" para dar una perspectiva del mercado de candidatos al reclutador.
- **Rama Git:** `feature/modules-12-13-implementation`

---

## 📝 Módulo 13: Perfil Público y Resume Builder Interactivo

### 🎴 Tarjeta 13.1: AI Resume Builder (Editor en Vivo)

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  Permitir al usuario no solo analizar un PDF, sino editar y construir su CV directamente en la plataforma. La interfaz debe permitir crear secciones (Experiencia, Educación, Skills) y aplicar las sugerencias de la IA en tiempo real antes de exportar el PDF optimizado.
- **Criterios de Aceptación:**
    - [x] Diseñar una interfaz interactiva de edición por secciones (Formularios y campos enriquecidos de texto).
    - [x] Conectar la IA para que evalúe y sugiera mejoras de redacción mientras el usuario escribe en los campos de experiencia.
    - [x] Implementar un generador de PDF del lado del servidor (usando una librería liviana como `@react-pdf/renderer` o un flujo similar) para permitir la descarga directa del currículum en formato compatible con ATS.
- **Rama Git:** `feature/modules-12-13-implementation`

### 🎴 Tarjeta 13.2: Impact Verb Analyzer (Analizador de Impacto)

- **Estado:** `[x] Completada`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Integrar una evaluación específica en el parsing del CV que detecte la calidad de los verbos utilizados en las viñetas de experiencia. Promover el uso de lenguaje de impacto ("Arquitecté", "Optimizé") frente a lenguaje pasivo ("Ayudé a", "Fui parte de"), dando un "Action Score".
- **Criterios de Aceptación:**
    - [x] Definir una lista de control semántica o prompt específico para que la IA escanee la redacción de las responsabilidades del CV.
    - [x] Clasificar el uso de verbos pasivos y sugerir alternativas activas y orientadas a resultados.
    - [x] Renderizar un "Impact Score" y una lista de "Antes / Después" con ejemplos de cómo reescribir sus viñetas.
- **Rama Git:** `feature/modules-12-13-implementation`

### 🎴 Tarjeta 13.3: Auditoría de Perfil de LinkedIn con IA

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  Implementar una auditoría SEO para el perfil de LinkedIn del usuario libre de riesgos legales y sin costos de APIs de scraping externas. El sistema permitirá al usuario pegar directamente su extracto/experiencia o subir el PDF generado por su perfil de LinkedIn (`Ctrl + P` -> Guardar como PDF), reutilizando la infraestructura de parseo. La IA analizará el Titular, la sección 'Acerca de' y la densidad de palabras clave para optimizar su posicionamiento.
- **Criterios de Aceptación:**
    - [x] Crear una interfaz que permita subir el perfil de LinkedIn exportado en PDF o pegar directamente el texto copiado de su perfil.
    - [x] Integrar el lector de PDFs del Módulo 2 para extraer el texto estructurado del PDF de LinkedIn.
    - [x] Configurar un prompt especializado en posicionamiento orgánico en búsquedas de reclutadores de LinkedIn (SEO técnico).
    - [x] Retornar y mostrar una calificación del perfil con consejos específicos de mejora para el titular, el "Acerca de" y la descripción de responsabilidades.
- **Rama Git:** `feature/modules-12-13-implementation`

---

## 🗂️ Módulo 14: Job Tracker & Smart Pitch (Gestión de Búsqueda)

### 🎴 Tarjeta 14.1: Job Tracker (Kanban Board)

- **Estado:** `[x] Completado`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Crear un CRM personal para el desarrollador con vista Kanban (To Apply, Applied, Interviewing, Offer). Permitirle arrastrar las ofertas laborales que le interesan y centralizar el estado de su búsqueda de empleo dentro de SkillRadar.
- **Criterios de Aceptación:**
    - [x] Crear el modelo `JobApplication` en Prisma para almacenar las postulaciones creadas por el usuario, asociando el cargo, la empresa, la URL de la oferta y su columna/estado.
    - [x] Implementar un tablero Kanban visual utilizando la librería `@hello-pangea/dnd` o un sistema de drag-and-drop nativo de React compatible con Server Actions.
    - [x] Sincronizar instantáneamente en la base de datos de Neon el cambio de estado cuando una tarjeta se arrastra a otra columna.
- **Rama Git:** `feature/modules-14-15-implementation`

### 🎴 Tarjeta 14.2: Smart Pitch / Auto-Cover Letter

- **Estado:** `[x] Completado`
- **Prioridad:** Alta 🔴
- **Descripción:**
  A partir del Job Match, generar automáticamente un "Pitch de Valor" estructurado. El mensaje debe tener un tono humilde y profesional enfocado en: 1) Cómo el dev agrega valor inmediato a la empresa y 2) Reconocimiento honesto de sus brechas (gaps) y su plan de acción para resolverlas.
- **Criterios de Aceptación:**
    - [x] Implementar una Server Action que combine los datos de `Resume` y la oferta de `JobMatch` procesados.
    - [x] Consumir la IA para redactar un pitch de contacto en primera persona con un tono profesional, honesto y empático (máximo 3 párrafos).
    - [x] Habilitar un botón "Copiar al Portapapeles" e integrar una sección de edición manual para que el dev pueda hacer pequeños ajustes antes de enviarlo.
- **Rama Git:** `feature/modules-14-15-implementation`

---

## 🤝 Módulo 15: Recruiter Empowerment & AI Copilot

### 🎴 Tarjeta 15.1: Observaciones Técnicas Estructuradas (Áreas de Oportunidad)

- **Estado:** `[x] Completado`
- **Prioridad:** Media 🟡
- **Descripción:**
  Durante el Reverse Job-Matching, reemplazar el concepto punitivo de "Red Flags" por "Observaciones Técnicas". La IA detectará inconsistencias de carrera o brechas en el stack y las presentará al reclutador de manera constructiva como puntos a investigar.
- **Criterios de Aceptación:**
    - [x] Configurar el prompt del servicio B2B para que categorice los puntos de cuidado en "Puntos a verificar" o "Áreas de exploración técnica" en lugar de "Red Flags".
    - [x] Retornar y renderizar estas observaciones en una lista de tipo acordeón en el perfil anónimo que ve el reclutador.
    - [x] Asegurarse de que el lenguaje de la IA sea 100% descriptivo, analítico y libre de juicios de valor destructivos.
- **Rama Git:** `feature/modules-14-15-implementation`

### 🎴 Tarjeta 15.2: Generador de Preguntas de Entrevista Asistidas

- **Estado:** `[x] Completado`
- **Prioridad:** Media 🟡
- **Descripción:**
  Cuando un reclutador selecciona a un candidato de la Shortlist, la IA debe generar un PDF o panel con 3-5 preguntas técnicas altamente específicas basadas en las debilidades o tecnologías clave del desarrollador. Esto empodera a reclutadores (incluso no técnicos) a conducir entrevistas iniciales profundas y precisas.
- **Criterios de Aceptación:**
    - [x] Crear un servicio que tome el `resumeId` de un candidato y la descripción de cargo asociada a la vacante.
    - [x] Invocar a la IA para estructurar preguntas de entrevista específicas ("Pregúntale sobre su experiencia con Docker en X...") junto con la **respuesta clave esperada** para guiar al entrevistador no técnico.
    - [x] Implementar un botón en la UI del Recruiter para "Descargar Guía de Entrevista en PDF".
- **Rama Git:** `feature/modules-14-15-implementation`

---

## 🔵 TIER 5 — Growth, Retención & Developer Intelligence

> Features de crecimiento orgánico y análisis avanzado. Requieren que el Tier 4 esté completo.

---

## 📈 Módulo 17: Score Progression & Perfil Público

### 🎴 Tarjeta 17.1: Score Progression Analytics

- **Estado:** `[x] Completado`
- **Prioridad:** Alta 🔴 — **Driver principal de retención de usuarios**
- **Descripción:**
  La Tarjeta 10.1 menciona un "gráfico pequeño de progreso histórico" como un bullet point dentro de sus criterios, pero esta feature merece su propia página dedicada. Una vista `/dashboard/progress` que muestre la evolución temporal del ATS score por CV, el número de Job Matches realizados, y los skills que el usuario cerró a lo largo del tiempo. Es el principal motor de retención: el usuario vuelve a la plataforma para verificar si mejoró.
- **Criterios de Aceptación:**
    - [x] Crear la página `src/app/dashboard/progress/page.tsx`.
    - [x] Implementar una query Prisma que recupere el historial de scores de la tabla `Resume` ordenados por `createdAt` para el usuario autenticado.
    - [x] Diseñar un gráfico de área con Recharts mostrando la evolución del `atsScore` a lo largo del tiempo (eje X: fecha, eje Y: score 0-100).
    - [x] Agregar una sección de "Skills Cerrados": listar skills que aparecían como `missingSkills` en el primer Job Match del usuario pero ya no aparecen en el último, a modo de logros tangibles.
    - [x] Agregar métricas secundarias: número total de Job Matches realizados y score promedio de los últimos 5 matches.
    - [x] Agregar el ítem "Progreso" en el sidebar del dashboard con un ícono apropiado de Lucide.
    - [x] Mostrar un estado vacío con CTA ("Subí tu primer CV para empezar a trackear tu progreso") si el usuario no tiene historial aún.
- **Rama Git:** `feature/score-progression-analytics`

### 🎴 Tarjeta 17.2: Perfil Público Compartible (`/u/[username]`)

- **Estado:** `[x] Completado`
- **Prioridad:** Media 🟡 — **Growth loop viral**
- **Descripción:**
  Una URL pública `skillradar.app/u/[username]` que el developer puede compartir con recruiters. Muestra un resumen visual de su perfil: skill radar chart (con los ejes del producto: Frontend, Backend, DevOps, Architecture, Testing), seniority estimado, top skills extraídos y distribución de lenguajes de GitHub. El developer controla qué información es visible mediante toggles en Settings. Este feature crea el principal loop viral: un recruiter que recibe el link cae en la app y se registra. **Nota:** mostrar el skill radar chart en lugar del ATS score crudo para que el contexto sea más claro e interpretable para recruiters no técnicos.
- **Criterios de Aceptación:**
    - [x] Agregar los campos `isPublicProfile: Boolean @default(false)` y `publicUsername: String? @unique` al modelo `User` en Prisma y migrar.
    - [x] Crear la ruta pública `src/app/u/[username]/page.tsx` (sin requerir autenticación para GET).
    - [x] Implementar la query de servidor que cargue solo los datos públicos del perfil: top 10 skills, distribución de lenguajes, seniority label, y fecha de último análisis.
    - [x] Diseñar la UI del perfil público con el skill radar chart (usando Recharts `RadarChart`), badges de skills y score de seniority.
    - [x] Crear en `src/app/dashboard/settings/page.tsx` una sección "Perfil Público" con toggles individuales para cada dato visible (skills, GitHub, seniority).
    - [x] Agregar un botón "Compartir perfil" en el dashboard con copia al portapapeles de la URL pública.
    - [x] Implementar meta tags Open Graph y Twitter Card en la página pública para previews enriquecidos al compartir en LinkedIn o X.
- **Rama Git:** `feature/public-profile-shareable`

### 🎴 Tarjeta 17.3: Badge Embebible para GitHub README

- **Estado:** `[x] Completado`
- **Prioridad:** Baja 🟢 — **Distribución orgánica / Adquisición viral**
- **Descripción:**
  Un endpoint que genera un SVG dinámico con el resumen del perfil SkillRadar del developer, diseñado para ser embebido en el README de GitHub del usuario con una sola línea de Markdown. Al hacer click en el badge, el recruiter llega al perfil público del dev en SkillRadar. El SVG se genera server-side con template literals (sin Canvas, sin React — compatible con el renderer de imágenes de GitHub). Se actualiza automáticamente con los últimos datos del usuario. **Depende de la Tarjeta 17.2** (Perfil Público).
- **Criterios de Aceptación:**
    - [x] Crear the Route Handler `src/app/api/badge/[username]/route.ts` que devuelva `Content-Type: image/svg+xml`.
    - [x] Diseñar el template SVG del badge: nombre, seniority label (ej: "Mid-level Developer"), top 3 skills como píldoras de texto, y logo de SkillRadar. Dimensiones estándar de badge (ej: 540×180px).
    - [x] Configurar `Cache-Control: public, max-age=3600` para que GitHub pueda cachear el SVG sin saturar el endpoint.
    - [x] Mostrar el badge solo si el usuario tiene `isPublicProfile: true`; retornar 404 si el perfil es privado.
    - [x] Agregar en el panel de Perfil Público de Settings la instrucción de cómo embeber el badge, con el snippet de Markdown listo para copiar: `[![SkillRadar](https://skillradar.app/api/badge/[username])](https://skillradar.app/u/[username])`.
- **Rama Git:** `feature/embeddable-badge`

---

## 🧠 Módulo 7: AI Services (parcial — Career Copilot)

### 🎴 Tarjeta 7.2: Implementar Chatbot Flotante (Career Copilot) con useChat

- **Estado:** `[x] Completada` ✅ — `feature/modules-18-7-implementation`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Agregar un widget de chatbot flotante de asistencia interactiva (burbuja de chat) accesible en la esquina inferior del dashboard. El chatbot debe permitir al desarrollador hacer consultas sobre su currículum, consejos de carrera y cómo estudiar para los gaps técnicos detectados.
- **Criterios de Aceptación:**
    - [x] Crear un Route Handler en `/api/chat` usando `streamText` del Vercel AI SDK conectando con el modelo rápido de **Groq** o **Gemini**.
    - [x] Diseñar el widget UI flotante interactivo en `src/components/dashboard/career-copilot.tsx` utilizando Lucide Icons y shadcn/ui.
    - [x] Integrar el hook reactivo `useChat` para gestionar el estado de los mensajes en tiempo real.
    - [x] Cargar de forma automática el CV parseado actual del usuario en las instrucciones del sistema (`system prompt`) para que el Copiloto tenga contexto real del desarrollador al responder.
    - [x] Añadir la burbuja del chat en el layout compartido del dashboard.
- **Rama Git:** `feature/career-copilot-widget`

---

## 🧠 Módulo 18: Developer Intelligence Engine (GitHub Avanzado)

> 💡 Este módulo extiende el análisis de GitHub del Módulo 5 con señales más profundas de seniority técnica, incorporando el concepto de **"Evidence-based Skills"**: validar lo que el dev _demuestra_ que sabe a través de su actividad real de código, no solo lo que declara en el CV.

### 🎴 Tarjeta 18.1: GitHub Schema Extendido con Seniority Signals

- **Estado:** `[x] Completada` ✅ — `feature/modules-18-7-implementation`
- **Descripción:**
  El schema actual de `GithubAnalysis` captura principalmente distribución de bytes por lenguaje. Extenderlo para capturar señales temporales y cualitativas que son mucho más relevantes para estimar seniority: frecuencia de commits, calidad de READMEs, patrones de arquitectura detectados por la IA (presencia de CI/CD, testing, RBAC, auth flows, queue systems, caching, observability tooling). Estas señales son exactamente lo que diferencia a un Senior de un Mid-level en el mundo real.
- **Criterios de Aceptación:**
    - [x] Actualizar el Zod Schema de GitHub en `src/lib/validations/github.ts` agregando los nuevos campos:
        ```typescript
        commitFrequency: z.enum(['daily', 'weekly', 'sporadic', 'inactive']),
        readmeQualityScore: z.number().min(0).max(100),
        longestStreakDays: z.number(),
        topRepoTopics: z.array(z.string()),
        senioritySignals: z.array(z.string()), // evidencia cualitativa detectada por IA
        detectedPatterns: z.object({
          hasCI: z.boolean(),
          hasTesting: z.boolean(),
          hasDocker: z.boolean(),
          hasAuthImplementation: z.boolean(),
          hasCaching: z.boolean(),
          hasObservability: z.boolean(),
        }),
        ```
    - [x] Migrar el modelo `GithubAnalysis` en Prisma para incluir los nuevos campos (o almacenarlos en el JSON de análisis existente).
    - [x] Actualizar el prompt de análisis de GitHub en el servicio para extraer estas señales explícitamente.
    - [x] Actualizar la vista `/dashboard/github` para mostrar el `detectedPatterns` como un checklist visual de señales de madurez técnica.
- **Rama Git:** `feature/github-schema-extended`

### 🎴 Tarjeta 18.2: Modos de Entrevista Avanzados (Pressure & Recruiter Simulation)

- **Estado:** `[x] Completada` ✅ — `feature/modules-18-7-implementation`
- **Descripción:**
  Extender el Mock Interview del Módulo 6 con dos modos adicionales más allá del modo conversacional estándar. El **Pressure Mode** simula presión real de entrevista: el entrevistador de IA interrumpe, hace preguntas con ambigüedad intencional, pone límites de tiempo implícitos y sigue con edge cases. El **Recruiter Simulation Mode** evalúa la claridad comunicacional del dev: cómo estructura sus respuestas, si puede explicar conceptos técnicos a una persona no técnica, y su metodología de debugging. **Depende de la Tarjeta 6.1** (Mock Interview base funcionando).
- **Criterios de Aceptación:**
    - [x] Agregar un selector de modo (`Standard` / `Pressure` / `Recruiter Simulation`) en la pantalla de inicio de la entrevista en `/dashboard/interview`.
    - [x] Implementar variantes del system prompt para cada modo:
        - **Pressure:** interrupciones frecuentes, preguntas de follow-up agresivas, reformulación de la pregunta si la respuesta es vaga.
        - **Recruiter Simulation:** foco en comunicación clara, preguntas del estilo "explicame X como si no supiera programar", evaluación de pensamiento estructurado.
    - [x] Incluir en el **Debrief JSON** final los campos `communicationScore`, `structuredThinkingScore` y `pressureHandlingScore` además de los técnicos.
    - [x] Mostrar en los resultados del Debrief un resumen diferenciado por modo.
- **Rama Git:** `feature/interview-advanced-modes`

---

## ⚪ TIER 6 — Expansión Opcional

> ⚠️ **No ejecutar hasta que M15 esté completo y el core esté estabilizado en producción.** Reestructurar el routing bajo `[locale]/` en medio del desarrollo de módulos core duplica el costo de mantenimiento.

---

## 🎨 Módulo 4: Marketing Landing & UX (parcial — i18n)

### 🎴 Tarjeta 4.3: Implementar Internacionalización (i18n) Nativa con next-intl

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢 — **Ejecutar al final del roadmap**
- **Descripción:**
  Configurar la infraestructura de traducción en el proyecto para dar soporte dinámico a múltiples idiomas (Español/Inglés) sin duplicar código. Utilizaremos la librería estándar `next-intl` aprovechando el enrutamiento dinámico `[locale]` de Next.js App Router para una traducción limpia y mantenible tanto en el servidor como en el cliente.
- **Criterios de Aceptación:**
    - [ ] Instalar la librería `next-intl`.
    - [ ] Configurar los archivos de diccionarios en la raíz (`messages/en.json` y `messages/es.json`) con las traducciones base del shell y la landing.
    - [ ] Reestructurar el enrutamiento envolviendo las páginas del dashboard y marketing bajo la carpeta dinámica `src/app/[locale]/`.
    - [ ] Configurar el enrutamiento y la redirección automática del idioma en el middleware/proxy de la aplicación.
    - [ ] Crear un componente selector de idioma (`LanguageSwitcher` con shadcn/ui) integrado en la barra superior o en el sidebar para alternar entre Español e Inglés con un clic.
- **Rama Git:** `feature/i18n-next-intl-setup`

## 🔔 Módulo 19: Job Board & Postulaciones Internas (Recruiter → Developer)

---

### 🎴 Tarjeta 19.1: Sistema de Notificaciones In-App (Infraestructura Base)

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴 — Bloqueante de todo el Módulo 19
- **Descripción:**
  No existe hoy un mecanismo genérico de notificaciones in-app en la plataforma (el flujo de Doble Ciego de la Tarjeta 12.1 solo carga solicitudes pendientes directamente de ContactRequest, sin un modelo propio). Crear un modelo Notification desacoplado y reutilizable en Prisma, junto con el ícono de campana en el header del dashboard, para soportar los avisos de nuevas ofertas, aplicaciones recibidas y cambios de estado que necesitan las tarjetas 19.5 y 19.6.
- **Criterios de Aceptación:**
    - [x] Crear el modelo `Notification` en `prisma/schema.prisma`: id, userId, type (enum string: `"new_job_match"`, `"new_application"`, `"application_status_changed"`), title, message, link (URL relativa de destino), `read: Boolean @default(false)`, `metadata: Json?`, createdAt. Migrar contra Neon.
    - [x] Crear el helper de servidor `src/lib/notifications.ts` con una función `createNotification()` reutilizable, invocable desde cualquier Server Action del proyecto sin duplicar lógica.
    - [x] Crear el componente `NotificationBell.tsx` (shadcn/ui Popover o DropdownMenu) en el header del dashboard, con contador de no leídas (Badge).
    - [x] Implementar la Server Action `getNotificationsAction` (paginada, ordenada por `createdAt desc`) y `markAsReadAction`.
    - [x] Evaluar polling liviano (useSWR/refetchInterval cada 30-60s) en vez de WebSockets, dado que ya no hay presupuesto de infra adicional (evitar sumar otro servicio tipo Pusher/Ably).
- **Rama Git:** `feature/notification-system-core`

---

### 🎴 Tarjeta 19.2: Modelo de Datos y Backend de Ofertas Laborales (JobPosting)

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Crear el modelo de datos y las Server Actions de backend que permitan a un recruiter crear, editar, publicar/despublicar y eliminar ofertas laborales internas dentro de la plataforma. Es la base de datos sobre la que se apoyan el Job Board del developer (19.3) y el flujo de aplicación (19.4).
- **Criterios de Aceptación:**
    - [x] Crear el modelo `JobPosting` en Prisma: id, recruiterId, title, company, location, `remoteType ("remote" | "hybrid" | "onsite")`, description (Text), `requiredSkills: Json` (array de strings), seniorityLevel, `status ("draft" | "published" | "closed")`, createdAt, updatedAt. Relacionar con User (recruiterId).
    - [x] Implementar las Server Actions `createJobPostingAction`, `updateJobPostingAction`, `publishJobPostingAction` and `closeJobPostingAction`, validando en cada una que `session.user.role === "recruiter"`.
    - [x] Validar el payload con Zod (title, description y company obligatorios; requiredSkills como array no vacío).
    - [x] **Seguridad (Sanitización XSS):** Sanitizar description y title antes de persistir, siguiendo el mismo patrón aplicado en la Tarjeta 12.1 para el mensaje de ContactRequest.
    - [x] Aplicar el rate limiter de Upstash sobre `createJobPostingAction` (ej: máximo 10 ofertas nuevas por recruiter por día) para prevenir spam de postings.
- **Rama Git:** `feature/job-posting-backend`

---

### 🎴 Tarjeta 19.3: UI del Recruiter — Publicar y Gestionar Ofertas

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Interfaz del lado del recruiter para crear ofertas mediante un formulario estructurado y administrar el ciclo de vida de las publicaciones activas (a diferencia del Reverse Matching de la 11.1, que trabaja con JD pegada como texto libre y no persiste una oferta reutilizable).
- **Criterios de Aceptación:**
    - [x] Crear la ruta `/dashboard/recruiter/postings` con un formulario (shadcn/ui Form + react-hook-form + Zod) para los campos de JobPosting.
    - [x] Diseñar un selector de skills requeridos tipo tags/combobox (reutilizar el catálogo de skills ya usado en el parsing de CV si existe, para mantener consistencia de vocabulario con el matching).
    - [x] Crear la vista "Mis Ofertas" listando las publicaciones del recruiter con su status (badge de color) y contador de aplicaciones recibidas por oferta.
    - [x] Habilitar acciones inline: Editar, Publicar/Despublicar, Cerrar oferta.
    - [x] Mostrar toast de confirmación (sonner) en cada acción, siguiendo el patrón de la Tarjeta 4.2.
- **Rama Git:** `feature/recruiter-posting-management-ui`

---

### 🎴 Tarjeta 19.4: Job Board — Listado de Ofertas para el Developer

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Vista pública del lado del developer donde puede explorar las ofertas publicadas (`status === "published"`) por los recruiters. Reutilizar el motor de IA de matching (7.1 / 3.2) para mostrar un % de afinidad entre el CV activo del dev y cada oferta, en lugar de una lista plana sin contexto.
- **Criterios de Aceptación:**
    - [x] Crear la ruta `/dashboard/jobs` con el listado de ofertas publicadas, paginado o con scroll infinito.
    - [x] Agregar filtros por `remoteType`, `seniorityLevel` y búsqueda por texto en title/company.
    - [x] Calcular y mostrar un `matchScore` estimado por oferta contra el Resume activo del dev (reutilizando el servicio de IA de Job Match de la Tarjeta 3.2, sin duplicar el prompt).
    - [x] Cachear el cálculo de matchScore por par (resumeId, jobPostingId) para no re-invocar la IA en cada render de la lista (ej: tabla intermedia o columna calculada persistida al momento del cálculo).
    - [x] Diseñar la tarjeta de oferta (`JobPostingCard`) mostrando: empresa, título, ubicación/remote, skills requeridos como píldoras, y el badge de matchScore.
- **Rama Git:** `feature/developer-job-board`

---

### 🎴 Tarjeta 19.5: Flujo de Postulación del Developer (Apply) + Notificación al Recruiter

- **Estado:** `[x] Completada`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Permitir que el developer aplique formalmente a una oferta desde el Job Board. Cada aplicación dispara una notificación al recruiter dueño de la oferta (usando la infraestructura de la Tarjeta 19.1) y opcionalmente sincroniza con el Job Tracker personal del dev (Módulo 14) para centralizar su búsqueda laboral en un solo lugar.
- **Criterios de Aceptación:**
    - [x] Crear el modelo `JobPostingApplication` en Prisma: id, jobPostingId, developerId, resumeId?, `status ("submitted" | "reviewed" | "rejected" | "shortlisted")`, createdAt. Constraint `@@unique([jobPostingId, developerId])` para evitar doble postulación.
    - [x] Implementar la Server Action `applyToJobPostingAction` que valide el rol `"developer"`, cree la fila y adjunte opcionalmente el resumeId seleccionado.
    - [x] Al aplicar, invocar `createNotification()` (Tarjeta 19.1) generando una notificación `"new_application"` para el recruiterId de la oferta, con link directo al detalle de la aplicación.
    - [x] Bonus / integración: al aplicar, crear automáticamente una card en JobApplication (Módulo 14, columna `"applied"`) para que la postulación interna aparezca también en el Kanban personal del dev.
    - [x] Deshabilitar visualmente el botón "Aplicar" si ya existe una JobPostingApplication previa para ese par oferta/developer.
- **Rama Git:** `feature/job-posting-apply-flow`

---

### 🎴 Tarjeta 19.6: Panel de Aplicaciones del Recruiter + Notificaciones de Matching para el Developer

- **Estado:** `[x] Completada`
- **Prioridad:** Media 🟡
- **Descripción:**
  Cerrar el loop del módulo: el recruiter necesita ver y gestionar (cambiar estado de) las aplicaciones recibidas por oferta, y el developer debe recibir una notificación proactiva cuando el estado de su aplicación cambia, o cuando se publica una oferta nueva cuyos requiredSkills matchean fuertemente con su perfil.
- **Criterios de Aceptación:**
    - [x] Crear la vista `/dashboard/recruiter/postings/[id]/applications` listando los JobPostingApplication de esa oferta, ordenados por matchScore descendente (reutilizando el cálculo de la 19.4).
    - [x] Implementar la Server Action `updateApplicationStatusAction` que dispare `createNotification()` tipo `"application_status_changed"` hacia el developer afectado.
    - [x] Implementar un job/trigger que, al publicarse una nueva oferta (Tarjeta 19.2), calcule el match contra los Resume más recientes del pool y notifique con `"new_job_match"` a los developers cuyo matchScore supere un umbral (ej: ≥ 75%), evitando espamear con matches irrelevantes.
    - [x] Permitir al recruiter, desde esa vista, abrir directamente el flujo de Doble Ciego (Tarjeta 12.1) sobre un candidato aplicado, en lugar de duplicar la lógica de revelado de contacto.
- **Rama Git:** `feature/recruiter-applications-panel`

---

## 🛡️ Módulo 20: Seguridad & Hardening de Producción (extensión sobre M19)

---

### 🎴 Tarjeta 20.1: Auditoría IDOR sobre el Job Board (JobPosting / JobPostingApplication)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴 — Bloqueante antes de exponer M19 en producción
- **Descripción:**
  Las Server Actions del Módulo 19 (19.5, 19.6) no especificaron control explícito de propiedad de recursos. Sin esta verificación, un developer autenticado podría, manipulando IDs en el cliente, leer aplicaciones de otros developers, y un recruiter podría ver o modificar aplicaciones de ofertas que no le pertenecen — el mismo patrón de riesgo IDOR ya mitigado en ContactRequest (12.1) pero no replicado acá.
- **Criterios de Aceptación:**
    - [ ] Auditar `applyToJobPostingAction`, `updateApplicationStatusAction` y la query de `/dashboard/recruiter/postings/[id]/applications`: verificar en cada una que `session.user.id` coincida con el recruiterId de la oferta (o developerId de la aplicación) antes de retornar/mutar datos.
    - [ ] Escribir tests de integración (Vitest) que simulen a un recruiter A intentando acceder a las aplicaciones de una oferta del recruiter B y verifiquen respuesta 403/null, replicando la metodología de la Tarjeta 7.3.
    - [ ] Aplicar el mismo criterio de DTOs server-only usado en 12.1: la query de listado de aplicaciones para el recruiter no debe incluir campos sensibles del developer si el estado del ContactRequest asociado no es `"accepted"`.
    - [ ] Revisar que `getNotificationsAction` (19.1) filtre estrictamente por userId de la sesión y no acepte un userId como parámetro del cliente.
- **Rama Git:** `feature/idor-audit-job-board`

---

### 🎴 Tarjeta 20.2: Rate Limiting & Prevención de Abuso sobre M19

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Extender la infraestructura de Upstash (16.1) a las nuevas Server Actions de aplicación y publicación de ofertas, hoy sin ningún límite. Sin esto, un bot puede aplicar a todas las ofertas del pool en segundos o floodear el board con JobPosting falsos.
- **Criterios de Aceptación:**
    - [ ] Aplicar el Ratelimit de `src/lib/rate-limit.ts` sobre `applyToJobPostingAction` (ej: máximo 20 postulaciones por developer por día).
    - [ ] Aplicar límite sobre `createJobPostingAction` ya contemplado en 19.2, verificar que efectivamente esté cableado y no solo documentado.
    - [ ] Aplicar límite sobre el trigger de cálculo de matchScore masivo de la Tarjeta 19.6 (notificación de nuevas ofertas), para no disparar N llamadas a la IA sin control cuando el pool de developers crece.
    - [ ] Loggear (sin PII) los intentos bloqueados por rate limit para poder distinguir abuso real de falsos positivos.
- **Rama Git:** `feature/rate-limiting-job-board`

---

### 🎴 Tarjeta 20.3: Sistema de Reporte y Moderación de Contenido

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Ni JobPosting ni el pitch de ContactRequest tienen forma de ser reportados. Agregar un mecanismo simple para que developers marquen ofertas sospechosas/spam y recruiters marquen mensajes de contacto inapropiados, con un flag que oculte el contenido mientras se revisa (soft-moderation, sin necesidad todavía de un panel admin completo — eso es la Tarjeta 22.3).
- **Criterios de Aceptación:**
    - [ ] Crear el modelo `ContentReport` en Prisma: id, reporterId, `targetType ("job_posting" | "contact_request")`, targetId, reason, `status ("pending" | "reviewed" | "dismissed")`, createdAt.
    - [ ] Agregar el botón "Reportar" en `JobPostingCard` (19.4) y en la vista de solicitudes de contacto recibidas (12.1).
    - [ ] Implementar `createReportAction` con Zod validation y rate limit (máx. 5 reportes por usuario por día para evitar abuso del propio sistema de reporte).
    - [ ] Ocultar automáticamente un JobPosting del Job Board (sin borrarlo) si acumula 3+ reportes de usuarios distintos, dejándolo en estado `status: "under_review"`.
- **Rama Git:** `feature/content-reporting-system`

---

### 🎴 Tarjeta 20.4: Expiración Automática de Ofertas Laborales

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  JobPosting (19.2) no tiene fecha de expiración. Sin esto, el Job Board acumula ofertas viejas para siempre, degradando la calidad del matching de la Tarjeta 19.4 con el tiempo.
- **Criterios de Aceptación:**
    - [ ] Agregar el campo `expiresAt: DateTime?` al modelo JobPosting, default de 30 días desde `createdAt` al publicar.
    - [ ] Crear un Vercel Cron Job (`vercel.json` con `crons`) que corra diariamente y actualice a `status: "closed"` toda oferta con `expiresAt < now()`.
    - [ ] Mostrar en la UI del recruiter (19.3) el tiempo restante antes de la expiración y un botón "Extender 30 días más".
    - [ ] Excluir explícitamente las ofertas `"closed"` de la query de matching (19.4/19.6) para que no se sigan notificando ni sumando en el conteo de aplicaciones activas.
- **Rama Git:** `feature/job-posting-expiration-cron`

---

## 📜 Módulo 21: Compliance, Cuenta & Comunicación

---

### 🎴 Tarjeta 21.1: Eliminación de Cuenta y Exportación de Datos (Derecho al Olvido)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴 — Requisito de manejo responsable de PII
- **Descripción:**
  La plataforma almacena PII sensible (CVs, texto de currículum, contacto de developers revelado vía Doble Ciego, tokens de GitHub cifrados). No existe hoy ninguna vía para que un usuario borre su cuenta o exporte sus datos, lo cual es tanto una buena práctica de producto como un requisito de cumplimiento tipo GDPR/derecho al olvido.
- **Criterios de Aceptación:**
    - [ ] Crear la Server Action `deleteAccountAction` en `/dashboard/settings` que elimine en cascada (aprovechando `onDelete: Cascade` ya definido en el schema) todos los registros del User: Resume, JobMatch, GithubAnalysis, InterviewSession, ContactRequest, Shortlist, JobApplication, JobPosting, JobPostingApplication, Notification.
    - [ ] Requerir confirmación explícita (modal con texto tipo "escribí ELIMINAR para confirmar") para prevenir borrados accidentales.
    - [ ] Implementar `exportUserDataAction` que compile un JSON con todos los datos personales del usuario y lo entregue como descarga directa (sin pasar por storage intermedio para minimizar superficie de exposición).
    - [ ] Invalidar la sesión de Auth.js v5 inmediatamente después del borrado exitoso y redirigir a la landing.
- **Rama Git:** `feature/account-deletion-gdpr`

---

### 🎴 Tarjeta 21.2: Notificaciones Críticas por Email (Digest con Resend)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  El sistema de notificaciones de la Tarjeta 19.1 es exclusivamente in-app. Resend ya está integrado en el proyecto (usado en recuperación de contraseña, 8.2), por lo que conviene reutilizarlo para avisar por correo los eventos que realmente importan, sin depender de que el usuario tenga la app abierta.
- **Criterios de Aceptación:**
    - [ ] Extender `createNotification()` (19.1) para que, según el `type`, dispare opcionalmente un email vía Resend usando templates simples de React Email.
    - [ ] Definir qué eventos son "críticos" para email inmediato (`new_application` para el recruiter, `application_status_changed` para el dev) vs. cuáles quedan solo in-app (`new_job_match`, para no saturar la bandeja).
    - [ ] Agregar en `/dashboard/settings` una sección "Preferencias de Notificación" con toggles por tipo de evento y un opt-out general.
    - [ ] Respetar el opt-out en `createNotification()` antes de invocar el envío de correo (chequeo server-side, no solo en el frontend).
- **Rama Git:** `feature/email-notification-digest`

---

### 🎴 Tarjeta 21.3: Páginas Legales — Términos de Servicio y Política de Privacidad

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Con PII de terceros circulando entre developers y recruiters (incluyendo revelado de contacto real vía Doble Ciego), la plataforma necesita páginas legales básicas que dejen claro qué datos se recolectan, cómo se usan y qué responsabilidad tiene cada rol de usuario al usar la información obtenida de otro.
- **Criterios de Aceptación:**
    - [ ] Crear las rutas estáticas `/legal/terms` y `/legal/privacy` con contenido base (puede redactarse con ayuda de IA pero debe revisarse manualmente, no es contenido a automatizar sin revisión humana).
    - [ ] Agregar checkbox de aceptación de Términos en el flujo de registro (`/login`, Tarjeta 8.2), bloqueando el submit si no está marcado.
    - [ ] Linkear ambas páginas en el footer de la landing (4.1) y en `/dashboard/settings`.
    - [ ] Documentar explícitamente en la Política de Privacidad el uso de API keys de terceros (Gemini/Groq/OpenRouter/OpenAI/Anthropic) cuando el usuario configura las propias (7.1), aclarando que esos proveedores procesan el contenido enviado.
- **Rama Git:** `feature/legal-pages`

---

### 🎴 Tarjeta 21.4: Retiro de Postulación (Withdraw Application)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢
- **Descripción:**
  La Tarjeta 19.5 permite aplicar a una oferta pero no da al developer forma de retractarse. Completar el ciclo de vida de JobPostingApplication con la acción inversa.
- **Criterios de Aceptación:**
    - [ ] Agregar el estado `"withdrawn"` al enum de status de JobPostingApplication.
    - [ ] Implementar `withdrawApplicationAction`, validando que el developerId coincida con la sesión activa (reforzando el patrón de la Tarjeta 20.1).
    - [ ] Ocultar la aplicación retirada de la vista del recruiter (19.6) sin borrar el registro (preservar el historial para métricas).
    - [ ] Habilitar nuevamente el botón "Aplicar" en el Job Board (19.4) si la aplicación previa fue retirada.
- **Rama Git:** `feature/withdraw-application`

---

## 📊 Módulo 22: Calidad, Testing & Observabilidad de Producto

---

### 🎴 Tarjeta 22.1: Suite E2E con Playwright sobre Flujos Críticos

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴 — Único módulo con testing hoy es la Tarjeta 7.3 (crypto)
- **Descripción:**
  Con 19+ módulos interdependientes (ej: aplicar a una oferta dispara notificación Y crea card en el Kanban personal), una regresión manual ya no es viable. Instrumentar tests end-to-end sobre los flujos de negocio que más rompen si fallan silenciosamente.
- **Criterios de Aceptación:**
    - [ ] Instalar y configurar `@playwright/test` con un usuario de demo (reutilizando el modo Guest de la Tarjeta 9.0 para no depender de mocks de auth reales).
    - [ ] Cubrir el flujo Developer: login demo → upload CV → job match → ver resultado con score.
    - [ ] Cubrir el flujo Recruiter: login demo → crear JobPosting → publicar → ver en Job Board como developer → aplicar → recruiter ve la aplicación notificada.
    - [ ] Integrar la corrida de Playwright como step en el pipeline de CI de GitHub Actions ya existente (el mismo que corre claude-review), fallando el PR si algún flujo crítico se rompe.
- **Rama Git:** `feature/e2e-testing-playwright`

---

### 🎴 Tarjeta 22.2: Instrumentación de Analítica de Producto

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Ningún módulo mide si las features de growth (17.2 Perfil Público, 17.3 Badge, el loop viral) realmente están funcionando. Sin datos, las decisiones de roadmap futuras (incluyendo priorizar features nuevas) son a ciegas.
- **Criterios de Aceptación:**
    - [ ] Integrar Vercel Analytics o PostHog (evaluar cuál respeta mejor el presupuesto de free tier ya que el resto del proyecto está optimizado por costo, 7.1).
    - [ ] Instrumentar eventos clave: `cv_uploaded`, `job_match_completed`, `public_profile_viewed`, `contact_request_sent`, `job_posting_applied`.
    - [ ] Crear un dashboard simple (interno, no visible al usuario final) que muestre conversión del funnel: registro → CV subido → primer match → primer contacto/aplicación.
    - [ ] Asegurar que no se trackee PII en los eventos (solo IDs anonimizados, nunca email/nombre en el payload de analytics).
- **Rama Git:** `feature/product-analytics`

---

### 🎴 Tarjeta 22.3: Rol Admin y Panel de Moderación

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  `User.role` hoy solo soporta `"developer"` | `"recruiter"`. No existe forma de banear una cuenta abusiva ni de revisar los ContentReport generados en la Tarjeta 20.3 más allá del auto-ocultamiento automático.
- **Criterios de Aceptación:**
    - [ ] Extender `role` para soportar `"admin"` (verificar en auth.ts que no rompa la lógica existente de gating por rol en Server Actions).
    - [ ] Crear la ruta protegida `/dashboard/admin` (middleware que rechace con 404 si `role !== "admin"`, no solo un redirect, para no filtrar la existencia de la ruta).
    - [ ] Listar los ContentReport pendientes con acciones "Descartar" / "Suspender cuenta reportada" (`User.isSuspended: Boolean`).
    - [ ] Bloquear login y todas las Server Actions de escritura para usuarios con `isSuspended: true`, mostrando un mensaje claro en el intento de login.
- **Rama Git:** `feature/admin-moderation-panel`

---

### 🎴 Tarjeta 22.4: Gestión de Versiones de Resume

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢
- **Descripción:**
  El flujo actual permite subir y analizar CVs (Módulo 2) pero no hay una vista dedicada para administrar el historial: el usuario no puede ver todas sus versiones subidas ni borrar las obsoletas, acumulando registros de Resume sin control con el tiempo.
- **Criterios de Aceptación:**
    - [ ] Crear la sección "Mis CVs" en `/dashboard/settings` o como ruta propia, listando todos los Resume del usuario ordenados por fecha con su `atsScore`.
    - [ ] Marcar visualmente cuál es el "CV activo" (el usado por default en Job Match, Tarjeta 10.2).
    - [ ] Implementar `deleteResumeAction`, verificando ownership (userId) y advirtiendo si el CV a borrar tiene JobMatch o InterviewSession asociados (borrado en cascada ya definido en el schema, pero avisar antes de perder ese historial).
    - [ ] Permitir marcar un Resume distinto como activo sin tener que resubir el archivo.
- **Rama Git:** `feature/resume-version-management`
