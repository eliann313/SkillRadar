"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Copy, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { PublicSettingsState } from "./settings-cards.types";

interface PublicProfileCardProps {
    settings: PublicSettingsState;
    onChange: (patch: Partial<PublicSettingsState>) => void;
    origin: string;
    saving: boolean;
    onSave: (e: React.FormEvent) => void;
}

/** Perfil público + badge (ex bloque de settings/page). */
export function PublicProfileCard({ settings, onChange, origin, saving, onSave }: PublicProfileCardProps) {
    const t = useTranslations("Settings");

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="size-5 text-primary" />
                    {t("publicProfileTitle")}
                </CardTitle>
                <CardDescription>{t("publicProfileDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSave} className="flex flex-col gap-6">
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
                                checked={settings.isPublicProfile}
                                onChange={(e) => onChange({ isPublicProfile: e.target.checked })}
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
                                {origin ? `${origin.replace(/^https?:\/\//, "")}/u/` : "skillradar.app/u/"}
                            </span>
                            <Input
                                id="publicUsername"
                                value={settings.publicUsername}
                                onChange={(e) => onChange({ publicUsername: e.target.value })}
                                placeholder="tu-nombre-de-usuario"
                                className="max-w-xs border-border/60 bg-background/50 focus:border-primary/50 text-sm"
                                required={settings.isPublicProfile}
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">{t("usernameRule")}</p>
                    </div>

                    {settings.isPublicProfile && (
                        <div className="flex flex-col gap-4 border-t border-border/50 pt-4 animate-in fade-in duration-300">
                            <h3 className="font-semibold text-xs text-foreground/90 uppercase tracking-wider">
                                {t("visibleDataTitle")}
                            </h3>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <label className="flex items-center gap-3 rounded-lg border border-border/45 bg-background/20 p-3 hover:bg-background/40 transition-colors cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={settings.showSkills}
                                        onChange={(e) => onChange({ showSkills: e.target.checked })}
                                        className="size-4 rounded border-border/60 text-primary focus:ring-primary"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium">{t("showSkills")}</span>
                                        <span className="text-[10px] text-muted-foreground">{t("showSkillsDesc")}</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 rounded-lg border border-border/45 bg-background/20 p-3 hover:bg-background/40 transition-colors cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={settings.showGithub}
                                        onChange={(e) => onChange({ showGithub: e.target.checked })}
                                        className="size-4 rounded border-border/60 text-primary focus:ring-primary"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium">{t("showGithub")}</span>
                                        <span className="text-[10px] text-muted-foreground">{t("showGithubDesc")}</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 rounded-lg border border-border/45 bg-background/20 p-3 hover:bg-background/40 transition-colors cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={settings.showSeniority}
                                        onChange={(e) => onChange({ showSeniority: e.target.checked })}
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

                            {settings.publicUsername && (
                                <div className="flex flex-col gap-4 border-t border-border/50 pt-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                                            <Share2 className="size-3.5" /> {t("publicLinkLabel")}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                readOnly
                                                value={`${origin}/u/${settings.publicUsername}`}
                                                className="bg-muted/50 border-border/60 text-sm select-all cursor-default"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    void navigator.clipboard.writeText(
                                                        `${origin}/u/${settings.publicUsername}`,
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
                                                value={`[![SkillRadar](${origin}/api/badge/${settings.publicUsername})](${origin}/u/${settings.publicUsername})`}
                                                className="bg-muted/50 border-border/60 text-sm select-all cursor-default font-mono text-xs"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    void navigator.clipboard.writeText(
                                                        `[![SkillRadar](${origin}/api/badge/${settings.publicUsername})](${origin}/u/${settings.publicUsername})`,
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

                                        <div className="mt-3 p-3 rounded-lg border border-border/40 bg-background/25 flex flex-col items-center gap-2">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                {t("badgePreview")}
                                            </span>
                                            <div className="max-w-full overflow-x-auto p-1 bg-white dark:bg-card border border-border/20 rounded-md">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`${origin}/api/badge/${settings.publicUsername}`}
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
                        disabled={saving}
                        className="w-fit relative overflow-hidden transition-all duration-300 active:scale-95"
                    >
                        {saving ? (
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
    );
}
