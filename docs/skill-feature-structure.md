# Skill: Arquitectura de Feature-Based Layered Architecture

Este documento detalla la estructura y convención técnica para implementar características en `src/features/` bajo un patrón de capas internas limpio y escalable en SkillRadar.

---

## Estructura de Directorios

Cada característica del negocio (ej. `cv-analysis`, `job-match`, `github-analysis`) debe residir en su propia carpeta en `src/features/` y estructurarse de la siguiente manera:

```
src/features/{nombre-de-feature}/
├── actions.ts            # Server Actions (Punto de entrada desde la UI cliente/mutaciones)
├── service.ts            # Capa de Servicio (Lógica de negocio pura e integración con APIs/LLMs)
├── repository.ts         # Capa de Repositorio (Consultas y mutaciones de base de datos directas - opcional)
├── types.ts              # Tipos específicos y schemas de Zod de esta feature
└── components/           # Componentes exclusivos de esta feature
    ├── ATSScoreCard.tsx
    └── CVUploadForm.tsx
```

---

## Definición de Capas y Responsabilidades

### 1. Server Actions (`actions.ts`)
* **Responsabilidad:** Exponer métodos seguros que la interfaz de usuario (Client Components) puede invocar.
* **Acciones:** Validar sesión, validar inputs con Zod schemas (definidos en `types.ts`), llamar al Service correspondiente, capturar errores y retornar un objeto con `ActionResult<T>`.

### 2. Service Layer (`service.ts`)
* **Responsabilidad:** Contener la lógica de negocio pura y agnóstica del framework.
* **Acciones:** Procesamiento de datos, cálculos de compatibilidad, llamadas a Vercel AI SDK para interactuar con Gemini o fallbacks a OpenRouter.
* **Regla:** Un servicio nunca debe conocer detalles HTTP directos (no maneja directamente cabeceras ni redirecciones del router).

### 3. Repository Layer (`repository.ts`)
* **Responsabilidad:** Encapsular consultas complejas a la base de datos a través de Prisma.
* **Acciones:** Agrupar selects complejos, JOINS manuales o transacciones.
* **Uso Selectivo:** Para queries CRUD elementales (`findUnique`, `create`), se permite realizar la llamada a `db` directamente desde la capa de servicio para evitar redundancia.

---

## Guía Paso a Paso para Crear una Feature

1. **Definir el Modelo:** Diseñar y agregar las relaciones y campos necesarios en `prisma/schema.prisma` y ejecutar `db push`.
2. **Definir Tipos & Zod Schemas:** Crear `types.ts` con el schema Zod y exportar el tipo inferido de TypeScript.
3. **Crear Capa de Datos/Servicio:** Desarrollar `service.ts` (y opcionalmente `repository.ts`) para estructurar la lógica dura y base de datos.
4. **Exponer vía Actions:** Escribir las Server Actions en `actions.ts` usando el Result Pattern.
5. **Construir la UI:** Diseñar componentes en `components/` y consumirlos en la página correspondiente bajo `src/app/dashboard/{ruta}/page.tsx`.
