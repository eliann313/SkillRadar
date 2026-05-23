# 📋 SkillRadar — Trello Backlog & Roadmap Sync (Actualizado v1.2)

Este archivo sirve como el inventario de desarrollo oficial y priorizado de **SkillRadar**. Contiene la definición exacta de las tarjetas del tablero de Trello, organizadas por prioridad (Alta, Media, Baja) con rigor técnico adaptado a las convenciones asíncronas y de seguridad de **Next.js 16** y **Auth.js v5**.

---

## 🚨 Prioridad Alta (Esenciales para el MVP Core)

### 🎴 Tarjeta 1.1: Migrar Dashboard Shell a Layout Compartido (Next.js App Router)

- **Prioridad:** Alta 🔴
- **Descripción:**
  Actualmente, cada página de ruta del cliente (overview, cv-analysis, job-match, settings) importa y se envuelve manualmente en `<DashboardShell>`, lo que duplica código e invalida la persistencia del estado en el servidor. Vamos a migrar el shell a un archivo de layout real de Next.js.
- **Criterios de Aceptación:**
  - [ ] Crear el archivo `src/app/dashboard/layout.tsx`.
  - [ ] Trasladar el componente `DashboardShell` de uso manual a este layout compartido de Next.js.
  - [ ] Eliminar los envoltorios redundantes de `DashboardShell` en `/dashboard/page.tsx`, `/dashboard/cv-analysis/page.tsx`, `/dashboard/job-match/page.tsx`, `/dashboard/settings/page.tsx` y `/dashboard/interview/page.tsx`.
  - [ ] Verificar que las navegaciones internas a través del Sidebar no recarguen el menú ni parpadeen visualmente.
- **⚠️ Nota de Next.js 16:** Si el layout en el futuro requiere leer propiedades de ruta, ten en cuenta que `params` y `searchParams` son **asíncronos obligatorios** en Next.js 16 y deben ser consumidos usando `const resolvedParams = await params;`.
- **Rama Git:** `feature/dashboard-shared-layout`

### 🎴 Tarjeta 2.1: Conectar Subida de Archivos con UploadThing en Frontend

- **Prioridad:** Alta 🔴
- **Descripción:**
  Vincular el componente maqueta de v0 `CVUploadForm` (`src/components/cv-analysis/cv-upload-form.tsx`) para que suba el archivo PDF seleccionado por el usuario al CDN real de UploadThing usando el endpoint de backend que ya está expuesto en `src/app/api/uploadthing/route.ts`.
- **Criterios de Aceptación:**
  - [ ] Importar e integrar el hook `useUploadThing` de `@uploadthing/react` en `cv-upload-form.tsx`.
  - [ ] Configurar el estado de progreso visual en el área drag-and-drop mientras se realiza la subida.
  - [ ] Capturar adecuadamente la respuesta del servidor con la URL de archivo segura (`https://utfs.io/f/...` o `https://ufs.sh/f/...`).
  - [ ] Manejar errores de red o restricciones de archivos de más de 4MB de forma amigable.
- **Rama Git:** `feature/cv-uploadthing-frontend`

### 🎴 Tarjeta 2.2: Enlazar Formulario de CV con Server Action y Gemini Real

- **Prioridad:** Alta 🔴
- **Descripción:**
  Reemplazar el análisis simulado de 2.5 segundos en la página de carga de CV y conectar la interfaz con la Server Action del backend `uploadAndParseCVAction` para que ejecute el análisis estructurado de Gemini con Zod e Neon Postgres.
- **Criterios de Aceptación:**
  - [ ] Reemplazar la constante estática `mockAnalysis` en `src/app/dashboard/cv-analysis/page.tsx` por datos reales.
  - [ ] Invocar a `uploadAndParseCVAction` pasándole la URL de UploadThing obtenida tras subir el archivo y el nombre del PDF.
  - [ ] Renderizar en los componentes `ATSScoreCard` y `AnalysisResults` la información real proveniente del objeto de base de datos Neon.
  - [ ] Comprobar que la base de datos de Neon almacena correctamente el JSON del análisis estructurado bajo la fila de la tabla `Resume`.
- **💡 Arquitectura de IA:** Conectar esta acción a la abstracción multi-modelo desarrollada en la **Tarjeta 7.1** para permitir la conmutación por error (fallback a Groq/OpenRouter) sin acoplar la llamada a Google de forma rígida.
- **Rama Git:** `feature/cv-actions-neon-integration`

### 🎴 Tarjeta 3.1: Crear Capa de Negocio y Estructura Backend de Job Match

- **Prioridad:** Alta 🔴
- **Descripción:**
  Actualmente no existe la feature `job-match` en el backend. Debemos extraer la lógica del servidor en la carpeta `src/features/job-match/` definiendo sus actions, service, repository y tipaciones para Gemini y Prisma.
- **Criterios de Aceptación:**
  - [ ] Crear el directorio `src/features/job-match/`.
  - [ ] Definir el Zod Schema para la evaluación estructurada del cruzado de datos (seniority match, alignedSkills, missingSkills, matchScore y recomendaciones).
  - [ ] Implementar la query Prisma en `repository.ts` para crear y guardar las comparaciones en la tabla `JobMatch`.
- **Rama Git:** `feature/job-match-backend`

### 🎴 Tarjeta 3.2: Diseñar Prompt e Inferencia de Match en Servidor con IA

- **Prioridad:** Alta 🔴
- **Descripción:**
  Desarrollar la lógica en `service.ts` para extraer los requisitos principales de la oferta laboral e invocar a Gemini con Structured Outputs (o Groq Llama 3 en su defecto) para compararla contra el texto crudo del currículum que el usuario elija de su historial.
- **Criterios de Aceptación:**
  - [ ] Diseñar el prompt sistemático y estructurado en `src/features/job-match/service.ts`.
  - [ ] Utilizar el cliente de la **Tarjeta 7.1** para invocar la llamada estructurada con el schema Zod correspondiente.
  - [ ] Escribir tests unitarios con Vitest para corroborar el cálculo y formateo del score de coincidencia.
- **Rama Git:** `feature/job-match-ai-evaluation`

### 🎴 Tarjeta 3.3: Conectar Frontend de Job Match con Server Actions

- **Prioridad:** Alta 🔴
- **Descripción:**
  Modificar la maqueta estática `/dashboard/job-match` de v0. Permitir al usuario seleccionar mediante un `Select` qué currículum de su historial quiere comparar, pegar la oferta de trabajo y gatillar la Server Action real de comparación.
- **Criterios de Aceptación:**
  - [ ] Eliminar `mockMatch` en `src/app/dashboard/job-match/page.tsx`.
  - [ ] Agregar un menú desplegable (`Select` de shadcn/ui) para cargar los CVs previamente subidos y guardados del desarrollador desde la base de datos Neon.
  - [ ] Invocar a la Server Action de comparación y renderizar en los componentes `MatchScoreCard` e `GapAnalysis` los datos vivos de la DB.
- **Rama Git:** `feature/job-match-frontend`

### 🎴 Tarjeta 9.0: Implementar Modo Demo / Simulación Seguro (Server-Side Guest Sessions)

- **Prioridad:** Alta 🔴
- **Descripción:**
  Añadir una vía de acceso instantánea en el login que inicie una sesión real de "Invitado/Guest" en el servidor utilizando Auth.js v5 (vía Credentials Provider o sesión temporal). La lógica de desvío e inyección de datos mockeados se gestiona **estrictamente en el servidor** (Server Actions y API Routes) validando el rol `"guest"` del token JWT, impidiendo cualquier bypass o manipulación desde el React Context del cliente.
- **Criterios de Aceptación:**
  - [ ] Añadir botón "Explorar como Invitado (Modo Demo)" en el `LoginForm`.
  - [ ] Configurar un Credentials Provider secundario en Auth.js v5 para generar un JWT válido con `role: "guest"` e inyectar datos predefinidos de usuario ("Demo User").
  - [ ] En las Server Actions y APIs, verificar el rol de la sesión: si `session.user.role === "guest"`, interceptar y retornar directamente los datos de simulación simulados (los mocks de v0) sin hacer llamadas de cobro a Gemini ni alterar las tablas reales de la base de datos.
  - [ ] Desplegar un banner superior visual en el dashboard avisando que se navega bajo Modo Demo.
- **🔒 Seguridad Crítica:** Prohibido delegar el estado de simulación al cliente. El desvío de flujo debe ser validado criptográficamente en el servidor mediante el token JWT de Auth.js v5.
- **Rama Git:** `feature/guest-demo-simulation-mode`

---

## 🟡 Prioridad Media (UX, Abstracción de IA y Login)

### 🎴 Tarjeta 7.1: Crear Servicio de IA Multi-Modelo Unificado (Gemini + Groq + OpenRouter)

- **Prioridad:** Media 🟡 (¡Subido de Prioridad Baja!)
- **Descripción:**
  Desacoplar la llamada a la IA de los servicios de negocio individuales para evitar código repetido y refactorizaciones masivas. Crear un wrapper unificado en `src/lib/ai/` que gestione conmutaciones automáticas por error en cascada (`Gemini -> Groq -> OpenRouter`) ante errores de cuota o rate limit.
- **Criterios de Aceptación:**
  - [ ] Crear el directorio `src/lib/ai/` con `index.ts`, `gemini.ts`, `groq.ts` y `openrouter.ts`.
  - [ ] Configurar las variables de entorno `GROQ_API_KEY` y `OPENROUTER_API_KEY` con validación Zod en `src/lib/env.ts`.
  - [ ] Implementar la resiliencia en `index.ts`: si la promesa de Gemini falla o arroja un error 429, capturarlo y reintentar inmediatamente la llamada con Groq (usando Llama 3 70B) o OpenRouter.
  - [ ] Adaptar `src/features/cv-analysis/ai-service.ts` para que consuma esta nueva abstracción en lugar de llamar directamente al proveedor de Google.
- **💡 Razón del Cambio:** Debe implementarse antes de codificar Job Match y Mock Interview para heredar la resiliencia de forma nativa sin tocar múltiples archivos después.
- **Rama Git:** `feature/ai-multimodel-service`

### 🎴 Tarjeta 1.2: Implementar Dark & Light Theme con next-themes

- **Prioridad:** Media 🟡
- **Descripción:**
  Instalar y configurar `next-themes` para dar soporte dinámico de color en el frontend y añadir un selector visual de temas en la barra superior del dashboard.
- **Criterios de Aceptación:**
  - [ ] Instalar la librería `next-themes` en el proyecto.
  - [ ] Configurar el provider de temas en `src/app/layout.tsx`.
  - [ ] Crear un componente selector `ThemeToggle` usando shadcn/ui.
  - [ ] Comprobar que los estilos de Tailwind CSS v4 respondan adecuadamente al cambiar de modo en todas las vistas principales.
- **Rama Git:** `feature/theme-switcher-implementation`

### 🎴 Tarjeta 2.3: Integrar Textarea Fallback para CVs no Legibles (OCR/Canva)

- **Prioridad:** Media 🟡
- **Descripción:**
  Si el parseador de PDF devuelve un texto crudo vacío (debido a PDFs escaneados o imágenes complejas sin OCR), mostrar un textarea alternativo para que el desarrollador pegue su CV en texto plano y no interrumpir su flujo.
- **Criterios de Aceptación:**
  - [ ] Detectar si el texto extraído en el servicio es nulo o excesivamente corto.
  - [ ] Desplegar en la UI de forma condicional un aviso advirtiendo la limitación y habilitar el campo `Textarea` para pegar texto crudo.
  - [ ] Implementar la conexión de este texto directo a la Server Action de análisis y persistir el resultado.
- **Rama Git:** `feature/cv-text-fallback`

### 🎴 Tarjeta 4.1: Diseñar Landing Page Comercial de Marketing en `/`

- **Prioridad:** Media 🟡
- **Descripción:**
  Actualmente, al ingresar a la raíz de la web `/`, se le muestra al usuario anónimo directamente el formulario de inicio de sesión. Vamos a crear una landing page comercial, moderna y descriptiva para captar a usuarios de marketing antes de iniciar sesión.
- **Criterios de Aceptación:**
  - [ ] Modificar `src/app/page.tsx` para mostrar la landing de presentación del producto si no hay sesión activa.
  - [ ] Diseñar un Hero premium con gradientes de fondo, micro-animaciones en Tailwind v4 y CTA atractivos de registro con GitHub.
  - [ ] Trasladar el formulario de inicio de sesión `LoginForm` a una ruta dedicada `/login` (creando `src/app/login/page.tsx`).
  - [ ] Garantizar SEO óptimo (meta tags, open graph, y headings estructurados semánticamente).
- **⚠️ Nota de Next.js 16:** Al validar cookies y headers en el servidor, recuerda que `cookies()` y `headers()` de `next/headers` son **asíncronos obligatorios** en Next.js 16 (ej: `const cookieStore = await cookies();`).
- **Rama Git:** `feature/marketing-landing-page`

### 🎴 Tarjeta 4.2: Polishing de Interfaz (Skeletons de Carga & Toasts)

- **Prioridad:** Media 🟡
- **Descripción:**
  Añadir transiciones fluidas y estados visuales elegantes mediante Skeletons durante las peticiones a la IA y notificaciones dinámicas tipo Toast usando `sonner`.
- **Criterios de Aceptación:**
  - [ ] Instalar y registrar el Toast Provider de `sonner` en el root layout.
  - [ ] Crear loaders visuales de tipo `Skeleton` para los scores y listas de habilidades.
  - [ ] Desplegar avisos flotantes interactivos de éxito o error tras subidas de archivos o ejecuciones de la IA.
- **Rama Git:** `feature/ux-polish-skeletons`

### 🎴 Tarjeta 8.1: Configurar Google OAuth Provider

- **Prioridad:** Media 🟡
- **Descripción:**
  Habilitar el inicio de sesión con Google OAuth creando las credenciales de cliente en Google Cloud Console, vinculando el botón "Google" de la UI y configurando las variables de entorno seguras.
- **Criterios de Aceptación:**
  - [ ] Crear un proyecto en Google Cloud Console y configurar la pantalla de consentimiento de OAuth.
  - [ ] Agregar las URLs autorizadas de redirección de NextAuth en la consola de Google.
  - [ ] Registrar las variables `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en el archivo `.env.local` y validarlas en `src/lib/env.ts`.
  - [ ] Probar el inicio de sesión en local y verificar que asocie correctamente al usuario en la base de datos de Neon Prisma.
- **⚠️ Nota de Auth.js v5:** Dado que se eliminó el split heredado de Next.js 15 mediante el uso de `src/proxy.ts` de Next.js 16, evalúa consolidar la configuración del proveedor en un único archivo unificado `src/lib/auth.ts` directamente si el compilador lo permite sin advertencias en Edge Runtime.
- **Rama Git:** `feature/auth-google-provider`

### 🎴 Tarjeta 8.2: Magic Links de Email sin Contraseña con Resend

- **Prioridad:** Media 🟡
- **Descripción:**
  Configurar el inicio de sesión sin contraseñas enviando un enlace mágico temporal al correo electrónico del usuario (Magic Link) utilizando el proveedor de correo de Auth.js v5 y la API de **Resend**.
- **Criterios de Aceptación:**
  - [ ] Crear una cuenta gratuita en [Resend](https://resend.com) y generar una API Key.
  - [ ] Importar y configurar el `ResendProvider` en `src/lib/auth.config.ts` (o `auth.ts`).
  - [ ] Registrar `AUTH_RESEND_KEY` en tus variables de entorno locales y de Vercel.
  - [ ] Verificar que al ingresar un correo en el formulario de inicio de sesión, se despache un correo con el token y, al hacer clic, redirija correctamente e inicie sesión en la base de datos Neon.
- **Rama Git:** `feature/auth-magic-links`

---

## 🟢 Prioridad Baja (Features Avanzadas / V2)

### 🎴 Tarjeta 5.1: Implementar Route Handler `/api/github/analyze` y API Connector

- **Prioridad:** Baja 🟢
- **Descripción:**
  Crear la conexión con la API de GitHub usando el access token de GitHub OAuth del usuario, extraer datos de repos públicos y procesar con Gemini un reporte técnico sobre la calidad del código, READMEs y commits.
- **Criterios de Aceptación:**
  - [ ] Crear el conector en `src/lib/github.ts` que consulte la API de GitHub.
  - [ ] Crear el Route Handler `/src/app/api/github/analyze/route.ts`.
  - [ ] Definir el Zod Schema para la respuesta estructurada de la IA sobre el perfil GitHub.
  - [ ] Persistir los análisis técnicos y las estadísticas de lenguajes en la tabla `GithubAnalysis` de Prisma.
- **Rama Git:** `feature/github-analyzer-backend`

### 🎴 Tarjeta 5.2: Crear Vista Dashboard de Análisis GitHub

- **Prioridad:** Baja 🟢
- **Descripción:**
  Agregar la ruta `/dashboard/github` y crear la UI interactiva que muestre gráficos de distribución de lenguajes (bytes), frecuencias de commits e informes cualitativos generados por la IA.
- **Criterios de Aceptación:**
  - [ ] Crear la página `src/app/dashboard/github/page.tsx` en el dashboard.
  - [ ] Diseñar los componentes UI necesarios (LanguageChart, RepoList, StrengthsWeaknessesCard).
  - [ ] Conectar los componentes a los datos reales de base de datos e implementar un botón de actualización de perfil en tiempo real.
- **Rama Git:** `feature/github-dashboard-frontend`

### 🎴 Tarjeta 6.1: Conectar Chat de Mock Interview con Vercel AI SDK y Gemini

- **Prioridad:** Baja 🟢
- **Descripción:**
  Actualmente, el chat interactivo en `/dashboard/interview` responde preguntas aleatorias en base a un array plano en el cliente. Vamos a conectar esta UI con el Vercel AI SDK e implementar una Server Action real para simular una entrevista técnica en vivo adaptada al CV y habilidades del desarrollador.
- **Criterios de Aceptación:**
  - [ ] Integrar el hook de chat dinámico en `src/components/interview/mock-interview-chat.tsx`.
  - [ ] Implementar un Route Handler o Server Action que consuma Gemini para generar preguntas y evaluar las respuestas del candidato en base a su perfil técnico.
  - [ ] Mostrar estados interactivos en el chat (como typing indicators y carga progresiva de streaming).
- **Rama Git:** `feature/mock-interview-ai-real`

### 🎴 Tarjeta 7.2: Implementar Chatbot Flotante (Career Copilot) con useChat

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
