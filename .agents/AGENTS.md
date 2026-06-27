# Reglas Operativas de SkillRadar

<!-- ──────────────────────────────────────────── -->

## 🔀 Git Workflow — Regla Crítica

<!-- ──────────────────────────────────────────── -->

1. **Rama base:** Siempre desde `develop`. Nunca hacer push directo a `main` o `develop`.
2. **Ramas atómicas:** `feature/<nombre>` o `bugfix/<nombre>` desde `develop`.
3. **Pull Requests:** Crear PR apuntando a `develop`. La fusión la hace el usuario, nunca el agente.
4. **Pre-push obligatorio:** `cmd /c npm run type-check` y `cmd /c npm run test`.
5. **Husky:** Pre-commit corre Prettier + ESLint automáticamente. No ejecutar manualmente.

---

## 🏗️ Stack (v1.1)

- **Framework:** Next.js 16.2.9 (App Router)
- **Estilos:** Tailwind CSS v4.0
- **DB:** Prisma 7.x + Neon PostgreSQL (WebSocket adapter)
- **Auth:** Auth.js v5 (NextAuth beta) — JWT strategy
- **UI:** shadcn/ui + `@base-ui/react ^1.5.0` (Base UI v1)
- **IA:** Vercel AI SDK + Gemini (`gemini-2.5-flash`) → fallback OpenRouter

---

## 📖 Reglas Específicas (carga contextual por archivo)

Las siguientes reglas se cargan automáticamente al editar los archivos correspondientes:

- **[skillradar-global.md](rules/skillradar-global.md)** — Arquitectura, asChild→render, zero any, Result Pattern
- **[skillradar-security.md](rules/skillradar-security.md)** — AES-256-GCM, Auth híbrida, SSRF, Doble Ciego
- **[skillradar-nextjs16.md](rules/skillradar-nextjs16.md)** — proxy.ts, APIs async, Server Actions
- **[skillradar-actions.md](rules/skillradar-actions.md)** — Result Pattern, auth(), Zod, revalidatePath
- **[skillradar-db.md](rules/skillradar-db.md)** — Repository pattern, Neon pooling, Prisma generate
- **[skillradar-ai.md](rules/skillradar-ai.md)** — streamObject, generateObject+Zod, mock mode
- **[skillradar-workflow.md](rules/skillradar-workflow.md)** — Ciclo completo de desarrollo en 6 fases
