export const PROVIDER_MODELS: Record<string, Array<{ id: string; name: string }>> = {
    gemini: [
        {
            id: "gemini-3.8-flash",
            name: "Gemini 3.8 Flash (Recomendado - Flagship rápido y preciso)",
        },
        {
            id: "gemini-3.7-flash",
            name: "Gemini 3.7 Flash (Equilibrio y estabilidad)",
        },
        {
            id: "gemini-3.5-flash-lite",
            name: "Gemini 3.5 Flash-Lite (Velocidad extrema y bajo costo)",
        },
        {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro Preview (Razonamiento analítico profundo)",
        },
        { id: "custom", name: "➕ Ingresar ID personalizado..." },
    ],
    openai: [
        {
            id: "gpt-6.1-sol",
            name: "GPT-6.1 Sol (Flagship 2026 - trabajo complejo)",
        },
        {
            id: "gpt-6-luna",
            name: "GPT-6 Luna (Flagship 2026 - rápido y económico)",
        },
        {
            id: "gpt-6-astra",
            name: "GPT-6 Astra (Máxima capacidad)",
        },
        { id: "custom", name: "➕ Ingresar ID personalizado..." },
    ],
    anthropic: [
        {
            id: "claude-opus-5-5",
            name: "Claude Opus 5.5 (Recomendado - agentes y código)",
        },
        {
            id: "claude-sonnet-5.5",
            name: "Claude Sonnet 5.5 (Equilibrio perfecto velocidad/inteligencia)",
        },
        {
            id: "claude-haiku-5.5",
            name: "Claude Haiku 5.5 (Velocidad extrema y bajo costo)",
        },
        {
            id: "claude-fable-5-1",
            name: "Claude Fable 5.1 (Top - agentes largos)",
        },
        {
            id: "claude-sonnet-5",
            name: "Claude Sonnet 5 (Equilibrio velocidad/inteligencia)",
        },
        {
            id: "claude-haiku-4-5",
            name: "Claude Haiku 4.5 (Velocidad extrema)",
        },
        { id: "custom", name: "➕ Ingresar ID personalizado..." },
    ],
    groq: [
        {
            id: "llama-3.3-70b-versatile",
            name: "Llama 3.3 70B Versatile (Recomendado Groq - alta capacidad)",
        },
        {
            id: "llama-3.1-8b-instant",
            name: "Llama 3.1 8B Instant (Ultra rápido y eficiente)",
        },
        {
            id: "qwen/qwen3-32b",
            name: "Qwen3 32B (Rápido y capaz)",
        },
        {
            id: "deepseek-r1-distill-llama-70b",
            name: "DeepSeek R1 Distill Llama 70B (Razonamiento)",
        },
        { id: "custom", name: "➕ Ingresar ID personalizado..." },
    ],
    openrouter: [
        {
            id: "openrouter/free",
            name: "OpenRouter Free (Router gratuito automático)",
        },
        {
            id: "meta-llama/llama-3.3-70b-instruct:free",
            name: "Llama 3.3 70B Instruct Free (Gratuito)",
        },
        {
            id: "deepseek/deepseek-r1:free",
            name: "DeepSeek R1 Free (Razonamiento gratuito)",
        },
        {
            id: "google/gemini-3.8-flash",
            name: "Gemini 3.8 Flash vía OpenRouter",
        },
        {
            id: "google/gemini-3.7-flash",
            name: "Gemini 3.7 Flash vía OpenRouter",
        },
        {
            id: "meta-llama/llama-3.3-70b-instruct",
            name: "Llama 3.3 70B Instruct (Alta precisión)",
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
