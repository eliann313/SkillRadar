"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Info } from "lucide-react";
import { ApiKeysCard } from "./api-keys.card";
import { InferencePreferencesCard } from "./inference-preferences.card";
import type { ApiKeyProvider } from "./actions";
import type { ApiKeyField, ApiKeysState, KeysStatusState } from "./settings-cards.types";

interface InferenceModel {
    id: string;
    name: string;
}

interface AiConfigurationCardProps {
    loadingConfig: boolean;
    apiKeys: ApiKeysState;
    onApiKeysChange: (patch: Partial<ApiKeysState>) => void;
    keysStatus: KeysStatusState;
    showKeys: Record<string, boolean>;
    onToggleVisibility: (key: string) => void;
    savingKeys: boolean;
    onSaveKeys: (e: React.FormEvent) => void;
    onRevoke: (provider: ApiKeyProvider, field: ApiKeyField) => void;
    preferredProvider: string;
    onProviderChange: (prov: string) => void;
    preferredModel: string;
    onModelChange: (modelId: string) => void;
    models: InferenceModel[];
    customModelId: string;
    onCustomModelId: (value: string) => void;
    isCustomModelSelected: boolean;
    savingPrefs: boolean;
    onSavePrefs: (e: React.FormEvent) => void;
}

/** Configuración IA: header + keys + preferencias (ex Card de settings/page). */
export function AiConfigurationCard({
    loadingConfig,
    apiKeys,
    onApiKeysChange,
    keysStatus,
    showKeys,
    onToggleVisibility,
    savingKeys,
    onSaveKeys,
    onRevoke,
    preferredProvider,
    onProviderChange,
    preferredModel,
    onModelChange,
    models,
    customModelId,
    onCustomModelId,
    isCustomModelSelected,
    savingPrefs,
    onSavePrefs,
}: AiConfigurationCardProps) {
    const t = useTranslations("Settings");

    return (
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
                        <ApiKeysCard
                            apiKeys={apiKeys}
                            onApiKeysChange={onApiKeysChange}
                            keysStatus={keysStatus}
                            showKeys={showKeys}
                            onToggleVisibility={onToggleVisibility}
                            savingKeys={savingKeys}
                            onSave={onSaveKeys}
                            onRevoke={onRevoke}
                        />
                        <InferencePreferencesCard
                            preferredProvider={preferredProvider}
                            onProviderChange={onProviderChange}
                            preferredModel={preferredModel}
                            onModelChange={onModelChange}
                            models={models}
                            customModelId={customModelId}
                            onCustomModelId={onCustomModelId}
                            isCustomModelSelected={isCustomModelSelected}
                            savingPrefs={savingPrefs}
                            onSave={onSavePrefs}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
