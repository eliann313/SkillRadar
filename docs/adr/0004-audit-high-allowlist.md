# ADR-004: Gate `audit:high` con allowlist de transitivos de Prisma

- Estado: aceptado
- Fecha: 2026-09-27
- Contexto: F4 (tooling gates)

## Contexto

`npm audit --audit-level=high` falla por 3 advisories en dependencias
transitivas de `prisma@7` (`deepmerge-ts` vía `@prisma/config`, `mysql2` ×2)
cuyo único fix es dowgradear a `prisma@6` (breaking). Prisma 8 RC aún usa
`deepmerge-ts@7`, así que no hay upgrade que lo resuelva hoy. Dependabot ya
los trackea (rama `prisma-7.10.0` y siguientes).

## Decisión

- `scripts/audit-high.mjs` (sin `console.*`, por `no-console`): corre
  `npm audit --json`, falla con cualquier vulnerabilidad high/critical
  EXCEPTO la allowlist documentada en el propio script:
  `GHSA-ggr8-5vv4-36mx`, `GHSA-3f6p-5ww8-9rcr`, `GHSA-rgwj-5xj2-c3m3`
  (incluye resolución transitiva: padres como `prisma`/`@prisma/config`
  heredan el veredicto de sus dependencias).
- CI (`arch` job) usa `npm run audit:high` en vez de `npm audit` crudo.
- `npm audit fix` (no-force) sí se aplicó: `browserslist`, `fast-uri`,
  `hono` actualizados sin breaking changes.

## Consecuencias

- El gate bloquea toda vulnerabilidad high/critical nueva; la allowlist solo
  cubre los 3 GHSA listados.
- TODO: eliminar la allowlist cuando Prisma adopte `deepmerge-ts@8`.
