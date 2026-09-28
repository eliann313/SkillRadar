# ADR-001: Shared kernel en `src/lib/` para tipos y utilidades transversales

- Estado: aceptado
- Fecha: 2026-09-27
- Contexto: F4.2 (migración hexagonal)

## Contexto

Varios features importaban tipos y helpers desde `src/features/job-match/*`
(`ActionResult`) o desde `src/features/recruiter/service` (`sanitize`),
violando la regla `hex-no-feature-to-feature` (15 violaciones). Además había
lógica duplicada (`getSeniorityColor` en dos componentes) y una constante
compartida (`RECRUITER_PENDING_ERROR`) que rompía el build al vivir en un
módulo `"use server"`.

## Decisión

Centralizar en `src/lib/` (shared kernel, sin dependencias a features):

- `lib/action-result.ts` — `ActionResult<T>` única (9 features migrados,
  4 definiciones locales eliminadas).
- `lib/sanitize.ts` — `sanitizeText()` (5 features migrados;
  `RecruiterService.sanitize` queda como wrapper `@deprecated`).
- `lib/seniority.ts` — `getSeniorityColor()` + `seniorityColors` (deduplica
  `analysis-results.tsx` y `talent-dashboard.tsx`).
- `lib/recruiter-constants.ts` — `RECRUITER_PENDING_ERROR` fuera del módulo
  `"use server"` (Turbopack rechaza exports no-función en esos módulos).

## Consecuencias

- `npm run arch`: de 15 violaciones a 0 errores.
- Regla para código nuevo: ningún feature importa de otro feature; lo
  compartido va al kernel con test propio si tiene lógica.
