---
trigger: always_on
description: Reglas y mejores prácticas para el acceso a base de datos con Prisma y Neon PostgreSQL
globs: prisma/**/*, src/**/repository.ts, src/lib/db.ts
---

# Convenciones de Base de Datos y ORM - SkillRadar

## 🛠️ Stack DB

- **DBMS:** PostgreSQL via Neon Serverless (Hobby tier).
- **ORM:** Prisma Client v7.x.
- **Conectividad:** Neon serverless WebSocket adapter (`@neondatabase/serverless` + `@prisma/adapter-neon`) en `src/lib/db.ts` para soportar múltiples conexiones simultáneas en Vercel.

## 🚨 Reglas de Acceso a DB

### 1. Selective Repository Pattern (Evitar Capas Anémicas)

No crees un método de repositorio para operaciones CRUD básicas (como buscar por ID o inserción simple). Prisma Client ya provee tipos seguros y llamadas directas y legibles.

- **Cuándo NO usar repository (Query directa en Service o Action):**
    - Consultas CRUD básicas como `db.user.findUnique({ where: { id } })`.
    - Inserciones directas sin transformaciones pesadas.
    - Actualizaciones de un solo campo.
- **Cuándo SÍ usar repository (`repository.ts`):**
    - Consultas complejas con múltiples joins o subconsultas avanzadas.
    - Filtros y búsquedas reutilizables.
    - Consultas compartidas entre múltiples features/servicios.

### 2. Cuidado con el Connection Pooling en Vercel Serverless

- Las funciones serverless abren múltiples conexiones concurrentes.
- Neon provee connection pooling nativo. Si es necesario en producción, utilizar `?pgbouncer=true&connection_limit=1` en `DATABASE_URL` ( Neon lo gestiona en su connection string).
- En desarrollo local, se usa Docker Compose con un PostgreSQL local (`docker-compose.yml`) y no requiere adapter WebSocket.

### 3. Modelo de Datos y Tipos Generados

- Siempre ejecuta `npx prisma generate` tras modificar `prisma/schema.prisma` para actualizar los tipos globales en `node_modules/.prisma/client`.
- Evita forzar casts manuales a los retornos de Prisma; usa los DTOs y tipos implícitos de Prisma para garantizar seguridad en TypeScript.
