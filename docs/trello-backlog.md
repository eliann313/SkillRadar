# 📋 SkillRadar — Trello Backlog & Roadmap Sync (Orden Secuencial v1.3)

Este archivo sirve como el inventario de desarrollo oficial y priorizado de **SkillRadar**. Contiene la definición exacta de las tarjetas del tablero de Trello, organizadas de forma **estrictamente secuencial y por módulos de negocio** (del Módulo 1 al Módulo 12) para que puedas seguir el desarrollo de forma sucesiva y ordenada, sin perderte en el proceso.

Cada tarjeta incluye su prioridad (Alta 🔴, Media 🟡, Baja 🟢) y su estado actual (`[x] Completada` o `[ ] Pendiente`).

---

## 🏗️ Módulo 1: Layout & Core Shell

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

## 📂 Módulo 2: CV Upload & Parse (Developer)

### 🎴 Tarjeta 2.1: Conectar Subida de Archivos con UploadThing en Frontend

- **Estado:** `[ ] Pendiente`
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

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Reemplazar el análisis simulado de 2.5 segundos en la página de carga de CV y conectar la interfaz con la Server Action del backend `uploadAndParseCVAction` para que ejecute el análisis estructurado de Gemini con Zod en Neon Postgres.
- **Criterios de Aceptación:**
  - [ ] Reemplazar la constante estática `mockAnalysis` en `src/app/dashboard/cv-analysis/page.tsx` por datos reales.
  - [ ] Invocar a `uploadAndParseCVAction` pasándole la URL de UploadThing obtenida tras subir el archivo y el nombre del PDF.
  - [ ] Renderizar en los componentes `ATSScoreCard` y `AnalysisResults` la información real proveniente del objeto de base de datos Neon.
  - [ ] Comprobar que la base de datos de Neon almacena correctamente el JSON del análisis estructurado bajo la fila de la tabla `Resume`.
- **💡 Arquitectura de IA:** Conectar esta acción a la abstracción multi-modelo desarrollada en la **Tarjeta 7.1** para permitir la conmutación por error (fallback a Groq/OpenRouter) sin acoplar la llamada a Google de forma rígida.
- **Rama Git:** `feature/cv-actions-neon-integration`

### 🎴 Tarjeta 2.3: Integrar Textarea Fallback para CVs no Legibles (OCR/Canva)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Si el parseador de PDF devuelve un texto crudo vacío (debido a PDFs escaneados o imágenes complejas sin OCR), mostrar un textarea alternativo para que el desarrollador pegue su CV en texto plano y no interrumpir su flujo.
- **Criterios de Aceptación:**
  - [ ] Detectar si el texto extraído en el servicio es nulo o excesivamente corto.
  - [ ] Desplegar en la UI de forma condicional un aviso advirtiendo la limitación y habilitar el campo `Textarea` para pegar texto crudo.
  - [ ] Implementar la conexión de este texto directo a la Server Action de análisis y persistir el resultado.
- **Rama Git:** `feature/cv-text-fallback`

---

## 🎯 Módulo 3: Job Match (Developer)

### 🎴 Tarjeta 3.1: Crear Capa de Negocio y Estructura Backend de Job Match

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Actualmente no existe la feature `job-match` en el backend. Debemos extraer la lógica del servidor en la carpeta `src/features/job-match/` definiendo sus actions, service, repository y tipaciones para Gemini y Prisma.
- **Criterios de Aceptación:**
  - [ ] Crear el directorio `src/features/job-match/`.
  - [ ] Definir el Zod Schema para la evaluación estructurada del cruzado de datos (seniority match, alignedSkills, missingSkills, matchScore y recomendaciones).
  - [ ] Implementar la query Prisma en `repository.ts` para crear y guardar las comparaciones en la tabla `JobMatch`.
- **Rama Git:** `feature/job-match-backend`

### 🎴 Tarjeta 3.2: Diseñar Prompt e Inferencia de Match en Servidor con IA

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Desarrollar la lógica en `service.ts` para extraer los requisitos principales de la oferta laboral e invocar a Gemini con Structured Outputs (o Groq Llama 3 en su defecto) para compararla contra el texto crudo del currículum que el usuario elija de su historial.
- **Criterios de Aceptación:**
  - [ ] Diseñar el prompt sistemático y estructurado en `src/features/job-match/service.ts`.
  - [ ] Utilizar el cliente de la **Tarjeta 7.1** para invocar la llamada estructurada con el schema Zod correspondiente.
  - [ ] Escribir tests unitarios con Vitest para corroborar el cálculo y formateo del score de coincidencia.
- **Rama Git:** `feature/job-match-ai-evaluation`

### 🎴 Tarjeta 3.3: Conectar Frontend de Job Match con Server Actions

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Modificar la maqueta estática `/dashboard/job-match` de v0. Permitir al usuario seleccionar mediante un `Select` qué currículum de su historial quiere comparar, pegar la oferta de trabajo y gatillar la Server Action real de comparación.
- **Criterios de Aceptación:**
  - [ ] Eliminar `mockMatch` en `src/app/dashboard/job-match/page.tsx`.
  - [ ] Agregar un menú desplegable (`Select` de shadcn/ui) para cargar los CVs previamente subidos y guardados del desarrollador desde la base de datos Neon.
  - [ ] Invocar a la Server Action de comparación y renderizar en los componentes `MatchScoreCard` e `GapAnalysis` los datos vivos de la DB.
- **Rama Git:** `feature/job-match-frontend`

---

## 🎨 Módulo 4: Marketing Landing & UX

### 🎴 Tarjeta 4.1: Diseñar Landing Page Comercial de Marketing en `/`

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Actualmente, al ingresar a la raíz de la web `/`, se le muestra al usuario anónimo directamente el formulario de inicio de sesión. Vamos a crear una landing page comercial, moderna y descriptiva para captar a usuarios de marketing antes de iniciar sesión.
- **Criterios de Aceptación:**
  - [ ] Modificar `src/app/page.tsx` para mostrar la landing de presentación del producto si no hay sesión activa.
  - [ ] Diseñar un Hero premium con gradientes de fondo, micro-animaciones en Tailwind v4 y CTA atractivos de registro con GitHub.
  - [ ] Trasladar el formulario de inicio de sesión `LoginForm` a una ruta dedicada `/login` (creando `src/app/login/page.tsx`).
  - [ ] Garantizar SEO óptimo (meta tags, open graph, y headings estructurados semánticamente).
- **Rama Git:** `feature/marketing-landing-page`

### 🎴 Tarjeta 4.2: Polishing de Interfaz (Skeletons de Carga & Toasts)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Añadir transiciones fluidas y estados visuales elegantes mediante Skeletons durante las peticiones a la IA y notificaciones dinámicas tipo Toast usando `sonner`.
- **Criterios de Aceptación:**
  - [ ] Instalar y registrar el Toast Provider de `sonner` en el root layout.
  - [ ] Crear loaders visuales de tipo `Skeleton` para los scores y listas de habilidades.
  - [ ] Desplegar avisos flotantes interactivos de éxito o error tras subidas de archivos o ejecuciones de la IA.
- **Rama Git:** `feature/ux-polish-skeletons`

### 🎴 Tarjeta 4.3: Implementar Internacionalización (i18n) Nativa con next-intl

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Configurar la infraestructura de traducción en el proyecto para dar soporte dinámico a múltiples idiomas (Español/Inglés) sin duplicar código. Utilizaremos la librería estándar `next-intl` aprovechando el enrutamiento dinámico `[locale]` de Next.js App Router para una traducción limpia y mantenible tanto en el servidor como en el cliente.
- **Criterios de Aceptación:**
  - [ ] Instalar la librería `next-intl`.
  - [ ] Configurar los archivos de diccionarios en la raíz (`messages/en.json` y `messages/es.json`) con las traducciones base del shell y la landing.
  - [ ] Reestructurar el enrutamiento envolviendo las páginas del dashboard y marketing bajo la carpeta dinámica `src/app/[locale]/`.
  - [ ] Configurar el enrutamiento y la redirección automática del idioma en el middleware/proxy de la aplicación.
  - [ ] Crear un componente selector de idioma (`LanguageSwitcher` con shadcn/ui) integrado en la barra superior o en el sidebar para alternar entre Español e Inglés con un clic.
- **Rama Git:** `feature/i18n-next-intl-setup`

---

## 🔌 Módulo 5: GitHub Signal Translation

### 🎴 Tarjeta 5.1: Implementar Route Handler `/api/github/analyze` y API Connector

- **Estado:** `[ ] Pendiente`
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

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Baja 🟢
- **Descripción:**
  Agregar la ruta `/dashboard/github` y crear la UI interactiva que muestre gráficos de distribución de lenguajes (bytes), frecuencias de commits e informes cualitativos generados por la IA.
- **Criterios de Aceptación:**
  - [ ] Crear la página `src/app/dashboard/github/page.tsx` en el dashboard.
  - [ ] Diseñar los componentes UI necesarios (LanguageChart, RepoList, StrengthsWeaknessesCard).
  - [ ] Conectar los componentes a los datos reales de base de datos e implementar un botón de actualización de perfil en tiempo real.
- **Rama Git:** `feature/github-dashboard-frontend`

---

## 💬 Módulo 6: Mock Interview

### 🎴 Tarjeta 6.1: Conectar Chat de Mock Interview con Vercel AI SDK y Gemini

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡 (¡Subido desde Baja / Fase 2!)
- **Descripción:**
  Actualmente, el chat interactivo en `/dashboard/interview` responde preguntas aleatorias en base a un array plano en el cliente. Vamos a conectar esta UI con el Vercel AI SDK e implementar una Server Action real para simular una entrevista técnica en vivo adaptada al CV y habilidades del desarrollador, persistiendo el resultado en la base de datos.
- **Criterios de Aceptación:**
  - [ ] Integrar el hook de chat dinámico en `src/components/interview/mock-interview-chat.tsx` utilizando `useChat` o Server Actions en streaming.
  - [ ] Implementar la Server Action que inyecte el CV seleccionado y los gaps del Job Match al prompt del LLM (Gemini 2.5 Flash / Groq) como contexto de entrevista técnica estructurada.
  - [ ] Escribir la lógica del disparador "Finalizar Entrevista": el chat termina, y el sistema invoca una llamada de LLM separada asíncrona para compilar el **Debrief JSON** estructurado con calificaciones por área (ej. comunicación técnica, arquitectura, testing).
  - [ ] Guardar los datos de la entrevista en el nuevo modelo `InterviewSession` de Prisma (relacionando `userId`, `debrief`, `score` de match y el array serializado de `messages`).
  - [ ] Validar que la UI del dashboard renderice adecuadamente los scores históricos de estas entrevistas para el "Score Progression Timeline".
- **Rama Git:** `feature/mock-interview-ai-real`

---

## 🧠 Módulo 7: AI Services

### 🎴 Tarjeta 7.1: Crear Servicio de IA Multi-Modelo Unificado (Gemini + Groq + OpenRouter)

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡 (¡Crucial para la robustez del sistema!)
- **Descripción:**
  Desacoplar la llamada a la IA de los servicios de negocio individuales para evitar código repetido y refactorizaciones masivas. Crear un wrapper unificado en `src/lib/ai/` que gestione conmutaciones automáticas por error en cascada (`Gemini -> Groq -> OpenRouter`) ante errores de cuota o rate limit.
- **Criterios de Aceptación:**
  - [ ] Crear el directorio `src/lib/ai/` con `index.ts`, `gemini.ts`, `groq.ts` y `openrouter.ts`.
  - [ ] Configurar las variables de entorno `GROQ_API_KEY` y `OPENROUTER_API_KEY` con validación Zod en `src/lib/env.ts`.
  - [ ] Implementar la resiliencia en `index.ts`: si la promesa de Gemini falla o arroja un error 429, capturarlo y reintentar inmediatamente la llamada con Groq (usando Llama 3 70B) o OpenRouter.
  - [ ] Adaptar `src/features/cv-analysis/ai-service.ts` para que consuma esta nueva abstracción en lugar de llamar directamente al proveedor de Google.
- **💡 Razón del Cambio:** Debe implementarse antes de codificar Job Match y Mock Interview para heredar la resiliencia de forma nativa sin tocar múltiples archivos después.
- **Rama Git:** `feature/ai-multimodel-service`

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

## 🔑 Módulo 8: Autenticación Novedosa

### 🎴 Tarjeta 8.1: Configurar Google OAuth Provider

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Media 🟡
- **Descripción:**
  Habilitar el inicio de sesión con Google OAuth creando las credenciales de cliente en Google Cloud Console, vinculando el botón "Google" de la UI y configurando las variables de entorno seguras.
- **Criterios de Aceptación:**
  - [ ] Crear un proyecto en Google Cloud Console y configurar la pantalla de consentimiento de OAuth.
  - [ ] Agregar las URLs autorizadas de redirección de NextAuth en la consola de Google.
  - [ ] Registrar las variables `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en el archivo `.env.local` y validarlas en `src/lib/env.ts`.
  - [ ] Probar el inicio de sesión en local y verificar que asocie correctamente al usuario en la base de datos de Neon Prisma.
- **Rama Git:** `feature/auth-google-provider`

### 🎴 Tarjeta 8.2: Magic Links de Email sin Contraseña con Resend

- **Estado:** `[ ] Pendiente`
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

## 📊 Módulo 10: Live Dashboard & Context Pipeline

### 🎴 Tarjeta 10.1: Dashboard con Datos Reales y "Next Action"

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴
- **Descripción:**
  El Dashboard muestra métricas vivas de Neon (último score, uso de base de datos). Agregar "Next Action Cards" dinámicas basadas en la progresión del usuario (ej: "Sube tu CV para empezar", "Toma una Mock Interview").
- **Criterios de Aceptación:**
  - [ ] Reemplazar todos los datos estáticos del overview del Dashboard con queries reales de Prisma que consulten los últimos scores de `Resume`, `JobMatch` y `GithubAnalysis`.
  - [ ] Implementar un componente dinámico "Next Action" que evalúe el estado del usuario en la DB y renderice una tarjeta interactiva con un llamado a la acción (ej: si no tiene CV, muestra "Subir CV"; si tiene CV pero no matches, muestra "Comparar Oferta").
  - [ ] Agregar un gráfico pequeño de progreso histórico del Score ATS utilizando Recharts o componentes Tailwind.
- **Rama Git:** `feature/dashboard-live-data`

### 🎴 Tarjeta 10.2: Context Pipeline - Conectar CV Real al Match

- **Estado:** `[ ] Pendiente`
- **Prioridad:** Alta 🔴
- **Descripción:**
  Al iniciar un Job Match, el sistema debe precargar los skills extraídos del Resume del usuario desde la DB, no usar mocks genéricos. El dev solo pega la Oferta, la IA cruza Oferta vs CV real.
- **Criterios de Aceptación:**
  - [ ] Modificar la query del servicio de Job Match para recibir el `resumeId` seleccionado por el desarrollador.
  - [ ] Extraer el JSON estructurado de habilidades y experiencia de la tabla `Resume` en Postgres.
  - [ ] Enviar al prompt de Gemini/Llama el texto estructurado del currículum real recuperado de la base de datos junto con el texto de la nueva Job Offer.
  - [ ] Validar que los resultados del Match se guarden correctamente en la tabla `JobMatch` con su respectiva relación de clave foránea a la tabla `Resume`.
- **Rama Git:** `feature/job-match-context-pipeline`

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
  - [ ] Crear la vista de "Peticiones de Contacto Recibidas" en el dashboard del Desarrollador (`/dashboard/requests` o sección de notificaciones) cargando las solicitudes donde `developerId === currentUser.id`.
  - [ ] Implementar las Server Actions `acceptContactRequestAction` (cambia el estado a `"accepted"`) y `declineContactRequestAction` (cambia el estado a `"declined"`).
  - [ ] Configurar el control de privacidad en la API/Server Component del Recruiter: si el estado es `"accepted"`, se revela el `email`, `name`, `githubUsername` e `image` del candidato; de lo contrario, se renderiza estrictamente como perfil anónimo.
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
  El usuario proporciona la URL pública de su LinkedIn. Un servicio extrae la información (o el usuario pega su contenido) y la IA analiza específicamente el Titular, la sección 'Acerca de' y la densidad de palabras clave, entregando feedback sobre cómo optimizar el perfil para algoritmos de búsqueda de reclutadores.
- **Criterios de Aceptación:**
  - [ ] Crear una interfaz con un campo de texto para que el usuario pegue el texto copiado de su perfil de LinkedIn o inserte su extracto.
  - [ ] Configurar un prompt especializado en el posicionamiento de LinkedIn (SEO de perfil técnico).
  - [ ] Retornar y mostrar una calificación del perfil con consejos específicos para mejorar el titular, la sección "Acerca de" y las descripciones de cargos.
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
