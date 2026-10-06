"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Shield } from "lucide-react";

interface SecurityDataCardProps {
    exportingData: boolean;
    onExport: () => void;
    isDeleteModalOpen: boolean;
    onDeleteModalChange: (open: boolean) => void;
    deleteConfirmText: string;
    onDeleteConfirmText: (value: string) => void;
    deletingAccount: boolean;
    onDeleteAccount: () => void;
}

/** Portabilidad GDPR + derecho al olvido con modal (ex bloque de settings/page). */
export function SecurityDataCard({
    exportingData,
    onExport,
    isDeleteModalOpen,
    onDeleteModalChange,
    deleteConfirmText,
    onDeleteConfirmText,
    deletingAccount,
    onDeleteAccount,
}: SecurityDataCardProps) {
    const t = useTranslations("Settings");

    return (
        <>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="size-5 text-primary" />
                        {t("securityTitle")}
                    </CardTitle>
                    <CardDescription>{t("securityDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">{t("dataPortability")}</p>
                            <p className="text-sm text-muted-foreground">{t("dataPortabilityDesc")}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={onExport} disabled={exportingData}>
                            {exportingData ? t("exporting") : t("exportData")}
                        </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground text-destructive">{t("deleteAccountTitle")}</p>
                            <p className="text-sm text-muted-foreground">{t("deleteAccountDesc")}</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => onDeleteModalChange(true)}>
                            {t("deleteAccount")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDeleteModalOpen} onOpenChange={onDeleteModalChange}>
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
                                onChange={(e) => onDeleteConfirmText(e.target.value)}
                                className="border-destructive/40 focus:border-destructive text-sm"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                onDeleteModalChange(false);
                                onDeleteConfirmText("");
                            }}
                            disabled={deletingAccount}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onDeleteAccount}
                            disabled={deletingAccount || deleteConfirmText !== t("deleteConfirmWord")}
                        >
                            {deletingAccount ? t("deletingAccount") : t("deleteAccountPermanent")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
