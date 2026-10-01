"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import { ProviderKeyField } from "./provider-key-field";
import type { ApiKeyProvider } from "./actions";
import type { ApiKeyField, ApiKeysState, KeysStatusState, ProviderKeyDef } from "./settings-cards.types";

const PROVIDERS: ProviderKeyDef[] = [
    {
        provider: "gemini",
        field: "geminiApiKey",
        label: "Google Gemini API Key",
        hasKey: false,
        showKey: "gemini",
        emptyPlaceholder: "AIzaSy...",
    },
    {
        provider: "openai",
        field: "openaiApiKey",
        label: "OpenAI API Key",
        hasKey: false,
        showKey: "openai",
        emptyPlaceholder: "sk-proj-...",
    },
    {
        provider: "anthropic",
        field: "anthropicApiKey",
        label: "Anthropic API Key",
        hasKey: false,
        showKey: "anthropic",
        emptyPlaceholder: "sk-ant-...",
    },
    {
        provider: "groq",
        field: "groqApiKey",
        label: "Groq API Key",
        hasKey: false,
        showKey: "groq",
        emptyPlaceholder: "gsk_...",
    },
    {
        provider: "openrouter",
        field: "openrouterApiKey",
        label: "OpenRouter API Key",
        hasKey: false,
        showKey: "openrouter",
        emptyPlaceholder: "sk-or-...",
    },
];

const HAS_KEY_BY_FIELD: Record<ApiKeyField, keyof KeysStatusState> = {
    geminiApiKey: "hasGeminiKey",
    openaiApiKey: "hasOpenaiKey",
    anthropicApiKey: "hasAnthropicKey",
    groqApiKey: "hasGroqKey",
    openrouterApiKey: "hasOpenrouterKey",
};

interface ApiKeysCardProps {
    apiKeys: ApiKeysState;
    onApiKeysChange: (patch: Partial<ApiKeysState>) => void;
    keysStatus: KeysStatusState;
    showKeys: Record<string, boolean>;
    onToggleVisibility: (key: string) => void;
    savingKeys: boolean;
    onSave: (e: React.FormEvent) => void;
    onRevoke: (provider: ApiKeyProvider, field: ApiKeyField) => void;
}

/** Form de claves BYOK (ex bloque de settings/page; 5 providers parametrizados). */
export function ApiKeysCard({
    apiKeys,
    onApiKeysChange,
    keysStatus,
    showKeys,
    onToggleVisibility,
    savingKeys,
    onSave,
    onRevoke,
}: ApiKeysCardProps) {
    const t = useTranslations("Settings");

    return (
        <form onSubmit={onSave} className="lg:col-span-7 flex flex-col gap-4 border-r border-border/50 pr-0 lg:pr-6">
            <h3 className="font-semibold text-sm text-foreground/90 flex items-center gap-2 mb-2">
                <Key className="size-4 text-primary" />
                {t("apiKeysTitle")}
            </h3>

            {PROVIDERS.map((p) => (
                <ProviderKeyField
                    key={p.provider}
                    provider={p.provider}
                    field={p.field}
                    label={p.label}
                    hasKey={keysStatus[HAS_KEY_BY_FIELD[p.field]]}
                    value={apiKeys[p.field]}
                    onChange={(value) => onApiKeysChange({ [p.field]: value })}
                    showValue={showKeys[p.showKey] === true}
                    onToggleVisibility={() => onToggleVisibility(p.showKey)}
                    emptyPlaceholder={p.emptyPlaceholder}
                    onRevoke={onRevoke}
                />
            ))}

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
    );
}
