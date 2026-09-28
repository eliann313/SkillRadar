# ADR-002: Puerto `MatchProvider` para el matching jobs → job-match

- Estado: aceptado
- Fecha: 2026-09-27
- Contexto: F4.2 (migración hexagonal)

## Contexto

`JobPostingService.getOrCalculateMatchScore` necesita calcular matching con IA,
cuya implementación vive en el feature `job-match`. Llamarlo directo es un
borde feature-to-feature prohibido por `hex-no-feature-to-feature`.

## Decisión

Inversión de dependencias en el seam, sin mover la implementación:

- `src/features/jobs/ports.ts` define el puerto `MatchProvider`
  (`createJobMatch({ userId, resumeId, jobOfferText })`) más
  `resolveDefaultMatchProvider()` (adaptador que envuelve a `JobMatchService`
  vía import dinámico).
- `JobPostingService` depende solo del puerto; acepta `provider?` opcional en
  `getOrCalculateMatchScore` y `getDeveloperJobBoard` (inyectable en tests,
  adaptador real por defecto en producción).
- Excepción explícita y única en `.dependency-cruiser.cjs`: `ports.ts` está
  excluido de la regla general (`pathNot`) y auditado por la regla
  informativa `hex-jobs-port-adapter` (no bloquea, deja rastro en el reporte).

## Alternativas descartadas

- Mover `createJobMatch` al kernel: arrastra IA + 5 providers + PII; troppo grande.
- Registro global con side-effects de módulo: orden de carga frágil en Next.js.
- `allowed` de dependency-cruiser: en v18 no hace override de `forbidden`
  (solo alimenta el modo whitelist `not-in-allowed`); verificado en código.

## Consecuencias

- `npm run arch`: 0 errores, 0 warnings.
- Deuda explícita: si el puerto suma más adaptadores, evaluar mover el
  contrato a `lib/` y el wiring a la capa de aplicación.
