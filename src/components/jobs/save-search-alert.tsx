"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveSearchAction } from "@/features/saved-searches/application/saved-searches.use-cases";

/**
 * Guarda los filtros actuales del Job Board como alerta (búsqueda guardada).
 * Vive en components/ a propósito: features/jobs no puede importar de
 * features/saved-searches (regla hex-no-feature-to-feature).
 */
export function SaveSearchAlert({
    search,
    remoteType,
    seniorityLevel,
    field,
}: {
    search: string;
    remoteType: string;
    seniorityLevel: string;
    field: string;
}) {
    const t = useTranslations("Jobs");
    const [alertName, setAlertName] = useState("");
    const [savingAlert, setSavingAlert] = useState(false);

    const handleSaveAlert = async () => {
        const name = alertName.trim();
        if (name.length < 2) {
            toast.error(t("alertNameRequired", { default: "Poné un nombre a la alerta (mín. 2 caracteres)." }));
            return;
        }
        setSavingAlert(true);
        try {
            const res = await saveSearchAction({
                name: name.slice(0, 60),
                scope: "job_board",
                filters: {
                    query: search || undefined,
                    remoteType: remoteType !== "all" ? remoteType : undefined,
                    seniorityLevel: seniorityLevel !== "all" ? seniorityLevel : undefined,
                    field: field !== "all" ? field : undefined,
                },
            });
            if (res.success) {
                toast.success(t("alertSaved", { default: "Alerta guardada. Te avisaremos ante nuevas ofertas." }));
                setAlertName("");
            } else {
                toast.error(res.error || t("alertSaveError", { default: "No se pudo guardar la alerta." }));
            }
        } finally {
            setSavingAlert(false);
        }
    };

    return (
        <span className="ml-auto flex items-center gap-1.5">
            <Input
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
                placeholder={t("alertNamePh", { default: "Nombre de la alerta…" })}
                className="h-7 w-40 text-xs"
                maxLength={60}
            />
            <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={savingAlert}
                onClick={() => void handleSaveAlert()}
                title={t("alertSaveHint", {
                    default: "Guardar filtros actuales y recibir avisos de nuevas ofertas",
                })}
            >
                {t("alertSave", { default: "Crear alerta" })}
            </Button>
        </span>
    );
}
