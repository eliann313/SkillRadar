---
trigger: always_on
description: Reglas globales de arquitectura y codificación de SkillRadar (Next.js 16, Tailwind 4, Base UI v1)
globs: *
---

# Reglas Globales de SkillRadar (v1.1)

## 🛠️ Stack del Proyecto

- **Framework:** Next.js 16.2.9 (App Router)
- **Estilos:** Tailwind CSS v4.0
- **Base de Datos:** Prisma 7.x + Neon PostgreSQL (Connection pooling WebSocket en runtime)
- **Autenticación:** Auth.js v5 (NextAuth - beta) usando estrategia JWT
- **UI Components:** shadcn/ui integrado con `@base-ui/react ^1.5.0` (Base UI v1)

---

## 🚨 REGLAS CRÍTICAS DE PROGRAMACIÓN

### 1. No usar `asChild` en Elementos Interactivos

- **Motivo:** El proyecto utiliza Base UI v1 (`@base-ui/react`). En Base UI v1, la propiedad `asChild` está deprecada o no se utiliza.
- **Solución:** Utilizar la propiedad `render={}` de Base UI para inyectar componentes o personalizar elementos interactivos.
    - _Correcto:_ `<Tooltip.Trigger render={<button type="button" className="..." />} />`
    - _Incorrecto:_ `<Tooltip.Trigger asChild><button className="..." /></Tooltip.Trigger>`

### 2. Zero `any` e Integridad de Tipos

- La tipación estricta en TypeScript es obligatoria. No está permitido el uso del tipo `any`.
- Si se requiere tipar la sesión de Auth.js, la interfaz de sesión ya está extendida mediante `src/types/next-auth.d.ts` e incluye `session.user.id` y `session.user.role`.

### 3. Server Components por Defecto

- Todos los archivos de componentes y páginas dentro de `src/app/` son **Server Components** por defecto.
- Agregar `"use client"` únicamente al inicio del archivo si se requiere interactividad, estado local (`useState`), efectos (`useEffect`) o eventos específicos del navegador.

### 4. Patrón de Resultados Obligatorio en Server Actions

- Todas las Server Actions deben retornar el **Result Pattern** para consistencia y seguridad de la UI:
    ```typescript
    export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
    ```

### 5. Estilos Consistentes con Tailwind 4.0

- Usar clases utilitarias de Tailwind 4.0 sin añadir parches ad-hoc o customización manual fuera del sistema de diseño core.
- Priorizar la legibilidad y estructurar componentes de más de ~100 líneas en subcomponentes modulares dentro de la feature correspondiente.
