"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";

interface NotificationPrefs {
    emailNotifications: boolean;
    emailNewApplication: boolean;
    emailApplicationStatusChanged: boolean;
    emailContactUpdates: boolean;
    emailJobMatches: boolean;
}

interface NotificationsCardProps {
    prefs: NotificationPrefs;
    onChange: (patch: Partial<NotificationPrefs>) => void;
    role?: string;
    saving: boolean;
    onSave: (e: React.FormEvent) => void;
}

/** Preferencias de notificaciones por email (ex bloque de settings/page). */
export function NotificationsCard({ prefs, onChange, role, saving, onSave }: NotificationsCardProps) {
    const t = useTranslations("Settings");

    const row = (
        id: string,
        checked: boolean,
        onCheckedChange: (checked: boolean) => void,
        titleKey: string,
        descKey: string,
    ) => (
        <div className="flex items-start gap-3">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onCheckedChange(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border/60 text-primary focus:ring-primary cursor-pointer"
            />
            <div className="space-y-0.5">
                <Label htmlFor={id} className="text-xs font-semibold cursor-pointer">
                    {t(titleKey)}
                </Label>
                <p className="text-[10px] text-muted-foreground">{t(descKey)}</p>
            </div>
        </div>
    );

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="size-5 text-primary" />
                    {t("notificationsTitle")}
                </CardTitle>
                <CardDescription>{t("notificationsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSave} className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/30 p-4">
                        <input
                            type="checkbox"
                            id="emailNotifications"
                            checked={prefs.emailNotifications}
                            onChange={(e) => onChange({ emailNotifications: e.target.checked })}
                            className="mt-1 size-5 rounded border-border/60 text-primary focus:ring-primary cursor-pointer"
                        />
                        <div className="space-y-0.5">
                            <Label htmlFor="emailNotifications" className="text-sm font-semibold cursor-pointer">
                                {t("enableEmailNotifications")}
                            </Label>
                            <p className="text-xs text-muted-foreground">{t("enableEmailNotificationsDesc")}</p>
                        </div>
                    </div>

                    {prefs.emailNotifications && (
                        <div className="pl-6 space-y-4 border-l-2 border-border/60 ml-2.5 animate-in fade-in duration-200">
                            {role === "recruiter" &&
                                row(
                                    "emailNewApplication",
                                    prefs.emailNewApplication,
                                    (v) => onChange({ emailNewApplication: v }),
                                    "newApplications",
                                    "newApplicationsDesc",
                                )}
                            {role === "developer" &&
                                row(
                                    "emailApplicationStatusChanged",
                                    prefs.emailApplicationStatusChanged,
                                    (v) => onChange({ emailApplicationStatusChanged: v }),
                                    "statusChanges",
                                    "statusChangesDesc",
                                )}
                            {row(
                                "emailContactUpdates",
                                prefs.emailContactUpdates,
                                (v) => onChange({ emailContactUpdates: v }),
                                "contactReplies",
                                "contactRepliesDesc",
                            )}
                            {role === "developer" &&
                                row(
                                    "emailJobMatches",
                                    prefs.emailJobMatches,
                                    (v) => onChange({ emailJobMatches: v }),
                                    "jobMatches",
                                    "jobMatchesDesc",
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
                                {t("savingPreferences")}
                            </>
                        ) : (
                            t("saveNotificationPrefs")
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
