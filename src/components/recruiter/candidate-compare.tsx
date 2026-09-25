"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { TalentCard } from "@/lib/types";

export function CandidateCompare({
    talents,
    open,
    onOpenChange,
}: {
    talents: TalentCard[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const allSkills = Array.from(new Set(talents.flatMap((t) => t.topSkills))).slice(0, 12);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-popover text-popover-foreground">
                <DialogHeader>
                    <DialogTitle>Comparador ({talents.length})</DialogTitle>
                </DialogHeader>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-xs">
                        <thead>
                            <tr className="border-b border-border text-left text-muted-foreground">
                                <th className="py-2 pr-3 font-semibold">Criterio</th>
                                {talents.map((t) => (
                                    <th key={t.id} className="py-2 pr-3 font-mono font-semibold text-foreground">
                                        {t.contactStatus === "accepted" && t.name ? t.name : t.anonymousId}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-border/50">
                                <td className="py-2 pr-3 text-muted-foreground">Match</td>
                                {talents.map((t) => (
                                    <td key={t.id} className="py-2 pr-3 font-bold text-primary">
                                        {t.averageScore}%
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-border/50">
                                <td className="py-2 pr-3 text-muted-foreground">Seniority</td>
                                {talents.map((t) => (
                                    <td key={t.id} className="py-2 pr-3 capitalize">
                                        {t.estimatedSeniority}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-border/50">
                                <td className="py-2 pr-3 text-muted-foreground">Estado</td>
                                {talents.map((t) => (
                                    <td key={t.id} className="py-2 pr-3">
                                        <Badge variant="outline" className="text-[10px]">
                                            {t.contactStatus ?? "none"}
                                        </Badge>
                                    </td>
                                ))}
                            </tr>
                            {allSkills.map((skill) => (
                                <tr key={skill} className="border-b border-border/30">
                                    <td className="py-1.5 pr-3 text-muted-foreground">{skill}</td>
                                    {talents.map((t) => (
                                        <td key={t.id} className="py-1.5 pr-3 text-center">
                                            {t.topSkills.includes(skill) ? (
                                                <span className="text-emerald">●</span>
                                            ) : (
                                                <span className="text-muted-foreground/30">○</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td className="py-2 pr-3 align-top text-muted-foreground">Justificación IA</td>
                                {talents.map((t) => (
                                    <td key={t.id} className="max-w-[220px] py-2 pr-3 align-top leading-relaxed">
                                        {t.justification ? t.justification.slice(0, 220) : "Sin justificación todavía."}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
