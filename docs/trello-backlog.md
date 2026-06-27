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
| 27  | 12.2    | M12    | Smart Shortlist                             | Recruiter     |
| 28  | 12.3    | M12    | Market Intelligence Heatmaps                | Recruiter     |
| 29  | 13.1    | M13    | AI Resume Builder                           | Recruiter     |
| 30  | 13.2    | M13    | Impact Verb Analyzer                        | Recruiter     |
| 31  | 13.3    | M13    | LinkedIn Profile Audit                      | Recruiter     |
| 32  | 14.1    | M14    | Job Tracker Kanban                          | Recruiter     |
| 33  | 14.2    | M14    | Smart Pitch / Cover Letter                  | Recruiter     |
| 34  | 15.1    | M15    | Observaciones Técnicas                      | Recruiter     |
| 35  | 15.2    | M15    | Generador de Preguntas de Entrevista        | Recruiter     |
| 36  | 17.1    | M17    | Score Progression Analytics                 | Growth        |
| 37  | 17.2    | M17    | Perfil Público Compartible                  | Growth        |
| 38  | 17.3    | M17    | Badge Embebible para GitHub README          | Growth        |
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

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Instalar y configurar `next-themes` para dar soporte dinámico de color en el frontend y añadir un selector visual de temas en la barra superior del dashboard.
- **Criterios de Aceptación:**
    - [ ] Instalar la librería `next-themes` en el proyecto.
    - [ ] Configurar el provider de temas en `src/app/layout.tsx`.
    - [ ] Crear un componente selector `ThemeToggle` usando shadcn/ui.
    - [ ] Comprobar que los estilos de Tailwind CSS v4 respondan adecuadamente al cambiar de modo en todas las vistas principales.
- **Rama Git:** `feature/theme-switcher-implementation`

---

## 🟢 TIER 4 — Plataforma Recruiter

> El lado B2B del producto. Requiere que el Tier 2 (Core MVP) esté completo y en producción. La cadena de dependencias es: M11 → M12 → M15.

---

## 🔍 Módulo 11: Recruiter Reverse Matching & Explainability

### 🎴 Tarjeta 11.1: Reverse Job-Matching (Recruiter)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  El recruiter pega una JD y la IA rankea a todo el Talent Pool anónimo mostrando un % de match y una justificación breve para cada desarrollador.
- **Criterios de Aceptación:**
    - [ ] Crear la interfaz del Recruiter con un campo de texto para pegar la Job Description (JD).
    - [ ] Implementar una Server Action que consulte todos los perfiles de desarrolladores activos en la base de datos Postgres (de forma anónima).
    - [ ] Procesar con la IA la JD en comparación con los perfiles del pool de talento y devolver un listado ordenado por el porcentaje de encaje.
    - [ ] Renderizar una lista interactiva de candidatos ordenada por afinidad con información oculta (Doble Ciego) mostrando solo el matching % y el extracto de encaje.
- **Rama Git:** `feature/recruiter-reverse-matching`

### 🎴 Tarjeta 11.2: Skill Gap Action Plan & Upskilling Roadmap

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Después de un Job Match, si se detectan gaps, generar un mini-roadmap de 3 pasos de recursos para que el dev sepa cómo cubrirlos.
- **Criterios de Aceptación:**
    - [ ] En el JSON retornado por la IA en el análisis de Job Match, inyectar un array estructurado de "Action Steps" para las habilidades faltantes (missingSkills).
    - [ ] Generar para cada brecha un consejo práctico de estudio (ej: proyectos sugeridos, documentación oficial, conceptos clave a aprender).
    - [ ] Renderizar de forma visual e interactiva este plan en una sección del dashboard llamada "Tu Ruta de Crecimiento" o "Action Plan".
- **Rama Git:** `feature/skill-gap-roadmap`

### 🎴 Tarjeta 11.3: Explainability Layer (Capa de Explicabilidad)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  En la UI, cada vez que haya un Score (ATS o Match), incluir un botón/tooltip que desglose el razonamiento de la IA (Fortalezas detectadas, Evidencia faltante).
- **Criterios de Aceptación:**
    - [ ] Crear un componente reutilizable de tipo Modal/Drawer de shadcn/ui llamado `ExplainabilityPanel`.
    - [ ] Configurar el prompt del parser para extraer el razonamiento cualitativo de la IA detrás de los scores otorgados.
    - [ ] Habilitar un botón interactivo (ej: icono de ojo o "Ver Razonamiento") junto a cada puntaje que abra este panel con las justificaciones, la evidencia encontrada y los puntos débiles detectados de forma clara.
    - [ ] Implementar una política de seguridad estricta para las claves de API (OpenAI/Gemini/Anthropic): todas las llamadas se realizarán únicamente desde Server Actions, utilizando variables de entorno en Vercel con encriptación en reposo y sin exponer jamás las claves al lado cliente.
- **Rama Git:** `feature/explainability-layer`

---

## 🕶️ Módulo 12: Doble Ciego & Sourcing Avanzado

### 🎴 Tarjeta 12.1: Opt-In de Doble Ciego (Contact Request Flow)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Implementar el flujo asíncrono y seguro donde el reclutador pulsa "Solicitar Contacto" (enviando un "Pitch" anónimo) sobre un perfil del Talent Pool. El desarrollador recibe la propuesta anónima en su dashboard y puede aceptarla (revelando sus datos personales de contacto) o declinarla de forma silenciosa.
- **Criterios de Aceptación:**
    - [ ] Diseñar el formulario en la vista de reclutador para ingresar el mensaje/pitch de contacto.
    - [ ] Implementar la Server Action `createContactRequestAction` que valide el rol `"recruiter"` y cree la fila en la tabla `ContactRequest` con estado `"pending"`.
    - [ ] **Seguridad (Sanitización XSS):** Validar y sanitizar el texto del mensaje/pitch del reclutador en la Server Action para impedir inyecciones de código malicioso antes de guardarlo en la base de datos y antes de renderizarlo en el panel del desarrollador.
    - [ ] Crear la vista de "Peticiones de Contacto Recibidas" en el dashboard del Desarrollador (`/dashboard/requests` o sección de notificaciones) cargando las solicitudes donde `developerId === currentUser.id`.
    - [ ] Implementar las Server Actions `acceptContactRequestAction` (cambia el estado a `"accepted"`) y `declineContactRequestAction` (cambia el estado a `"declined"`).
    - [ ] Configurar el control de privacidad estricto del lado del servidor (Server-Only DTOs): si el estado no es `"accepted"`, la Server Action o API del Recruiter omite por completo los campos `name`, `email`, `githubUsername` e `image` en la consulta de base de datos. De esta forma, el payload JSON jamás viaja al navegador si el contacto está pendiente.
- **Rama Git:** `feature/double-blind-contact`

### 🎴 Tarjeta 12.2: Smart Shortlist y Alertas de Recruiter

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢
- **Descripción:**
  El recruiter puede guardar búsquedas y marcar perfiles en shortlists. Notificaciones automáticas cuando un nuevo dev entra al pool y matchea su búsqueda guardada.
- **Criterios de Aceptación:**
    - [ ] Crear el modelo `Shortlist` en Prisma relacionado con el `User` (Recruiter) y los `User` (Developer) agregados.
    - [ ] Implementar un botón "Guardar en Favoritos/Shortlist" en la vista del Recruiter.
    - [ ] Crear una sección "Mis Candidatos Guardados" en el panel del Recruiter para visualizar de forma centralizada sus perfiles seleccionados.
- **Rama Git:** `feature/recruiter-saved-searches`

### 🎴 Tarjeta 12.3: Market Intelligence (Pool Heatmaps)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Dashboard de estadísticas para el recruiter. Mostrar mapas de calor con los skills más escasos vs más abundantes del talent pool.
- **Criterios de Aceptación:**
    - [ ] Crear un servicio de agregación en Prisma que recopile y agrupe por frecuencia todas las habilidades técnicas (`skills`) almacenadas en los currículums del Talent Pool.
    - [ ] Integrar un gráfico de tipo Treemap, Nube de Palabras o Barras Horizontales con Recharts en la sección de Recruiter.
    - [ ] Mostrar visualmente los "Skills Más Demandados vs. Más Abundantes" para dar una perspectiva del mercado de candidatos al reclutador.
- **Rama Git:** `feature/recruiter-market-intelligence`

---

## 📝 Módulo 13: Perfil Público y Resume Builder Interactivo

### 🎴 Tarjeta 13.1: AI Resume Builder (Editor en Vivo)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Permitir al usuario no solo analizar un PDF, sino editar y construir su CV directamente en la plataforma. La interfaz debe permitir crear secciones (Experiencia, Educación, Skills) y aplicar las sugerencias de la IA en tiempo real antes de exportar el PDF optimizado.
- **Criterios de Aceptación:**
    - [ ] Diseñar una interfaz interactiva de edición por secciones (Formularios y campos enriquecidos de texto).
    - [ ] Conectar la IA para que evalúe y sugiera mejoras de redacción mientras el usuario escribe en los campos de experiencia.
    - [ ] Implementar un generador de PDF del lado del servidor (usando una librería liviana como `@react-pdf/renderer` o un flujo similar) para permitir la descarga directa del currículum en formato compatible con ATS.
- **Rama Git:** `feature/resume-builder-ui`

### 🎴 Tarjeta 13.2: Impact Verb Analyzer (Analizador de Impacto)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Integrar una evaluación específica en el parsing del CV que detecte la calidad de los verbos utilizados en las viñetas de experiencia. Promover el uso de lenguaje de impacto ("Arquitecté", "Optimizé") frente a lenguaje pasivo ("Ayudé a", "Fui parte de"), dando un "Action Score".
- **Criterios de Aceptación:**
    - [ ] Definir una lista de control semántica o prompt específico para que la IA escanee la redacción de las responsabilidades del CV.
    - [ ] Clasificar el uso de verbos pasivos y sugerir alternativas activas y orientadas a resultados.
    - [ ] Renderizar un "Impact Score" y una lista de "Antes / Después" con ejemplos de cómo reescribir sus viñetas.
- **Rama Git:** `feature/impact-verb-analyzer`

### 🎴 Tarjeta 13.3: Auditoría de Perfil de LinkedIn con IA

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Implementar una auditoría SEO para el perfil de LinkedIn del usuario libre de riesgos legales y sin costos de APIs de scraping externas. El sistema permitirá al usuario pegar directamente su extracto/experiencia o subir el PDF generado por su perfil de LinkedIn (`Ctrl + P` -> Guardar como PDF), reutilizando la infraestructura de parseo. La IA analizará el Titular, la sección 'Acerca de' y la densidad de palabras clave para optimizar su posicionamiento.
- **Criterios de Aceptación:**
    - [ ] Crear una interfaz que permita subir el perfil de LinkedIn exportado en PDF o pegar directamente el texto copiado de su perfil.
    - [ ] Integrar el lector de PDFs del Módulo 2 para extraer el texto estructurado del PDF de LinkedIn.
    - [ ] Configurar un prompt especializado en posicionamiento orgánico en búsquedas de reclutadores de LinkedIn (SEO técnico).
    - [ ] Retornar y mostrar una calificación del perfil con consejos específicos de mejora para el titular, el "Acerca de" y la descripción de responsabilidades.
- **Rama Git:** `feature/linkedin-profile-audit`

---

## 🗂️ Módulo 14: Job Tracker & Smart Pitch (Gestión de Búsqueda)

### 🎴 Tarjeta 14.1: Job Tracker (Kanban Board)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Crear un CRM personal para el desarrollador con vista Kanban (To Apply, Applied, Interviewing, Offer). Permitirle arrastrar las ofertas laborales que le interesan y centralizar el estado de su búsqueda de empleo dentro de SkillRadar.
- **Criterios de Aceptación:**
    - [ ] Crear el modelo `JobApplication` en Prisma para almacenar las postulaciones creadas por el usuario, asociando el cargo, la empresa, la URL de la oferta y su columna/estado.
    - [ ] Implementar un tablero Kanban visual utilizando la librería `@hello-pangea/dnd` o un sistema de drag-and-drop nativo de React compatible con Server Actions.
    - [ ] Sincronizar instantáneamente en la base de datos de Neon el cambio de estado cuando una tarjeta se arrastra a otra columna.
- **Rama Git:** `feature/job-tracker-kanban`

### 🎴 Tarjeta 14.2: Smart Pitch / Auto-Cover Letter

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴
- **Descripción:**
  A partir del Job Match, generar automáticamente un "Pitch de Valor" estructurado. El mensaje debe tener un tono humilde y profesional enfocado en: 1) Cómo el dev agrega valor inmediato a la empresa y 2) Reconocimiento honesto de sus brechas (gaps) y su plan de acción para resolverlas.
- **Criterios de Aceptación:**
    - [ ] Implementar una Server Action que combine los datos de `Resume` y la oferta de `JobMatch` procesados.
    - [ ] Consumir la IA para redactar un pitch de contacto en primera persona con un tono profesional, honesto y empático (máximo 3 párrafos).
    - [ ] Habilitar un botón "Copiar al Portapapeles" e integrar una sección de edición manual para que el dev pueda hacer pequeños ajustes antes de enviarlo.
- **Rama Git:** `feature/smart-pitch-generator`

---

## 🤝 Módulo 15: Recruiter Empowerment & AI Copilot

### 🎴 Tarjeta 15.1: Observaciones Técnicas Estructuradas (Áreas de Oportunidad)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Durante el Reverse Job-Matching, reemplazar el concepto punitivo de "Red Flags" por "Observaciones Técnicas". La IA detectará inconsistencias de carrera o brechas en el stack y las presentará al reclutador de manera constructiva como puntos a investigar.
- **Criterios de Aceptación:**
    - [ ] Configurar el prompt del servicio B2B para que categorice los puntos de cuidado en "Puntos a verificar" o "Áreas de exploración técnica" en lugar de "Red Flags".
    - [ ] Retornar y renderizar estas observaciones en una lista de tipo acordeón en el perfil anónimo que ve el reclutador.
    - [ ] Asegurarse de que el lenguaje de la IA sea 100% descriptivo, analítico y libre de juicios de valor destructivos.
- **Rama Git:** `feature/technical-observations`

### 🎴 Tarjeta 15.2: Generador de Preguntas de Entrevista Asistidas

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Cuando un reclutador selecciona a un candidato de la Shortlist, la IA debe generar un PDF o panel con 3-5 preguntas técnicas altamente específicas basadas en las debilidades o tecnologías clave del desarrollador. Esto empodera a reclutadores (incluso no técnicos) a conducir entrevistas iniciales profundas y precisas.
- **Criterios de Aceptación:**
    - [ ] Crear un servicio que tome el `resumeId` de un candidato y la descripción de cargo asociada a la vacante.
    - [ ] Invocar a la IA para estructurar preguntas de entrevista específicas ("Pregúntale sobre su experiencia con Docker en X...") junto con la **respuesta clave esperada** para guiar al entrevistador no técnico.
    - [ ] Implementar un botón en la UI del Recruiter para "Descargar Guía de Entrevista en PDF".
- **Rama Git:** `feature/recruiter-interview-questions`

---

## 🔵 TIER 5 — Growth, Retención & Developer Intelligence

> Features de crecimiento orgánico y análisis avanzado. Requieren que el Tier 4 esté completo.

---

## 📈 Módulo 17: Score Progression & Perfil Público

### 🎴 Tarjeta 17.1: Score Progression Analytics

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴 — **Driver principal de retención de usuarios**
- **Descripción:**
  La Tarjeta 10.1 menciona un "gráfico pequeño de progreso histórico" como un bullet point dentro de sus criterios, pero esta feature merece su propia página dedicada. Una vista `/dashboard/progress` que muestre la evolución temporal del ATS score por CV, el número de Job Matches realizados, y los skills que el usuario cerró a lo largo del tiempo. Es el principal motor de retención: el usuario vuelve a la plataforma para verificar si mejoró.
- **Criterios de Aceptación:**
    - [ ] Crear la página `src/app/dashboard/progress/page.tsx`.
    - [ ] Implementar una query Prisma que recupere el historial de scores de la tabla `Resume` ordenados por `createdAt` para el usuario autenticado.
    - [ ] Diseñar un gráfico de área con Recharts mostrando la evolución del `atsScore` a lo largo del tiempo (eje X: fecha, eje Y: score 0-100).
    - [ ] Agregar una sección de "Skills Cerrados": listar skills que aparecían como `missingSkills` en el primer Job Match del usuario pero ya no aparecen en el último, a modo de logros tangibles.
    - [ ] Agregar métricas secundarias: número total de Job Matches realizados y score promedio de los últimos 5 matches.
    - [ ] Agregar el ítem "Progreso" en el sidebar del dashboard con un ícono apropiado de Lucide.
    - [ ] Mostrar un estado vacío con CTA ("Subí tu primer CV para empezar a trackear tu progreso") si el usuario no tiene historial aún.
- **Rama Git:** `feature/score-progression-analytics`

### 🎴 Tarjeta 17.2: Perfil Público Compartible (`/u/[username]`)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡 — **Growth loop viral**
- **Descripción:**
  Una URL pública `skillradar.app/u/[username]` que el developer puede compartir con recruiters. Muestra un resumen visual de su perfil: skill radar chart (con los ejes del producto: Frontend, Backend, DevOps, Architecture, Testing), seniority estimado, top skills extraídos y distribución de lenguajes de GitHub. El developer controla qué información es visible mediante toggles en Settings. Este feature crea el principal loop viral: un recruiter que recibe el link cae en la app y se registra. **Nota:** mostrar el skill radar chart en lugar del ATS score crudo para que el contexto sea más claro e interpretable para recruiters no técnicos.
- **Criterios de Aceptación:**
    - [ ] Agregar los campos `isPublicProfile: Boolean @default(false)` y `publicUsername: String? @unique` al modelo `User` en Prisma y migrar.
    - [ ] Crear la ruta pública `src/app/u/[username]/page.tsx` (sin requerir autenticación para GET).
    - [ ] Implementar la query de servidor que cargue solo los datos públicos del perfil: top 10 skills, distribución de lenguajes, seniority label, y fecha de último análisis.
    - [ ] Diseñar la UI del perfil público con el skill radar chart (usando Recharts `RadarChart`), badges de skills y score de seniority.
    - [ ] Crear en `src/app/dashboard/settings/page.tsx` una sección "Perfil Público" con toggles individuales para cada dato visible (skills, GitHub, seniority).
    - [ ] Agregar un botón "Compartir perfil" en el dashboard con copia al portapapeles de la URL pública.
    - [ ] Implementar meta tags Open Graph y Twitter Card en la página pública para previews enriquecidos al compartir en LinkedIn o X.
- **Rama Git:** `feature/public-profile-shareable`

### 🎴 Tarjeta 17.3: Badge Embebible para GitHub README

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢 — **Distribución orgánica / Adquisición viral**
- **Descripción:**
  Un endpoint que genera un SVG dinámico con el resumen del perfil SkillRadar del developer, diseñado para ser embebido en el README de GitHub del usuario con una sola línea de Markdown. Al hacer click en el badge, el recruiter llega al perfil público del dev en SkillRadar. El SVG se genera server-side con template literals (sin Canvas, sin React — compatible con el renderer de imágenes de GitHub). Se actualiza automáticamente con los últimos datos del usuario. **Depende de la Tarjeta 17.2** (Perfil Público).
- **Criterios de Aceptación:**
    - [ ] Crear el Route Handler `src/app/api/badge/[username]/route.ts` que devuelva `Content-Type: image/svg+xml`.
    - [ ] Diseñar el template SVG del badge: nombre, seniority label (ej: "Mid-level Developer"), top 3 skills como píldoras de texto, y logo de SkillRadar. Dimensiones estándar de badge (ej: 540×180px).
    - [ ] Configurar `Cache-Control: public, max-age=3600` para que GitHub pueda cachear el SVG sin saturar el endpoint.
    - [ ] Mostrar el badge solo si el usuario tiene `isPublicProfile: true`; retornar 404 si el perfil es privado.
    - [ ] Agregar en el panel de Perfil Público de Settings la instrucción de cómo embeber el badge, con el snippet de Markdown listo para copiar: `[![SkillRadar](https://skillradar.app/api/badge/[username])](https://skillradar.app/u/[username])`.
- **Rama Git:** `feature/embeddable-badge`

---

## 🧠 Módulo 7: AI Services (parcial — Career Copilot)

### 🎴 Tarjeta 7.2: Implementar Chatbot Flotante (Career Copilot) con useChat

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Agregar un widget de chatbot flotante de asistencia interactiva (burbuja de chat) accesible en la esquina inferior del dashboard. El chatbot debe permitir al desarrollador hacer consultas sobre su currículum, consejos de carrera y cómo estudiar para los gaps técnicos detectados.
- **Criterios de Aceptación:**
    - [ ] Crear un Route Handler en `/api/chat` usando `streamText` del Vercel AI SDK conectando con el modelo rápido de **Groq** o **Gemini**.
    - [ ] Diseñar el widget UI flotante interactivo en `src/components/dashboard/career-copilot.tsx` utilizando Lucide Icons y shadcn/ui.
    - [ ] Integrar el hook reactivo `useChat` para gestionar el estado de los mensajes en tiempo real.
    - [ ] Cargar de forma automática el CV parseado actual del usuario en las instrucciones del sistema (`system prompt`) para que el Copiloto tenga contexto real del desarrollador al responder.
    - [ ] Añadir la burbuja del chat en el layout compartido del dashboard.
- **Rama Git:** `feature/career-copilot-widget`

---

## 🧠 Módulo 18: Developer Intelligence Engine (GitHub Avanzado)

> 💡 Este módulo extiende el análisis de GitHub del Módulo 5 con señales más profundas de seniority técnica, incorporando el concepto de **"Evidence-based Skills"**: validar lo que el dev _demuestra_ que sabe a través de su actividad real de código, no solo lo que declara en el CV.

### 🎴 Tarjeta 18.1: GitHub Schema Extendido con Seniority Signals

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡 — **Diferenciador único vs. competidores**
- **Descripción:**
  El schema actual de `GithubAnalysis` captura principalmente distribución de bytes por lenguaje. Extenderlo para capturar señales temporales y cualitativas que son mucho más relevantes para estimar seniority: frecuencia de commits, calidad de READMEs, patrones de arquitectura detectados por la IA (presencia de CI/CD, testing, RBAC, auth flows, queue systems, caching, observability tooling). Estas señales son exactamente lo que diferencia a un Senior de un Mid-level en el mundo real.
- **Criterios de Aceptación:**
    - [ ] Actualizar el Zod Schema de GitHub en `src/lib/validations/github.ts` agregando los nuevos campos:
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
    - [ ] Migrar el modelo `GithubAnalysis` en Prisma para incluir los nuevos campos (o almacenarlos en el JSON de análisis existente).
    - [ ] Actualizar el prompt de análisis de GitHub en el servicio para extraer estas señales explícitamente.
    - [ ] Actualizar la vista `/dashboard/github` para mostrar el `detectedPatterns` como un checklist visual de señales de madurez técnica.
- **Rama Git:** `feature/github-schema-extended`

### 🎴 Tarjeta 18.2: Modos de Entrevista Avanzados (Pressure & Recruiter Simulation)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢 — **Extensión del Mock Interview (M6)**
- **Descripción:**
  Extender el Mock Interview del Módulo 6 con dos modos adicionales más allá del modo conversacional estándar. El **Pressure Mode** simula presión real de entrevista: el entrevistador de IA interrumpe, hace preguntas con ambigüedad intencional, pone límites de tiempo implícitos y sigue con edge cases. El **Recruiter Simulation Mode** evalúa la claridad comunicacional del dev: cómo estructura sus respuestas, si puede explicar conceptos técnicos a una persona no técnica, y su metodología de debugging. **Depende de la Tarjeta 6.1** (Mock Interview base funcionando).
- **Criterios de Aceptación:**
    - [ ] Agregar un selector de modo (`Standard` / `Pressure` / `Recruiter Simulation`) en la pantalla de inicio de la entrevista en `/dashboard/interview`.
    - [ ] Implementar variantes del system prompt para cada modo:
        - **Pressure:** interrupciones frecuentes, preguntas de follow-up agresivas, reformulación de la pregunta si la respuesta es vaga.
        - **Recruiter Simulation:** foco en comunicación clara, preguntas del estilo "explicame X como si no supiera programar", evaluación de pensamiento estructurado.
    - [ ] Incluir en el **Debrief JSON** final los campos `communicationScore`, `structuredThinkingScore` y `pressureHandlingScore` además de los técnicos.
    - [ ] Mostrar en los resultados del Debrief un resumen diferenciado por modo.
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
