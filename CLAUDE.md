# SkillRadar — Developer Reference & Guidelines

Este archivo contiene los comandos rápidos y las reglas operativas principales para el desarrollo en **SkillRadar**.

## 🛠️ Comandos de Desarrollo Rápidos

- **Iniciar Dev Local:** `npm run dev` (Inicia el servidor Next.js local)
- **Generar Prisma Client:** `npx prisma generate` (Sincronizar tipos tras cambio en schema)
- **Ejecutar Tests:** `npm run test` (Vitest una pasada) o `npm run test:watch` (Modo continuo)
- **Validación de Tipos TS:** `npm run type-check` (`tsc --noEmit`)
- **Linter & Formateo:** `npm run lint` (ESLint) o `npm run format` (Prettier)
- **Fix Automático de Lints:** `npm run lint:fix`
- **Levantar DB Local:** `docker compose up -d` (Solo para desarrollo in-memory/local)

---

## 🏛️ Contexto de Dominio & Stack

Plataforma premium para el análisis integral de perfiles de desarrollo de software:

- **CV a Score ATS**: Extracción de PDFs, análisis y keywords con IA.
- **Job Matching**: Comparación contextual de ofertas de trabajo con el perfil técnico.
- **GitHub Analyzer (V2)**: Auditoría automática de repositorios y frecuencia de commits.

### Stack Tecnológico Principal:

- **Framework**: Next.js 16.2.6 (App Router) + React 19.
- **Styling & UI**: Tailwind CSS v4.0 + shadcn/ui integrado con `@base-ui/react ^1.5.0` (Base UI v1).
- **Base de Datos & ORM**: Neon PostgreSQL (WebSocket pooling en runtime) + Prisma ORM.
- **Autenticación**: Auth.js v5 (NextAuth) con GitHub OAuth (`src/proxy.ts` como middleware).
- **IA**: Vercel AI SDK + Google Gemini API (Primary) + OpenRouter (Fallback).

---

## 🚨 Reglas Rápidas de Código

1. **Reglas Específicas**: Consulta `.cursor/rules/` para guías detalladas según el archivo que edites.
2. **Base UI trigger**: No utilices `asChild` en Base UI v1; usa siempre la propiedad `render={}` en triggers interactivos.
3. **Server Actions**: Retorna siempre el patrón de resultados `{ success: true, data }` o `{ success: false, error }` y valida con Zod en el servidor.
4. **Verificación de Seguridad**: Siempre llama a `auth()` dentro de Server Actions y Route Handlers para validar al usuario.
5. **No Any**: TypeScript en modo estricto. Está prohibido el uso de `any`.
