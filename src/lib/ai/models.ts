export const PROVIDER_MODELS: Record<string, Array<{ id: string; name: string }>> = {
    gemini: [
        {
            id: "gemini-3.5-flash",
            name: "Gemini 3.5 Flash (¡Lanzamiento Reciente I/O 2026! - Agentes/Código)",
        },
        {
            id: "gemini-3.1-pro",
            name: "Gemini 3.1 Pro (Razonamiento analítico profundo)",
        },
        {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro (Equilibrio perfecto en código)",
        },
        {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash (Velocidad estándar de la plataforma)",
        },
        { id: "custom", name: "➕ Ingresar ID personalizado..." },
    ],
    openai: [
        {
            id: "gpt-5.5",
            name: "GPT-5.5 (Flagship de Máxima Inteligencia de Frontera 2026)",
        },
        {
            id: "gpt-5.5-instant",
            name: "GPT-5.5 Instant (Prioridad velocidad y baja alucinación)",
        },
        {
            id: "gpt-5.3-codex",
            name: "GPT-5.3 Codex (Especialista avanzado en desarrollo de software)",
        },
        { id: "gpt-4o", name: "GPT-4o (Clásico inteligente multipropósito)" },
        { id: "custom", name: "➕ Ingresar ID personalizado..." },
    ],
    anthropic: [
        {
            id: "claude-4.7-opus",
            name: "Claude Opus 4.7 (¡El modelo más inteligente del mundo en Opus!)",
        },
        {
            id: "claude-4.6-opus",
            name: "Claude Opus 4.6 (Razonamiento profundo ultra-inteligente de Opus)",
        },
        {
            id: "claude-4.6-sonnet",
            name: "Claude Sonnet 4.6 (Equilibrio de alto rendimiento y razonamiento)",
        },
        {
            id: "claude-4.5-haiku",
            name: "Claude Haiku 4.5 (Velocidad extrema y razonamiento ágil)",
        },
        { id: "custom", name: "➕ Ingresar ID personalizado..." },
    ],
    groq: [
        {
            id: "llama-3.3-70b-versatile",
            name: "Llama 3.3 70B (Altamente veloz y capaz)",
        },
        {
            id: "mixtral-8x7b-32768",
            name: "Mixtral 8x7B (MoE de alto rendimiento)",
        },
        { id: "custom", name: "➕ Ingresar ID personalizado..." },
    ],
    openrouter: [
        {
            id: "meta-llama/llama-3.1-70b-instruct:free",
            name: "Llama 3.1 70B Instruct (Gratuito)",
        },
        {
            id: "google/gemini-2.5-flash:free",
            name: "Gemini 2.5 Flash Free (Gratuito)",
        },
        { id: "custom", name: "➕ Ingresar ID personalizado..." },
    ],
};

export function isValidProviderAndModel(provider: string, model: string): boolean {
    const models = PROVIDER_MODELS[provider];
    if (!models) return false;
    if (model === "custom") return true; // allow custom models
    return models.some((m) => m.id === model);
}
