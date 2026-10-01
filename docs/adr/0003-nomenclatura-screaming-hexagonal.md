# ADR-003: Nomenclatura screaming + capas hexagonales por feature

- Estado: aceptado
- Fecha: 2026-09-28
- Contexto: refactor de nomenclatura vaga (`page.tsx`, `client-page.tsx`,
  `actions.ts`, `service.ts`, `repository.ts`, `types.ts`) y arquitectura
  screaming con principios hexagonales.

## Contexto

`src/` tenía 215 ficheros con nombres repetidos y vagos: 29x `page.tsx`,
7x `client-page.tsx`, 18x `actions.ts`, 7x `service.ts`, 5x `repository.ts`,
7x `types.ts`. Los features eran directorios planos sin capas y solo `jobs`
tenía puerto explícito (`ports.ts`). `src/lib/` mezclaba kernel puro con
infraestructura (DB, auth, IA, Blob) y `src/components/<ctx>` duplicaba
dominios de `src/features/<ctx>`.

## Decisión

Nombres screaming `<contexto>.<capa>.<ext>` y layout hexagonal por feature:

```text
src/features/<contexto>/
  domain/<ctx>.types.ts          # Zod + tipos (ex types.ts)
  domain/<ctx>.ports.ts          # contrato de persistencia (nuevo; jobs ya lo tenia)
  application/<ctx>.service.ts   # casos de uso con estado (ex service.ts)
  application/<ctx>.use-cases.ts # server actions / inbound adapters (ex actions.ts)
  infrastructure/<ctx>.repository.ts # adaptador Prisma + default<Ctx>Store
  presentation/<ctx>.client.tsx  # pantallas (ex client-page.tsx)
```

- `page|layout|error|loading|route` son reservados de Next y quedan como
  adaptadores finos que delegan a `features/*/presentation`.
- `job-applications.screen.tsx` (jobs+recruiter) y `demo-showcase.client.tsx`
  (mocks multi-dominio) son composiciones y viven en `app/` — la capa app
  puede componer features; los features nunca importan entre sí.
- `src/lib/` se parte en `src/shared-kernel/` (puro: `action-result`, `pii`,
  `sanitize`, `seniority`, `types`, `utils`) y `src/infrastructure/` (IO:
  `db`, `auth*`, `ai/`, `crypto`, `file-storage`, `github`, `mail`,
  `rate-limit`, guards...). Sin shims: los 135 importadores migraron en el
  mismo cambio (scripts en `scripts/refactor/oleada*.py`).
- Puertos nuevos: `ResumeStore`, `GithubAnalysisStore`, `InterviewStore`,
  `JobMatchStore`, `JobTrackerStore`. Cada repositorio expone su
  `default<Ctx>Store` y el servicio correspondiente lo consume (misma
  semántica runtime, seam inyectable para tests). Excepción: `job-tracker`
  no tiene clase repositorio — el store implementa Prisma directo.
- Features solo-`actions` (admin, notifications, etc.) no tienen `ports.ts`:
  sus `*.use-cases.ts` SON el puerto de entrada (server actions).
- Gates nuevos en `.dependency-cruiser.cjs`: `hex-shared-kernel-pure`
  (el kernel no importa infra/features/app/components) y cobertura de
  `infrastructure/` + `shared-kernel/` en `hex-no-features-in-infra`;
  excepción `jobs` movida a `domain/jobs.ports.ts`.

## Alternativas descartadas

- Renombrar `page|layout|error|route`: imposible, los exige el App Router.
- Clases repositorio con `implements`: no verifica miembros `static`.
- Shims permanentes en `src/lib/`: knip los marcó como código muerto
  (22 ficheros sin importadores) — se eliminaron en el mismo cambio.

## Consecuencias

- `tsc`, `arch` (0 errores), `knip` (exit 0), 126 tests vitest en verde.
- Deuda explícita: `src/components/<dominio>/*` sigue existiendo (usado por
  `presentation/` y `demo`); fusionarlo en `features/*/presentation` es el
  siguiente paso. Los `use-cases` que aún llaman al repositorio-clase
  directo (`cv-analysis`, `interview`, `github`) deben migrar al store.

## Adenda 2026-10-01 (deuda saldada en `chore/deuda-follow-up`)

- Settings/page (1648 líneas) partido en 9 cards (`profile`, `api-keys` +
  `provider-key-field` parametrizado, `inference`, `plan-usage`, `public`,
  `account-type`, `notifications`, `security-data` + tipos); page queda en
  ~540 líneas de estado + composición. El warning de complejidad desaparece.
- `AnalyticsEvent` suma `provider/model/latencyMs/success` (nullable, sin
  migración destructiva) y `trackServerEvent` los persiste en eventos
  `ai_inference_*`. **Pendiente manual**: `npx prisma db push` desde un
  entorno con acceso a Neon (sin conectividad desde esta máquina, P1001);
  hasta entonces el `catch` de `trackServerEvent` absorbe el error sin romper.
- Los 13 callers de `generateStructuredObject` pasan `userId` (atribución
  anonimizada lista).
