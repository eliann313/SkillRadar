---
trigger: always_on
description: Reglas de integración con modelos de lenguaje (LLM) usando Vercel AI SDK y Gemini API
globs: src/lib/ai/**/*, src/features/**/*service.ts, src/features/**/*ai-service.ts
---

# Integración de Inteligencia Artificial - SkillRadar

## 🛠️ Stack IA

- **SDK Principal:** Vercel AI SDK (`ai` y `@ai-sdk/google`).
- **Proveedor Primario:** Google Gemini (ej: `gemini-2.5-flash` o `gemini-1.5-flash`).
- **Proveedor Fallback:** OpenRouter (para contingencia de cuotas y rate limits).

## 🚨 Reglas Críticas de IA

### 1. Evitar Timeout en Servidor (Streaming Obligatorio para Procesos Largos)

Vercel Hobby plan (free tier) tiene un límite estricto de timeout de **10-15 segundos**. El análisis completo de un CV o el cruzado de Job Match suele tardar de 15 a 25 segundos.

- **Solución:** Utilizar **`streamObject`** de Vercel AI SDK para mantener viva la conexión HTTP (Server-Sent Events) y enviar datos progresivamente al frontend en Server Actions de forma fluida.
- **Regla:** Todo proceso evaluador que dure más de 8 segundos _debe_ implementarse mediante streaming con progresividad en la interfaz.

### 2. Structured Outputs vs Prompts "Respondé solo JSON"

No uses prompts planos pidiéndole a la IA "devolveme un formato JSON válido". El modelo puede alucinar, añadir caracteres extra (como markdown blocks ```json) o romper el parser en el servidor.

- **Solución:** Utilizar **`generateObject`** o **`streamObject`** del Vercel AI SDK pasando un schema estricto de **Zod**.
- **Ejemplo de Uso:**

    ```typescript
    import { generateObject } from "ai";
    import { atsAnalysisSchema } from "./types";

    const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: atsAnalysisSchema,
        system: "Actúa como reclutador técnico...",
        prompt: `Analiza: ${cvText}`,
    });
    ```

    Esto restringe la inferencia a nivel de API y garantiza un objeto 100% tipado en TypeScript libre de errores de parseo.

### 3. Resiliencia y Fallbacks de Proveedores

- Si el proveedor principal (Gemini) falla debido a Rate Limits u otros problemas, capturar el error y redirigir la consulta al adaptador de **OpenRouter** de forma transparente al usuario.
- En desarrollo local, proveer un **Modo Simulación Offline (Mock)** inteligente si la variable de entorno `GEMINI_API_KEY` no está configurada, para permitir que otros miembros del equipo puedan prototipar sin depender de API Keys.
