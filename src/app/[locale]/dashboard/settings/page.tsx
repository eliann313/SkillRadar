"use client";

import { logger } from "@/infrastructure/logger";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    User as UserIcon,
    Building,
    Bell,
    Shield,
    Sparkles,
    Eye,
    EyeOff,
    CheckCircle2,
    Key,
    Info,
    Globe,
    Share2,
    Copy,
    FileText,
    Gauge,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    getUserApiKeysStatusAction,
    saveUserApiKeysAction,
    deleteUserApiKeyAction,
    getMyUsageAction,
    type ApiKeyProvider,
    saveUserInferencePreferencesAction,
    getUserPublicProfileSettingsAction,
    updateUserPublicProfileSettingsAction,
    deleteAccountAction,
    exportUserDataAction,
    saveUserNotificationPreferencesAction,
} from "./actions";

import { API_KEY_PRESET_PLACEHOLDER } from "@/infrastructure/crypto";
import { PROVIDER_MODELS } from "@/infrastructure/ai/models";
import { Progress } from "@/components/ui/progress";

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
    const t = useTranslations("Settings");

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

    // Uso del plan (Fase 5)
    const [usage, setUsage] = useState<{
        plan: "free" | "byok";
        quotas: Array<{ key: string; limit: number; remaining: number; reset: number; unlimited?: boolean }>;
    } | null>(null);

    const QUOTA_LABEL_KEYS: Record<string, string> = {
        "cv-analysis": "quotaCvAnalysis",
        "job-match": "quotaJobMatch",
        "github-analysis": "quotaGithubAnalysis",
        "ai-sourcing": "quotaAiSourcing",
        "ai-chat": "quotaAiChat",
        "job-postings": "quotaJobPostings",
        "job-applications": "quotaJobApplications",
        writes: "quotaWrites",
    };

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
    const [preferredModel, setPreferredModel] = useState("gemini-3.8-flash");
    const [customModelId, setCustomModelId] = useState("");
    const [isCustomModelSelected, setIsCustomModelSelected] = useState(false);

    // Estados de Perfil Público
    const [publicSettings, setPublicSettings] = useState({
        isPublicProfile: false,
        publicUsername: "",
        showSkills: true,
        showGithub: true,
        showSeniority: true,
    });
    const [savingPublicSettings, setSavingPublicSettings] = useState(false);
    const [publicProfileOrigin, setPublicProfileOrigin] = useState("");

    // Estados para Preferencias de Notificaciones por Email
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [emailNewApplication, setEmailNewApplication] = useState(true);
    const [emailApplicationStatusChanged, setEmailApplicationStatusChanged] = useState(true);
    const [emailContactUpdates, setEmailContactUpdates] = useState(true);
    const [emailJobMatches, setEmailJobMatches] = useState(true);
    const [savingNotifications, setSavingNotifications] = useState(false);

    // Estados para Eliminación de Cuenta
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deletingAccount, setDeletingAccount] = useState(false);

    // Estado para Exportación de Datos
    const [exportingData, setExportingData] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof window !== "undefined") {
                setPublicProfileOrigin(window.location.origin);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const fetchKeysAndPrefs = useCallback(async () => {
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
                    geminiApiKey: d.hasGeminiKey ? API_KEY_PRESET_PLACEHOLDER : "",
                    groqApiKey: d.hasGroqKey ? API_KEY_PRESET_PLACEHOLDER : "",
                    openrouterApiKey: d.hasOpenrouterKey ? API_KEY_PRESET_PLACEHOLDER : "",
                    openaiApiKey: d.hasOpenaiKey ? API_KEY_PRESET_PLACEHOLDER : "",
                    anthropicApiKey: d.hasAnthropicKey ? API_KEY_PRESET_PLACEHOLDER : "",
                });

                // Setear proveedor
                const prov = d.defaultAiProvider || "gemini";
                setPreferredProvider(prov);

                // Validar si el modelo guardado es predefinido o personalizado
                const modelId = d.defaultAiModel || "gemini-3.8-flash";
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

                // Setear preferencias de notificaciones
                setEmailNotifications(d.emailNotifications !== undefined ? d.emailNotifications : true);
                setEmailNewApplication(d.emailNewApplication !== undefined ? d.emailNewApplication : true);
                setEmailApplicationStatusChanged(
                    d.emailApplicationStatusChanged !== undefined ? d.emailApplicationStatusChanged : true,
                );
                setEmailContactUpdates(d.emailContactUpdates !== undefined ? d.emailContactUpdates : true);
                setEmailJobMatches(d.emailJobMatches !== undefined ? d.emailJobMatches : true);
            } else {
                toast.error(res.error || t("fetchConfigError"));
            }

            // Cargar configuración de perfil público
            const publicRes = await getUserPublicProfileSettingsAction();
            if (publicRes.success && publicRes.data) {
                setPublicSettings({
                    isPublicProfile: publicRes.data.isPublicProfile,
                    publicUsername: publicRes.data.publicUsername || "",
                    showSkills: publicRes.data.showSkills,
                    showGithub: publicRes.data.showGithub,
                    showSeniority: publicRes.data.showSeniority,
                });
            }
            // Cargar uso del plan
            const usageRes = await getMyUsageAction();
            if (usageRes.success && usageRes.data) {
                setUsage(usageRes.data);
            }
        } catch (e) {
            logger.error(e);
            toast.error(t("networkLoadError"));
        } finally {
            setLoadingConfig(false);
        }
    }, [
        t,
        setKeysStatus,
        setApiKeys,
        setPreferredProvider,
        setPreferredModel,
        setIsCustomModelSelected,
        setCustomModelId,
        setEmailNotifications,
        setEmailNewApplication,
        setEmailApplicationStatusChanged,
        setEmailContactUpdates,
        setEmailJobMatches,
        setPublicSettings,
        setLoadingConfig,
        setUsage,
    ]);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const timer = setTimeout(() => {
                void fetchKeysAndPrefs();
            }, 0);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [status, session, fetchKeysAndPrefs]);

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
                toast.error(res.error || t("saveKeysError"));
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : t("networkSaveKeysError");
            toast.error(errMsg);
        } finally {
            setSavingKeys(false);
        }
    };

    // Revoca inmediatamente la clave BYOK de un proveedor (Fase 1).
    const handleRevokeKey = async (
        provider: ApiKeyProvider,
        field: "geminiApiKey" | "groqApiKey" | "openrouterApiKey" | "openaiApiKey" | "anthropicApiKey",
    ) => {
        try {
            const res = await deleteUserApiKeyAction(provider);
            if (res.success) {
                setApiKeys((prev) => ({ ...prev, [field]: "" }));
                toast.success(t("keyRevoked"));
                void fetchKeysAndPrefs(); // Recargar estados
            } else {
                toast.error(res.error || t("keyRevokeError"));
            }
        } catch {
            toast.error(t("keyRevokeError"));
        }
    };

    // Guardar las preferencias de inferencia
    const handleSavePreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPrefs(true);

        const modelToSave = isCustomModelSelected ? customModelId : preferredModel;

        if (isCustomModelSelected && !customModelId.trim()) {
            toast.error(t("customModelRequired"));
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
                toast.error(res.error || t("savePrefsError"));
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : t("networkSavePrefsError");
            toast.error(errMsg);
        } finally {
            setSavingPrefs(false);
        }
    };

    // Guardar la configuración del perfil público
    const handleSavePublicSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPublicSettings(true);

        try {
            const res = await updateUserPublicProfileSettingsAction({
                isPublicProfile: publicSettings.isPublicProfile,
                publicUsername: publicSettings.publicUsername,
                showSkills: publicSettings.showSkills,
                showGithub: publicSettings.showGithub,
                showSeniority: publicSettings.showSeniority,
            });

            if (res.success) {
                toast.success(res.message || t("publicSettingsUpdated"));
                // Recargar
                const publicRes = await getUserPublicProfileSettingsAction();
                if (publicRes.success && publicRes.data) {
                    setPublicSettings({
                        isPublicProfile: publicRes.data.isPublicProfile,
                        publicUsername: publicRes.data.publicUsername || "",
                        showSkills: publicRes.data.showSkills,
                        showGithub: publicRes.data.showGithub,
                        showSeniority: publicRes.data.showSeniority,
                    });
                }
            } else {
                toast.error(res.error || t("saveConfigError"));
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : t("savePublicProfileError");
            toast.error(errMsg);
        } finally {
            setSavingPublicSettings(false);
        }
    };

    // Guardar las preferencias de notificaciones
    const handleSaveNotifications = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingNotifications(true);

        try {
            const res = await saveUserNotificationPreferencesAction({
                emailNotifications,
                emailNewApplication,
                emailApplicationStatusChanged,
                emailContactUpdates,
                emailJobMatches,
            });

            if (res.success) {
                toast.success(res.message || t("notificationPrefsSaved"));
            } else {
                toast.error(res.error || t("saveNotificationPrefsError"));
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : t("saveNotificationsError");
            toast.error(errMsg);
        } finally {
            setSavingNotifications(false);
        }
    };

    // Exportar todos los datos personales del usuario (GDPR)
    const handleExportUserData = async () => {
        setExportingData(true);
        try {
            const res = await exportUserDataAction();
            if (res.success) {
                const dataStr = JSON.stringify(res.data, null, 2);
                const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
                const exportFileDefaultName = `skillradar_user_${session?.user?.name || "data"}_gdpr.json`;

                const linkElement = document.createElement("a");
                linkElement.setAttribute("href", dataUri);
                linkElement.setAttribute("download", exportFileDefaultName);
                linkElement.click();
                toast.success(t("dataExported"));
            } else {
                toast.error(res.error || t("exportDataError"));
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : t("networkExportError");
            toast.error(errMsg);
        } finally {
            setExportingData(false);
        }
    };

    // Eliminar la cuenta permanentemente
    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== t("deleteConfirmWord")) {
            toast.error(t("deleteConfirmRequired"));
            return;
        }

        setDeletingAccount(true);
        try {
            const res = await deleteAccountAction();
            if (res.success) {
                toast.success(t("accountDeleted"));
                setIsDeleteModalOpen(false);
                // Cerrar sesión y redirigir
                await signOut({ callbackUrl: "/" });
            } else {
                toast.error(res.error || t("deleteAccountError"));
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : t("deleteAccountNetworkError");
            toast.error(errMsg);
        } finally {
            setDeletingAccount(false);
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
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Profile Settings */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="size-5 text-primary" />
                            {t("profileTitle")}
                        </CardTitle>
                        <CardDescription>{t("profileDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="name">{t("fullName")}</Label>
                                <Input id="name" defaultValue={user.name || ""} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">{t("email")}</Label>
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
                                <Label htmlFor="company">{t("company")}</Label>
                                <Input id="company" defaultValue="TechCorp" placeholder={t("companyPlaceholder")} />
                            </div>
                        )}
                        <Button className="w-fit">{t("saveChanges")}</Button>
                    </CardContent>
                </Card>

                {/* CV Version Management (Developer only) */}
                {user.role === "developer" && (
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="size-5 text-emerald-500" />
                                {t("resumesTitle")}
                            </CardTitle>
                            <CardDescription>{t("resumesDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/settings/resumes">
                                <Button variant="secondary" className="gap-2">
                                    <FileText className="size-4" />
                                    {t("manageResumes")}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* AI CONFIGURATION (MULTI-MODEL SERVICE) - PREMIUM POWER USER BENEFIT */}
                <Card className="border-primary/20 bg-card/40 backdrop-blur-md relative overflow-hidden shadow-lg transition-all duration-300 hover:shadow-primary/5">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Sparkles className="size-20 text-primary animate-pulse" />
                    </div>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-5 text-primary" />
                                <CardTitle>{t("aiConfigTitle")}</CardTitle>
                            </div>
                            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 w-fit self-start sm:self-center transition-colors">
                                {t("powerUserHub")}
                            </Badge>
                        </div>
                        <CardDescription>{t("aiConfigDesc")}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-6">
                        {/* Info alert showcasing bypass rate limiting benefit */}
                        <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/90 backdrop-blur-sm">
                            <Info className="size-5 shrink-0 text-primary mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-semibold text-primary">{t("proBenefitTitle")}</p>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    {t("proBenefitDescPrefix")} <strong>{t("proBenefitDescStrong")}</strong>
                                    {t("proBenefitDescSuffix")}
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
                                        {t("apiKeysTitle")}
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
                                                        <CheckCircle2 className="size-2.5 mr-1" /> {t("configured")}
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                                                    >
                                                        {t("notConfigured")}
                                                    </Badge>
                                                )}
                                            </Label>
                                            {keysStatus.hasGeminiKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleRevokeKey("gemini", "geminiApiKey")}
                                                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                                                >
                                                    {t("delete")}
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
                                                        <CheckCircle2 className="size-2.5 mr-1" /> {t("configured")}
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                                                    >
                                                        {t("notConfigured")}
                                                    </Badge>
                                                )}
                                            </Label>
                                            {keysStatus.hasOpenaiKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleRevokeKey("openai", "openaiApiKey")}
                                                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                                                >
                                                    {t("delete")}
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
                                                        <CheckCircle2 className="size-2.5 mr-1" /> {t("configured")}
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                                                    >
                                                        {t("notConfigured")}
                                                    </Badge>
                                                )}
                                            </Label>
                                            {keysStatus.hasAnthropicKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleRevokeKey("anthropic", "anthropicApiKey")}
                                                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                                                >
                                                    {t("delete")}
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
                                                        <CheckCircle2 className="size-2.5 mr-1" /> {t("configured")}
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                                                    >
                                                        {t("notConfigured")}
                                                    </Badge>
                                                )}
                                            </Label>
                                            {keysStatus.hasGroqKey && (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleRevokeKey("groq", "groqApiKey")}
                                                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                                                >
                                                    {t("delete")}
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
                                                        <CheckCircle2 className="size-2.5 mr-1" /> {t("configured")}
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                                                    >
                                                        {t("notConfigured")}
                                                    </Badge>
                                                )}
                                            </Label>
                                            {keysStatus.hasOpenrouterKey && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleRevokeKey("openrouter", "openrouterApiKey")
                                                    }
                                                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                                                >
                                                    {t("delete")}
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
                                                {t("savingKeys")}
                                            </>
                                        ) : (
                                            t("saveApiKeys")
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
                                        {t("inferencePrefsTitle")}
                                    </h3>

                                    {/* Selector de Proveedor */}
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="preferredProvider" className="text-xs font-semibold">
                                            {t("preferredProvider")}
                                        </Label>
                                        <select
                                            id="preferredProvider"
                                            value={preferredProvider}
                                            onChange={(e) => handleProviderChange(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-border/60 bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="gemini">{t("providerGemini")}</option>
                                            <option value="openai">{t("providerOpenai")}</option>
                                            <option value="anthropic">{t("providerAnthropic")}</option>
                                            <option value="groq">{t("providerGroq")}</option>
                                            <option value="openrouter">{t("providerOpenrouter")}</option>
                                        </select>
                                    </div>

                                    {/* Selector de Modelo */}
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="preferredModel" className="text-xs font-semibold">
                                            {t("preferredModel")}
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
                                                {t("customModelLabel")}
                                            </Label>
                                            <Input
                                                id="customModelId"
                                                value={customModelId}
                                                onChange={(e) => setCustomModelId(e.target.value)}
                                                placeholder={t("customModelPlaceholder")}
                                                className="border-primary/45 bg-primary/5 focus:border-primary transition-colors text-sm"
                                                required
                                            />
                                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                                                {t("customModelHelpPrefix")} <code>gpt-6-sol</code>{" "}
                                                {t("customModelHelpOr")} <code>gpt-6-luna</code>
                                                {t("customModelHelpSuffix")}
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
                                                {t("savingPreferences")}
                                            </>
                                        ) : (
                                            t("savePreferences")
                                        )}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Uso del Plan (Fase 5) */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gauge className="size-5 text-primary" />
                            {t("usageTitle")}
                            {usage ? (
                                <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">
                                    {usage.plan === "byok" ? t("planByok") : t("planFree")}
                                </Badge>
                            ) : null}
                        </CardTitle>
                        <CardDescription>{t("usageDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!usage ? (
                            <p className="text-xs text-muted-foreground">{t("usageLoading")}</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {usage.quotas.map((q) => {
                                    const used = q.limit - q.remaining;
                                    const pct = q.limit > 0 ? Math.min(100, Math.round((used / q.limit) * 100)) : 0;
                                    return (
                                        <div key={q.key} className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium text-foreground">
                                                    {t(QUOTA_LABEL_KEYS[q.key] ?? q.key)}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {q.unlimited === true ? (
                                                        t("usageUnlimited")
                                                    ) : (
                                                        <>
                                                            {q.remaining}/{q.limit} · {t("usageResets")}{" "}
                                                            {new Date(q.reset).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                            <Progress value={q.unlimited === true ? 0 : pct} className="h-1.5" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Perfil Público Compartible (Growth & Viral Loop) */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="size-5 text-primary" />
                            {t("publicProfileTitle")}
                        </CardTitle>
                        <CardDescription>{t("publicProfileDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                void handleSavePublicSettings(e);
                            }}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/30 p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        {t("enablePublicProfile")}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">{t("enablePublicProfileDesc")}</p>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isPublicProfile"
                                        checked={publicSettings.isPublicProfile}
                                        onChange={(e) =>
                                            setPublicSettings((prev) => ({
                                                ...prev,
                                                isPublicProfile: e.target.checked,
                                            }))
                                        }
                                        className="size-5 rounded border-border/60 text-primary focus:ring-primary cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="publicUsername" className="text-xs font-semibold">
                                    {t("publicUsername")}
                                </Label>
                                <div className="flex gap-2">
                                    <span className="flex items-center h-9 rounded-md border border-border/60 bg-muted/30 px-3 text-sm text-muted-foreground select-none">
                                        {publicProfileOrigin
                                            ? `${publicProfileOrigin.replace(/^https?:\/\//, "")}/u/`
                                            : "skillradar.app/u/"}
                                    </span>
                                    <Input
                                        id="publicUsername"
                                        value={publicSettings.publicUsername}
                                        onChange={(e) =>
                                            setPublicSettings((prev) => ({ ...prev, publicUsername: e.target.value }))
                                        }
                                        placeholder="tu-nombre-de-usuario"
                                        className="max-w-xs border-border/60 bg-background/50 focus:border-primary/50 text-sm"
                                        required={publicSettings.isPublicProfile}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                                    {t("usernameRule")}
                                </p>
                            </div>

                            {publicSettings.isPublicProfile && (
                                <div className="flex flex-col gap-4 border-t border-border/50 pt-4 animate-in fade-in duration-300">
                                    <h3 className="font-semibold text-xs text-foreground/90 uppercase tracking-wider">
                                        {t("visibleDataTitle")}
                                    </h3>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <label className="flex items-center gap-3 rounded-lg border border-border/45 bg-background/20 p-3 hover:bg-background/40 transition-colors cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={publicSettings.showSkills}
                                                onChange={(e) =>
                                                    setPublicSettings((prev) => ({
                                                        ...prev,
                                                        showSkills: e.target.checked,
                                                    }))
                                                }
                                                className="size-4 rounded border-border/60 text-primary focus:ring-primary"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium">{t("showSkills")}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {t("showSkillsDesc")}
                                                </span>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 rounded-lg border border-border/45 bg-background/20 p-3 hover:bg-background/40 transition-colors cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={publicSettings.showGithub}
                                                onChange={(e) =>
                                                    setPublicSettings((prev) => ({
                                                        ...prev,
                                                        showGithub: e.target.checked,
                                                    }))
                                                }
                                                className="size-4 rounded border-border/60 text-primary focus:ring-primary"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium">{t("showGithub")}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {t("showGithubDesc")}
                                                </span>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 rounded-lg border border-border/45 bg-background/20 p-3 hover:bg-background/40 transition-colors cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={publicSettings.showSeniority}
                                                onChange={(e) =>
                                                    setPublicSettings((prev) => ({
                                                        ...prev,
                                                        showSeniority: e.target.checked,
                                                    }))
                                                }
                                                className="size-4 rounded border-border/60 text-primary focus:ring-primary"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium">{t("showSeniority")}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {t("showSeniorityDesc")}
                                                </span>
                                            </div>
                                        </label>
                                    </div>

                                    {publicSettings.publicUsername && (
                                        <div className="flex flex-col gap-4 border-t border-border/50 pt-4">
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                                                    <Share2 className="size-3.5" /> {t("publicLinkLabel")}
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        readOnly
                                                        value={`${publicProfileOrigin}/u/${publicSettings.publicUsername}`}
                                                        className="bg-muted/50 border-border/60 text-sm select-all cursor-default"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            void navigator.clipboard.writeText(
                                                                `${publicProfileOrigin}/u/${publicSettings.publicUsername}`,
                                                            );
                                                            toast.success(t("linkCopied"));
                                                        }}
                                                        className="flex items-center gap-1.5 px-3"
                                                    >
                                                        <Copy className="size-3.5" />
                                                        {t("copy")}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                                                    <Sparkles className="size-3.5" /> {t("badgeLabel")}
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        readOnly
                                                        value={`[![SkillRadar](${publicProfileOrigin}/api/badge/${publicSettings.publicUsername})](${publicProfileOrigin}/u/${publicSettings.publicUsername})`}
                                                        className="bg-muted/50 border-border/60 text-sm select-all cursor-default font-mono text-xs"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            void navigator.clipboard.writeText(
                                                                `[![SkillRadar](${publicProfileOrigin}/api/badge/${publicSettings.publicUsername})](${publicProfileOrigin}/u/${publicSettings.publicUsername})`,
                                                            );
                                                            toast.success(t("markdownCopied"));
                                                        }}
                                                        className="flex items-center gap-1.5 px-3"
                                                    >
                                                        <Copy className="size-3.5" />
                                                        {t("copy")}
                                                    </Button>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    {t("badgeHelpPrefix")} <code>README.md</code> {t("badgeHelpSuffix")}
                                                </p>

                                                {/* Previsualización del Badge */}
                                                <div className="mt-3 p-3 rounded-lg border border-border/40 bg-background/25 flex flex-col items-center gap-2">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                        {t("badgePreview")}
                                                    </span>
                                                    <div className="max-w-full overflow-x-auto p-1 bg-white dark:bg-card border border-border/20 rounded-md">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={`${publicProfileOrigin}/api/badge/${publicSettings.publicUsername}`}
                                                            alt={t("badgePreviewAlt")}
                                                            className="max-h-24 h-auto"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={savingPublicSettings}
                                className="w-fit relative overflow-hidden transition-all duration-300 active:scale-95"
                            >
                                {savingPublicSettings ? (
                                    <>
                                        <span className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                                        {t("savingProfile")}
                                    </>
                                ) : (
                                    t("savePublicSettings")
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Account Type */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="size-5 text-primary" />
                            {t("accountTypeTitle")}
                        </CardTitle>
                        <CardDescription>{t("accountTypeDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="capitalize">
                                    {user.role}
                                </Badge>
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                                    {t("freePlan")}
                                </Badge>
                            </div>
                            <Link href="/#pricing">
                                <Button variant="outline">{t("upgradeToPro")}</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="size-5 text-primary" />
                            {t("notificationsTitle")}
                        </CardTitle>
                        <CardDescription>{t("notificationsDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                void handleSaveNotifications(e);
                            }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/30 p-4">
                                <input
                                    type="checkbox"
                                    id="emailNotifications"
                                    checked={emailNotifications}
                                    onChange={(e) => setEmailNotifications(e.target.checked)}
                                    className="mt-1 size-5 rounded border-border/60 text-primary focus:ring-primary cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                    <Label
                                        htmlFor="emailNotifications"
                                        className="text-sm font-semibold cursor-pointer"
                                    >
                                        {t("enableEmailNotifications")}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">{t("enableEmailNotificationsDesc")}</p>
                                </div>
                            </div>

                            {emailNotifications && (
                                <div className="pl-6 space-y-4 border-l-2 border-border/60 ml-2.5 animate-in fade-in duration-200">
                                    {user.role === "recruiter" && (
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="emailNewApplication"
                                                checked={emailNewApplication}
                                                onChange={(e) => setEmailNewApplication(e.target.checked)}
                                                className="mt-0.5 size-4 rounded border-border/60 text-primary focus:ring-primary cursor-pointer"
                                            />
                                            <div className="space-y-0.5">
                                                <Label
                                                    htmlFor="emailNewApplication"
                                                    className="text-xs font-semibold cursor-pointer"
                                                >
                                                    {t("newApplications")}
                                                </Label>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {t("newApplicationsDesc")}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {user.role === "developer" && (
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="emailApplicationStatusChanged"
                                                checked={emailApplicationStatusChanged}
                                                onChange={(e) => setEmailApplicationStatusChanged(e.target.checked)}
                                                className="mt-0.5 size-4 rounded border-border/60 text-primary focus:ring-primary cursor-pointer"
                                            />
                                            <div className="space-y-0.5">
                                                <Label
                                                    htmlFor="emailApplicationStatusChanged"
                                                    className="text-xs font-semibold cursor-pointer"
                                                >
                                                    {t("statusChanges")}
                                                </Label>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {t("statusChangesDesc")}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="emailContactUpdates"
                                            checked={emailContactUpdates}
                                            onChange={(e) => setEmailContactUpdates(e.target.checked)}
                                            className="mt-0.5 size-4 rounded border-border/60 text-primary focus:ring-primary cursor-pointer"
                                        />
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="emailContactUpdates"
                                                className="text-xs font-semibold cursor-pointer"
                                            >
                                                {t("contactReplies")}
                                            </Label>
                                            <p className="text-[10px] text-muted-foreground">
                                                {t("contactRepliesDesc")}
                                            </p>
                                        </div>
                                    </div>

                                    {user.role === "developer" && (
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="emailJobMatches"
                                                checked={emailJobMatches}
                                                onChange={(e) => setEmailJobMatches(e.target.checked)}
                                                className="mt-0.5 size-4 rounded border-border/60 text-primary focus:ring-primary cursor-pointer"
                                            />
                                            <div className="space-y-0.5">
                                                <Label
                                                    htmlFor="emailJobMatches"
                                                    className="text-xs font-semibold cursor-pointer"
                                                >
                                                    {t("jobMatches")}
                                                </Label>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {t("jobMatchesDesc")}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={savingNotifications}
                                className="w-fit relative overflow-hidden transition-all duration-300 active:scale-95"
                            >
                                {savingNotifications ? (
                                    <>
                                        <span className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                                        {t("savingPreferences")}
                                    </>
                                ) : (
                                    t("saveNotificationPrefs")
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Security & Data Portability */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="size-5 text-primary" />
                            {t("securityTitle")}
                        </CardTitle>
                        <CardDescription>{t("securityDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {/* GDPR Data Portability (Export) */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-foreground">{t("dataPortability")}</p>
                                <p className="text-sm text-muted-foreground">{t("dataPortabilityDesc")}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    void handleExportUserData();
                                }}
                                disabled={exportingData}
                            >
                                {exportingData ? t("exporting") : t("exportData")}
                            </Button>
                        </div>
                        <Separator />
                        {/* GDPR Right to be Forgotten (Delete) */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-foreground text-destructive">
                                    {t("deleteAccountTitle")}
                                </p>
                                <p className="text-sm text-muted-foreground">{t("deleteAccountDesc")}</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                                {t("deleteAccount")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Modal de Confirmación de Eliminación de Cuenta */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="max-w-md bg-popover text-popover-foreground">
                        <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2 font-bold">
                                <Shield className="size-5" />
                                {t("deleteModalTitle")}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                {t("deleteModalDescPrefix")} <strong>{t("deleteModalDescStrong")}</strong>
                                {t("deleteModalDescSuffix")}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="delete-confirm-input" className="text-xs font-semibold">
                                    {t("deleteConfirmLabelPrefix")}{" "}
                                    <span className="font-bold text-destructive">{t("deleteConfirmWord")}</span>{" "}
                                    {t("deleteConfirmLabelSuffix")}
                                </Label>
                                <Input
                                    id="delete-confirm-input"
                                    placeholder={t("deleteConfirmWord")}
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="border-destructive/40 focus:border-destructive text-sm"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteConfirmText("");
                                }}
                                disabled={deletingAccount}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    void handleDeleteAccount();
                                }}
                                disabled={deletingAccount || deleteConfirmText !== t("deleteConfirmWord")}
                            >
                                {deletingAccount ? t("deletingAccount") : t("deleteAccountPermanent")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
