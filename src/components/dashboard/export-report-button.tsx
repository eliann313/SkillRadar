"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";

interface ExportReportButtonProps {
    resumes: Array<{ fileName: string; atsScore: number | null; createdAt: string }>;
    averageScore: number;
    totalMatches: number;
    closedSkills: string[];
}

export function ExportReportButton({ resumes, averageScore, totalMatches, closedSkills }: ExportReportButtonProps) {
    const t = useTranslations("Progress");
    const [exporting, setExporting] = useState(false);

    const handleExport = () => {
        setExporting(true);
        try {
            const lines = [
                `# SkillRadar — ${t("title")}`,
                ``,
                `- ${t("cardAverage")}: ${averageScore}/100`,
                `- ${t("cardMatches")}: ${totalMatches}`,
                `- ${t("closedSkillsTitle")}: ${closedSkills.length > 0 ? closedSkills.join(", ") : "—"}`,
                ``,
                `## ${t("versionsTitle")}`,
                ...resumes.map(
                    (r) => `- ${r.fileName}: ${r.atsScore ?? "—"}/100 (${new Date(r.createdAt).toLocaleDateString()})`,
                ),
            ];
            const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "skillradar-progress.md";
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="gap-1.5">
            <Download className="size-4" aria-hidden />
            {t("exportReport", { default: "Exportar reporte" })}
        </Button>
    );
}
