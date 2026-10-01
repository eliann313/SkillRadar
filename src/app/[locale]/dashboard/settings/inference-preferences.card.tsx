"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

interface InferenceModel {
    id: string;
    name: string;
}

interface InferencePreferencesCardProps {
    preferredProvider: string;
    onProviderChange: (prov: string) => void;
    preferredModel: string;
    onModelChange: (modelId: string) => void;
    models: InferenceModel[];
    customModelId: string;
    onCustomModelId: (value: string) => void;
    isCustomModelSelected: boolean;
    savingPrefs: boolean;
    onSave: (e: React.FormEvent) => void;
}

/** Preferencias de inferencia (ex columna derecha de settings/page). */
export function InferencePreferencesCard({
    preferredProvider,
    onProviderChange,
    preferredModel,
    onModelChange,
    models,
    customModelId,
    onCustomModelId,
    isCustomModelSelected,
    savingPrefs,
    onSave,
}: InferencePreferencesCardProps) {
    const t = useTranslations("Settings");

    return (
        <form onSubmit={onSave} className="lg:col-span-5 flex flex-col gap-4 pl-0 lg:pl-6">
            <h3 className="font-semibold text-sm text-foreground/90 flex items-center gap-2 mb-2">
                <Sparkles className="size-4 text-primary" />
                {t("inferencePrefsTitle")}
            </h3>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="preferredProvider" className="text-xs font-semibold">
                    {t("preferredProvider")}
                </Label>
                <select
                    id="preferredProvider"
                    value={preferredProvider}
                    onChange={(e) => onProviderChange(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-border/60 bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="gemini">{t("providerGemini")}</option>
                    <option value="openai">{t("providerOpenai")}</option>
                    <option value="anthropic">{t("providerAnthropic")}</option>
                    <option value="groq">{t("providerGroq")}</option>
                    <option value="openrouter">{t("providerOpenrouter")}</option>
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="preferredModel" className="text-xs font-semibold">
                    {t("preferredModel")}
                </Label>
                <select
                    id="preferredModel"
                    value={preferredModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-border/60 bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {models.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name}
                        </option>
                    ))}
                </select>
            </div>

            {isCustomModelSelected && (
                <div className="flex flex-col gap-1.5 animate-in slide-in-from-top duration-300 ease-out">
                    <Label htmlFor="customModelId" className="text-xs font-semibold text-primary">
                        {t("customModelLabel")}
                    </Label>
                    <Input
                        id="customModelId"
                        value={customModelId}
                        onChange={(e) => onCustomModelId(e.target.value)}
                        placeholder={t("customModelPlaceholder")}
                        className="border-primary/45 bg-primary/5 focus:border-primary transition-colors text-sm"
                        required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                        {t("customModelHelpPrefix")} <code>gpt-6-sol</code> {t("customModelHelpOr")}{" "}
                        <code>gpt-6-luna</code>
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
    );
}
