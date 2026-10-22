# ADR-004: Gate `audit:high` y excepciones documentadas

- Estado: aceptado
- Fecha: 2026-09-27
- Contexto: F4 (tooling gates)

## Contexto

El gate cubre todas las dependencias instaladas y falla ante vulnerabilidades
high/critical que no estén documentadas. El lockfile anterior tenía dos
excepciones que ya no aplican: `mysql2` se resuelve a `3.24.4`, corregido
para las alertas de severidad high, y `deepmerge-ts` ahora se fuerza a
`8.0.2` mediante un override. Prisma hizo el mismo cambio para su rama v7
en [prisma/orm#30189](https://github.com/prisma/orm/pull/30189).

## Decisión

- `scripts/audit-high.mjs` corre `npm audit --json` y falla con cualquier
  vulnerabilidad high/critical excepto `GHSA-vfj7-8cjw-p6xm` en `braces`.
- No hay versión corregida de `braces`; la dependencia viene de herramientas
  de desarrollo y sus patrones son controlados por el repositorio.
  `shadcn` se clasifica como `devDependency` para excluir esa cadena del
  árbol instalado en producción.
- Las dos alertas de `mysql2` se quitan de la allowlist porque la versión
  resuelta en el lockfile ya está corregida.
- El override de `deepmerge-ts` se elimina cuando `@prisma/config` adopte
  una versión corregida por sí misma.

## Consecuencias

El gate mantiene una excepción visible solo para la alerta upstream de
`braces`; todas las demás high/critical quedan bloqueadas.
