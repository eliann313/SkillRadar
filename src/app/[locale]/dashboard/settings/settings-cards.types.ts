"use client";

import type { ApiKeyProvider } from "./actions";

/** Tipos compartidos de las settings cards (split de settings/page, deuda). */

export interface SettingsUser {
    name?: string | null;
    email?: string | null;
    role?: string;
}

export interface ApiKeysState {
    geminiApiKey: string;
    groqApiKey: string;
    openrouterApiKey: string;
    openaiApiKey: string;
    anthropicApiKey: string;
}

export type ApiKeyField = keyof ApiKeysState;

export interface KeysStatusState {
    hasGeminiKey: boolean;
    hasGroqKey: boolean;
    hasOpenrouterKey: boolean;
    hasOpenaiKey: boolean;
    hasAnthropicKey: boolean;
}

export interface ProviderKeyDef {
    provider: ApiKeyProvider;
    field: ApiKeyField;
    label: string;
    hasKey: boolean;
    showKey: string;
    emptyPlaceholder: string;
}

export interface PublicSettingsState {
    isPublicProfile: boolean;
    publicUsername: string;
    showSkills: boolean;
    showGithub: boolean;
    showSeniority: boolean;
}

interface UsageQuota {
    key: string;
    limit: number;
    remaining: number;
    reset: number;
    unlimited?: boolean;
}

export interface UsageState {
    plan: "free" | "byok";
    quotas: UsageQuota[];
}
