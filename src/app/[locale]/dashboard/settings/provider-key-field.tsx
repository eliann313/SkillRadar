"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import type { ApiKeyProvider } from "./actions";
import type { ApiKeyField } from "./settings-cards.types";

interface ProviderKeyFieldProps {
    provider: ApiKeyProvider;
    field: ApiKeyField;
    label: string;
    hasKey: boolean;
    value: string;
    onChange: (value: string) => void;
    showValue: boolean;
    onToggleVisibility: () => void;
    emptyPlaceholder: string;
    onRevoke: (provider: ApiKeyProvider, field: ApiKeyField) => void;
}

/** Campo de clave BYOK por proveedor (parametriza los 5 bloques repetidos). */
export function ProviderKeyField({
    provider,
    field,
    label,
    hasKey,
    value,
    onChange,
    showValue,
    onToggleVisibility,
    emptyPlaceholder,
    onRevoke,
}: ProviderKeyFieldProps) {
    const t = useTranslations("Settings");

    return (
        <div className="flex flex-col gap-1.5 relative">
            <div className="flex justify-between items-center">
                <Label htmlFor={field} className="text-xs font-semibold flex items-center gap-1.5">
                    {label}
                    {hasKey ? (
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
                {hasKey && (
                    <button
                        type="button"
                        onClick={() => onRevoke(provider, field)}
                        className="text-[10px] text-destructive hover:underline cursor-pointer"
                    >
                        {t("delete")}
                    </button>
                )}
            </div>
            <div className="relative">
                <Input
                    id={field}
                    type={showValue ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={hasKey ? "••••••••••••••••••••••••••••••••" : emptyPlaceholder}
                    className="pr-10 border-border/60 bg-background/50 focus:border-primary/50 transition-colors"
                />
                <button
                    type="button"
                    onClick={onToggleVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    {showValue ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </div>
        </div>
    );
}
