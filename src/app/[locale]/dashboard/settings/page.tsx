"use client";

import { logger } from "@/infrastructure/logger";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { redirect } from "next/navigation";
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
import { ProfileSettingsCard } from "./profile-settings.card";
import { AiConfigurationCard } from "./ai-configuration.card";
import { PlanUsageCard } from "./plan-usage.card";
import { PublicProfileCard } from "./public-profile.card";
import { AccountTypeCard } from "./account-type.card";
import { NotificationsCard } from "./notifications.card";
import { SecurityDataCard } from "./security-data.card";

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
                <ProfileSettingsCard user={user} />
                <AiConfigurationCard
                    loadingConfig={loadingConfig}
                    apiKeys={apiKeys}
                    onApiKeysChange={(patch) => setApiKeys((prev) => ({ ...prev, ...patch }))}
                    keysStatus={keysStatus}
                    showKeys={showKeys}
                    onToggleVisibility={toggleKeyVisibility}
                    savingKeys={savingKeys}
                    onSaveKeys={(e) => {
                        e.preventDefault();
                        void handleSaveKeys(e);
                    }}
                    onRevoke={(provider, field) => void handleRevokeKey(provider, field)}
                    preferredProvider={preferredProvider}
                    onProviderChange={handleProviderChange}
                    preferredModel={preferredModel}
                    onModelChange={handleModelChange}
                    models={getProviderModels(preferredProvider)}
                    customModelId={customModelId}
                    onCustomModelId={setCustomModelId}
                    isCustomModelSelected={isCustomModelSelected}
                    savingPrefs={savingPrefs}
                    onSavePrefs={(e) => {
                        e.preventDefault();
                        void handleSavePreferences(e);
                    }}
                />
                <PlanUsageCard usage={usage} />
                <PublicProfileCard
                    settings={publicSettings}
                    onChange={(patch) => setPublicSettings((prev) => ({ ...prev, ...patch }))}
                    origin={publicProfileOrigin}
                    saving={savingPublicSettings}
                    onSave={(e) => {
                        e.preventDefault();
                        void handleSavePublicSettings(e);
                    }}
                />
                <AccountTypeCard role={user.role} plan={usage?.plan ?? "free"} />
                <NotificationsCard
                    prefs={{
                        emailNotifications,
                        emailNewApplication,
                        emailApplicationStatusChanged,
                        emailContactUpdates,
                        emailJobMatches,
                    }}
                    onChange={(patch) => {
                        if (patch.emailNotifications !== undefined) setEmailNotifications(patch.emailNotifications);
                        if (patch.emailNewApplication !== undefined) setEmailNewApplication(patch.emailNewApplication);
                        if (patch.emailApplicationStatusChanged !== undefined)
                            setEmailApplicationStatusChanged(patch.emailApplicationStatusChanged);
                        if (patch.emailContactUpdates !== undefined) setEmailContactUpdates(patch.emailContactUpdates);
                        if (patch.emailJobMatches !== undefined) setEmailJobMatches(patch.emailJobMatches);
                    }}
                    role={user.role}
                    saving={savingNotifications}
                    onSave={(e) => {
                        e.preventDefault();
                        void handleSaveNotifications(e);
                    }}
                />
                <SecurityDataCard
                    exportingData={exportingData}
                    onExport={() => void handleExportUserData()}
                    isDeleteModalOpen={isDeleteModalOpen}
                    onDeleteModalChange={setIsDeleteModalOpen}
                    deleteConfirmText={deleteConfirmText}
                    onDeleteConfirmText={setDeleteConfirmText}
                    deletingAccount={deletingAccount}
                    onDeleteAccount={() => void handleDeleteAccount()}
                />
            </div>
        </>
    );
}
