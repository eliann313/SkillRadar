"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface AnalysisCardsProps {
    analysis: {
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
    };
}

export function AnalysisCards({ analysis }: AnalysisCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Fortalezas */}
            <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm shadow-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-500">
                        <CheckCircle2 className="size-4 shrink-0" />
                        Fortalezas Detectadas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {analysis.strengths.map((str, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                                <span className="text-emerald-500 shrink-0">•</span>
                                <span>{str}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Debilidades */}
            <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-sm shadow-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="size-4 shrink-0" />
                        Áreas de Oportunidad
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {analysis.weaknesses.map((weak, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                                <span className="text-amber-500 shrink-0">•</span>
                                <span>{weak}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Sugerencias */}
            <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-sm shadow-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-500">
                        <Lightbulb className="size-4 shrink-0" />
                        Sugerencias de Mejora
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {analysis.suggestions.map((sug, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                                <span className="text-blue-500 shrink-0">•</span>
                                <span>{sug}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
