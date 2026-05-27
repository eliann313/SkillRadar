"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { User as UserIcon, Building, Bell, Shield, Sparkles, Eye, EyeOff, CheckCircle2, Key, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getUserApiKeysStatusAction, saveUserApiKeysAction, saveUserInferencePreferencesAction } from "./actions";

const PRESET_PLACEHOLDER = "__API_KEY_PRESET__";

// Opciones de modelos predefinidos sugeridos por proveedor (Actualizados a Mayo de 2026)
const PROVIDER_MODELS: Record<string, { id: string; name: string }[]> = {
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

export function getProviderModels(prov: string) {
    switch (prov) {
        case "gemini":
            return PROVIDER_MODELS.gemini;
        case "openai":
            return PROVIDER_MODELS.openai;
        case "anthropic":
            return PROVIDER_MODELS.anthropic;
        case "groq":
            return PROVIDER_MODELS.groq;
        case "openrouter":
            return PROVIDER_MODELS.openrouter;
        default:
            return [];
    }
}

export default function SettingsPage() {
    const { data: session, status } = useSession();

    // Estados de carga e interfaz
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [savingKeys, setSavingKeys] = useState(false);
    const [savingPrefs, setSavingPrefs] = useState(false);

    // Estados de Claves de API del usuario
    const [keysStatus, setKeysStatus] = useState({
        hasGeminiKey: false,
        hasGroqKey: false,
        hasOpenrouterKey: false,
        hasOpenaiKey: false,
        hasAnthropicKey: false,
    });

    const [apiKeys, setApiKeys] = useState({
        geminiApiKey: "",
        groqApiKey: "",
        openrouterApiKey: "",
        openaiApiKey: "",
        anthropicApiKey: "",
    });

    // Visibilidad de contraseñas/llaves
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
        gemini: false,
        groq: false,
        openrouter: false,
        openai: false,
        anthropic: false,
    });

    // Preferencias de inferencia
    const [preferredProvider, setPreferredProvider] = useState("gemini");
    const [preferredModel, setPreferredModel] = useState("gemini-2.5-flash");
    const [customModelId, setCustomModelId] = useState("");
    const [isCustomModelSelected, setIsCustomModelSelected] = useState(false);

    const fetchKeysAndPrefs = async () => {
        try {
            const res = await getUserApiKeysStatusAction();

            if (res.success && res.data) {
                const d = res.data;
                setKeysStatus({
                    hasGeminiKey: d.hasGeminiKey,
                    hasGroqKey: d.hasGroqKey,
                    hasOpenrouterKey: d.hasOpenrouterKey,
                    hasOpenaiKey: d.hasOpenaiKey,
                    hasAnthropicKey: d.hasAnthropicKey,
                });

                // Setear placeholders en caso de que ya tengan clave
                setApiKeys({
                    geminiApiKey: d.hasGeminiKey ? PRESET_PLACEHOLDER : "",
                    groqApiKey: d.hasGroqKey ? PRESET_PLACEHOLDER : "",
                    openrouterApiKey: d.hasOpenrouterKey ? PRESET_PLACEHOLDER : "",
                    openaiApiKey: d.hasOpenaiKey ? PRESET_PLACEHOLDER : "",
                    anthropicApiKey: d.hasAnthropicKey ? PRESET_PLACEHOLDER : "",
                });

                // Setear proveedor
                const prov = d.defaultAiProvider || "gemini";
                setPreferredProvider(prov);

                // Validar si el modelo guardado es predefinido o personalizado
                const modelId = d.defaultAiModel || "gemini-2.5-flash";
                const predefinedModels = getProviderModels(prov);
                const isPredefined = predefinedModels.some((m) => m.id === modelId);

                if (isPredefined) {
                    setPreferredModel(modelId);
                    setIsCustomModelSelected(false);
                    setCustomModelId("");
                } else {
                    setPreferredModel("custom");
                    setIsCustomModelSelected(true);
                    setCustomModelId(modelId);
                }
            } else {
                toast.error(res.error || "No se pudieron obtener los datos de configuración.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Ocurrió un error de red al cargar la configuración de IA.");
        } finally {
            setLoadingConfig(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const timer = setTimeout(() => {
                void fetchKeysAndPrefs();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [status, session]);

    if (status === "loading") {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[150px] w-full" />
            </div>
        );
    }

    if (status === "unauthenticated" || !session?.user) {
        redirect("/");
    }

    const user = session.user;

    // Manejador del cambio de proveedor preferido
    const handleProviderChange = (prov: string) => {
        setPreferredProvider(prov);
        const models = getProviderModels(prov);
        // Resetear al primer modelo predefinido del nuevo proveedor
        if (models.length > 0) {
            setPreferredModel(models[0].id);
            setIsCustomModelSelected(false);
            setCustomModelId("");
        }
    };

    // Manejador del cambio de modelo preferido
    const handleModelChange = (modelId: string) => {
        setPreferredModel(modelId);
        if (modelId === "custom") {
            setIsCustomModelSelected(true);
        } else {
            setIsCustomModelSelected(false);
            setCustomModelId("");
        }
    };

    // Guardar las claves de API
    const handleSaveKeys = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingKeys(true);

        try {
            const res = await saveUserApiKeysAction({
                geminiApiKey: apiKeys.geminiApiKey,
                groqApiKey: apiKeys.groqApiKey,
                openrouterApiKey: apiKeys.openrouterApiKey,
                openaiApiKey: apiKeys.openaiApiKey,
                anthropicApiKey: apiKeys.anthropicApiKey,
            });

            if (res.success) {
                toast.success(res.message);
                void fetchKeysAndPrefs(); // Recargar estados
            } else {
                toast.error(res.error || "Ocurrió un error al guardar las claves.");
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : "Error de red al guardar claves.";
            toast.error(errMsg);
        } finally {
            setSavingKeys(false);
        }
    };

    // Guardar las preferencias de inferencia
    const handleSavePreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPrefs(true);

        const modelToSave = isCustomModelSelected ? customModelId : preferredModel;

        if (isCustomModelSelected && !customModelId.trim()) {
            toast.error("Por favor, introduce un ID de modelo personalizado válido.");
            setSavingPrefs(false);
            return;
        }

        try {
            const res = await saveUserInferencePreferencesAction({
                defaultAiProvider: preferredProvider,
                defaultAiModel: modelToSave,
            });

            if (res.success) {
                toast.success(res.message);
                void fetchKeysAndPrefs();
            } else {
                toast.error(res.error || "Ocurrió un error al guardar las preferencias.");
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : "Error de red al guardar las preferencias.";
            toast.error(errMsg);
        } finally {
            setSavingPrefs(false);
        }
    };

    const toggleKeyVisibility = (provider: string) => {
        setShowKeys((prev) => {
            switch (provider) {
                case "gemini":
                    return { ...prev, gemini: !prev.gemini };
                case "groq":
                    return { ...prev, groq: !prev.groq };
                case "openrouter":
                    return { ...prev, openrouter: !prev.openrouter };
                case "openai":
                    return { ...prev, openai: !prev.openai };
                case "anthropic":
                    return { ...prev, anthropic: !prev.anthropic };
                default:
                    return prev;
            }
        });
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage your account settings, API keys and preferences
                </p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Profile Settings */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="size-5 text-primary" />
                            Profile
                        </CardTitle>
                        <CardDescription>Your personal information and profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue={user.name || ""} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue={user.email || ""}
                                    disabled
                                    className="bg-muted/50 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        {user.role === "recruiter" && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="company">Company</Label>
                                <Input id="company" defaultValue="TechCorp" placeholder="Enter your company name" />
                            </div>
                        )}
                        <Button className="w-fit">Save Changes</Button>
                    </CardContent>
                </Card>

                {/* AI CONFIGURATION (MULTI-MODEL SERVICE) - PREMIUM POWER USER BENEFIT */}
                <Card className="border-primary/20 bg-card/40 backdrop-blur-md relative overflow-hidden shadow-lg transition-all duration-300 hover:shadow-primary/5">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Sparkles className="size-20 text-primary animate-pulse" />
                    </div>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-5 text-primary" />
                                <CardTitle>AI Configuration (Multi-Model Service)</CardTitle>
                            </div>
                            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 w-fit self-start sm:self-center transition-colors">
                                ⚡ Power-User Hub
                            </Badge>
                        </div>
                        <CardDescription>
                            Configura tus claves de API personales cifradas del lado del servidor y selecciona modelos
                            premium de vanguardia.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-6">
                        {/* Info alert showcasing bypass rate limiting benefit */}
                        <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/90 backdrop-blur-sm">
                            <Info className="size-5 shrink-0 text-primary mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-semibold text-primary">
                                    ¡Beneficio Pro / Exención de Límites Activo!
                                </p>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    Si configuras tus propias claves API personales, el rate-limiting diario estricto de
                                    la plataforma (Upstash) se <strong>omitirá por completo</strong>. Esto te otorgará
                                    acceso a análisis estructurados ilimitados utilizando tus propios recursos sin
                                    costes para SkillRadar.
                                </p>
                            </div>
                        </div>

                        {loadingConfig ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            <div className="grid gap-6 lg:grid-cols-12">
                                {/* Columna Izquierda: API Keys */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        void handleSaveKeys(e);
                                    }}
                                    className="lg:col-span-7 flex flex-col gap-4 border-r border-border/50 pr-0 lg:pr-6"
                                >
                                    <h3 className="font-semibold text-sm text-foreground/90 flex items-center gap-2 mb-2">
                                        <Key className="size-4 text-primary" />
                                        Tus Claves de API Personales (Cifrado AES-256-GCM)
                                    </h3>

                                    {/* Google Gemini */}
                                    <div className="flex flex-col gap-1.5 relative">
                                        <div className="flex justify-between items-center">
                                            <Label
                                                htmlFor="geminiApiKey"
                                                className="text-xs font-semibold flex items-center gap-1.5"
                                            >
                                                Google Gemini API Key
                                                {keysStatus.hasGeminiKey ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]"
                                                    >
                                                        <CheckCircle2 className="size-2.5 mr-1" /> Configurado
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                                                    >
                                                        No Configurado
                                                    </Badge>
                                                )}
                                            </Label>
                                            {keysStatus.hasGeminiKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setApiKeys((prev) => ({
                                                            ...prev,
                                                            geminiApiKey: "",
                                                        }));
                                                        toast.info(
                                                            "Se vació la clave. Guarda cambios para eliminarla de la base de datos.",
                                                        );
                                                    }}
                                                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="geminiApiKey"
                                                type={showKeys.gemini ? "text" : "password"}
                                                value={apiKeys.geminiApiKey}
                                                onChange={(e) =>
                                                    setApiKeys((prev) => ({
                                                        ...prev,
                                                        geminiApiKey: e.target.value,
                                                    }))
                                                }
                                                placeholder={
                                                    keysStatus.hasGeminiKey
                                                        ? "••••••••••••••••••••••••••••••••"
                                                        : "AIzaSy..."
                                                }
                                                className="pr-10 border-border/60 bg-background/50 focus:border-primary/50 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleKeyVisibility("gemini")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            >
                                                {showKeys.gemini ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* OpenAI */}
                                    <div className="flex flex-col gap-1.5 relative">
                                        <div className="flex justify-between items-center">
                                            <Label
                                                htmlFor="openaiApiKey"
                                                className="text-xs font-semibold flex items-center gap-1.5"
                                            >
                                                OpenAI API Key
                                                {keysStatus.hasOpenaiKey ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]"
                                                    >
                                                        <CheckCircle2 className="size-2.5 mr-1" /> Configurado
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                                                    >
                                                        No Configurado
                                                    </Badge>
                                                )}
                                            </Label>
                                            {keysStatus.hasOpenaiKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setApiKeys((prev) => ({
                                                            ...prev,
                                                            openaiApiKey: "",
                                                        }));
                                                        toast.info(
                                                            "Se vació la clave. Guarda cambios para eliminarla.",
                                                        );
                                                    }}
                                                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="openaiApiKey"
                                                type={showKeys.openai ? "text" : "password"}
                                                value={apiKeys.openaiApiKey}
                                                onChange={(e) =>
                                                    setApiKeys((prev) => ({
                                                        ...prev,
                                                        openaiApiKey: e.target.value,
                                                    }))
                                                }
                                                placeholder={
                                                    keysStatus.hasOpenaiKey
                                                        ? "••••••••••••••••••••••••••••••••"
                                                        : "sk-proj-..."
                                                }
                                                className="pr-10 border-border/60 bg-background/50 focus:border-primary/50 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleKeyVisibility("openai")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            >
                                                {showKeys.openai ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Anthropic */}
                                    <div className="flex flex-col gap-1.5 relative">
                                        <div className="flex justify-between items-center">
                                            <Label
                                                htmlFor="anthropicApiKey"
                                                className="text-xs font-semibold flex items-center gap-1.5"
                                            >
                                                Anthropic API Key
                                                {keysStatus.hasAnthropicKey ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]"
                                                    >
                                                        <CheckCircle2 className="size-2.5 mr-1" /> Configurado
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                                                    >
                                                        No Configurado
                                                    </Badge>
                                                )}
                                            </Label>
                                            {keysStatus.hasAnthropicKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setApiKeys((prev) => ({
                                                            ...prev,
                                                            anthropicApiKey: "",
                                                        }));
                                                        toast.info(
                                                            "Se vació la clave. Guarda cambios para eliminarla.",
                                                        );
                                                    }}
                                                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="anthropicApiKey"
                                                type={showKeys.anthropic ? "text" : "password"}
                                                value={apiKeys.anthropicApiKey}
                                                onChange={(e) =>
                                                    setApiKeys((prev) => ({
                                                        ...prev,
                                                        anthropicApiKey: e.target.value,
                                                    }))
                                                }
                                                placeholder={
                                                    keysStatus.hasAnthropicKey
                                                        ? "••••••••••••••••••••••••••••••••"
                                                        : "sk-ant-..."
                                                }
                                                className="pr-10 border-border/60 bg-background/50 focus:border-primary/50 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleKeyVisibility("anthropic")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            >
                                                {showKeys.anthropic ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Groq */}
                                    <div className="flex flex-col gap-1.5 relative">
                                        <div className="flex justify-between items-center">
                                            <Label
                                                htmlFor="groqApiKey"
                                                className="text-xs font-semibold flex items-center gap-1.5"
                                            >
                                                Groq API Key
                                                {keysStatus.hasGroqKey ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]"
                                                    >
                                                        <CheckCircle2 className="size-2.5 mr-1" /> Configurado
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                                                    >
                                                        No Configurado
                                                    </Badge>
                                                )}
                                            </Label>
                                            {keysStatus.hasGroqKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setApiKeys((prev) => ({ ...prev, groqApiKey: "" }));
                                                        toast.info(
                                                            "Se vació la clave. Guarda cambios para eliminarla.",
                                                        );
                                                    }}
                                                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="groqApiKey"
                                                type={showKeys.groq ? "text" : "password"}
                                                value={apiKeys.groqApiKey}
                                                onChange={(e) =>
                                                    setApiKeys((prev) => ({
                                                        ...prev,
                                                        groqApiKey: e.target.value,
                                                    }))
                                                }
                                                placeholder={
                                                    keysStatus.hasGroqKey
                                                        ? "••••••••••••••••••••••••••••••••"
                                                        : "gsk_..."
                                                }
                                                className="pr-10 border-border/60 bg-background/50 focus:border-primary/50 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleKeyVisibility("groq")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            >
                                                {showKeys.groq ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* OpenRouter */}
                                    <div className="flex flex-col gap-1.5 relative">
                                        <div className="flex justify-between items-center">
                                            <Label
                                                htmlFor="openrouterApiKey"
                                                className="text-xs font-semibold flex items-center gap-1.5"
                                            >
                                                OpenRouter API Key
                                                {keysStatus.hasOpenrouterKey ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]"
                                                    >
                                                        <CheckCircle2 className="size-2.5 mr-1" /> Configurado
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                                                    >
                                                        No Configurado
                                                    </Badge>
                                                )}
                                            </Label>
                                            {keysStatus.hasOpenrouterKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setApiKeys((prev) => ({
                                                            ...prev,
                                                            openrouterApiKey: "",
                                                        }));
                                                        toast.info(
                                                            "Se vació la clave. Guarda cambios para eliminarla.",
                                                        );
                                                    }}
                                                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="openrouterApiKey"
                                                type={showKeys.openrouter ? "text" : "password"}
                                                value={apiKeys.openrouterApiKey}
                                                onChange={(e) =>
                                                    setApiKeys((prev) => ({
                                                        ...prev,
                                                        openrouterApiKey: e.target.value,
                                                    }))
                                                }
                                                placeholder={
                                                    keysStatus.hasOpenrouterKey
                                                        ? "••••••••••••••••••••••••••••••••"
                                                        : "sk-or-..."
                                                }
                                                className="pr-10 border-border/60 bg-background/50 focus:border-primary/50 transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleKeyVisibility("openrouter")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            >
                                                {showKeys.openrouter ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={savingKeys}
                                        className="w-fit mt-4 relative overflow-hidden transition-all duration-300 active:scale-95"
                                    >
                                        {savingKeys ? (
                                            <>
                                                <span className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                                                Guardando Llaves...
                                            </>
                                        ) : (
                                            "Guardar Claves de API"
                                        )}
                                    </Button>
                                </form>

                                {/* Columna Derecha: Preferencias de Inferencia */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        void handleSavePreferences(e);
                                    }}
                                    className="lg:col-span-5 flex flex-col gap-4 pl-0 lg:pl-6"
                                >
                                    <h3 className="font-semibold text-sm text-foreground/90 flex items-center gap-2 mb-2">
                                        <Sparkles className="size-4 text-primary" />
                                        Preferencias de Inferencia Activa
                                    </h3>

                                    {/* Selector de Proveedor */}
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="preferredProvider" className="text-xs font-semibold">
                                            Proveedor de Inferencia Preferido
                                        </Label>
                                        <select
                                            id="preferredProvider"
                                            value={preferredProvider}
                                            onChange={(e) => handleProviderChange(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-border/60 bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="gemini">Google Gemini</option>
                                            <option value="openai">OpenAI (Solo con clave propia)</option>
                                            <option value="anthropic">Anthropic (Solo con clave propia)</option>
                                            <option value="groq">Groq (Llama-3)</option>
                                            <option value="openrouter">OpenRouter (Híbrido multiproveedor)</option>
                                        </select>
                                    </div>

                                    {/* Selector de Modelo */}
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="preferredModel" className="text-xs font-semibold">
                                            Modelo Preferido
                                        </Label>
                                        <select
                                            id="preferredModel"
                                            value={preferredModel}
                                            onChange={(e) => handleModelChange(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-border/60 bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {getProviderModels(preferredProvider).map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Input animado de Modelo Personalizado (aparece si se selecciona custom) */}
                                    {isCustomModelSelected && (
                                        <div className="flex flex-col gap-1.5 animate-in slide-in-from-top duration-300 ease-out">
                                            <Label
                                                htmlFor="customModelId"
                                                className="text-xs font-semibold text-primary"
                                            >
                                                Escribe el ID del Modelo Oficial Personalizado
                                            </Label>
                                            <Input
                                                id="customModelId"
                                                value={customModelId}
                                                onChange={(e) => setCustomModelId(e.target.value)}
                                                placeholder="Ej. claude-4.7-opus, gpt-5.5-preview, gemini-3.5-pro"
                                                className="border-primary/45 bg-primary/5 focus:border-primary transition-colors text-sm"
                                                required
                                            />
                                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                                                Ingresa el ID del modelo oficial según el proveedor seleccionado (por
                                                ejemplo, en OpenAI puedes usar <code>o1-pro</code> o{" "}
                                                <code>gpt-5.5</code> cuando estén disponibles).
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={savingPrefs}
                                        className="w-fit mt-4 relative overflow-hidden transition-all duration-300 active:scale-95 bg-primary hover:bg-primary/95 text-primary-foreground"
                                    >
                                        {savingPrefs ? (
                                            <>
                                                <span className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                                                Guardando Preferencias...
                                            </>
                                        ) : (
                                            "Guardar Preferencias"
                                        )}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Account Type */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="size-5 text-primary" />
                            Account Type
                        </CardTitle>
                        <CardDescription>Your current plan and role</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="capitalize">
                                    {user.role}
                                </Badge>
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Free Plan</Badge>
                            </div>
                            <Button variant="outline">Upgrade to Pro</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="size-5 text-primary" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Configure how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-foreground">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Receive updates about your analyses and matches
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                Configure
                            </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-foreground">Weekly Digest</p>
                                <p className="text-sm text-muted-foreground">
                                    Get a summary of your activity every week
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                Configure
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="size-5 text-primary" />
                            Security
                        </CardTitle>
                        <CardDescription>Manage your security settings</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-foreground">Connected Accounts</p>
                                <p className="text-sm text-muted-foreground">Manage your linked social accounts</p>
                            </div>
                            <Button variant="outline" size="sm">
                                Manage
                            </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-foreground">Delete Account</p>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                            <Button variant="destructive" size="sm">
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
