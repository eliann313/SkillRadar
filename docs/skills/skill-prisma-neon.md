# Skill: Operaciones y Configuración de DB Local vs Neon

Este documento detalla la convención de conexión híbrida y buenas prácticas para operar Prisma y Neon PostgreSQL en desarrollo local y entornos de producción.

---

## 🛠️ Arquitectura de Conexión Híbrida

Para garantizar el máximo rendimiento y evitar bloqueos en entornos serverless, SkillRadar implementa una estrategia de conexión dividida:

### 1. Entorno de Ejecución (Runtime de la Aplicación)

- **Conector:** `PrismaNeon` (`@prisma/adapter-neon` + `@neondatabase/serverless`).
- **Protocolo:** WebSockets.
- **Variable:** `DATABASE_URL` (con sslmode=require).
- **Propósito:** Permite consultas rápidas, seguras y concurrentes desde las funciones serverless de Next.js sin agotar el pool de conexiones de Postgres.

### 2. Entorno de CLI (Herramientas Prisma)

- **Conector:** Direct TCP (bypasseando websockets).
- **Variable:** `DATABASE_URL_UNPOOLED` (proxy de IP directo a Neon).
- **Configuración:** Definido en `prisma.config.ts`.
- **Propósito:** Permite ejecutar comandos de CLI (`db push`, `generate`, `migrate`) de manera rápida y sin restricciones de puertos locales o proxies in-browser.

---

## 🚀 Flujo de Trabajo para Modificaciones en DB

Cada vez que necesites alterar la base de datos o añadir un campo al schema:

1. **Modificar el Schema:** Editar `prisma/schema.prisma` agregando o actualizando modelos/campos.
2. **Sincronizar DB en Desarrollo:** Ejecutar `npx.cmd prisma db push`.
   - _Nota:_ Prisma utilizará automáticamente la conexión sin pooling `DATABASE_URL_UNPOOLED` gracias a `prisma.config.ts`.
3. **Regenerar Cliente:** Ejecutar `npx.cmd prisma generate` para sincronizar los tipos de TypeScript de `@prisma/client`.
4. **Verificar el Build:** Ejecutar `npm run build` para garantizar que la modificación no ha roto componentes existentes en la app.

---

## ⚠️ Connection Pooling en Vercel (Producción)

En entornos de producción serverless, cada función serverless levantada por Vercel abre una conexión separada a la base de datos. Sin un pool de conexiones, la base de datos de Neon puede saturarse rápidamente.

- **Solución (pgBouncer):** En la consola de Vercel, añadir a la `DATABASE_URL` de producción el parámetro `?pgbouncer=true&connection_limit=1`. Neon soporta esto de manera nativa mediante su cadena de conexión del pool.
