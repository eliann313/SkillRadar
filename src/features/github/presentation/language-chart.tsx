"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LanguageChartProps {
    languages: Record<string, number>;
}

export function LanguageChart({ languages }: LanguageChartProps) {
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);

    const sortedLangs = Object.entries(languages)
        .map(([name, bytes]) => ({
            name,
            bytes,
            percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
            color: getLanguageColor(name),
        }))
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 6); // Top 6 lenguajes

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader>
                <CardTitle className="text-lg">Lenguajes de Programación</CardTitle>
                <CardDescription>Distribución de código en repositorios públicos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {sortedLangs.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">No se detectaron lenguajes.</div>
                ) : (
                    <>
                        {/* Barra de progreso unificada tipo github */}
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                            {sortedLangs.map((lang) => (
                                <div
                                    key={lang.name}
                                    style={{
                                        width: `${lang.percentage}%`,
                                        backgroundColor: lang.color,
                                    }}
                                    className="h-full first:rounded-l-full last:rounded-r-full"
                                    title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
                                />
                            ))}
                        </div>

                        {/* Detalle y porcentajes */}
                        <div className="grid grid-cols-2 gap-4">
                            {sortedLangs.map((lang) => (
                                <div key={lang.name} className="flex items-center gap-2">
                                    <span
                                        className="size-3 rounded-full shrink-0"
                                        style={{ backgroundColor: lang.color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{lang.name}</p>
                                        <p className="text-xs text-muted-foreground">{lang.percentage.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function getLanguageColor(lang: string): string {
    const colors: Record<string, string> = {
        TypeScript: "#3178c6",
        JavaScript: "#f1e05a",
        HTML: "#e34c26",
        CSS: "#563d7c",
        Python: "#3572A5",
        Go: "#00ADD8",
        Rust: "#dea584",
        Java: "#b07219",
        "C++": "#f34b7d",
        C: "#555555",
        PHP: "#4F5D95",
        Ruby: "#701516",
        Shell: "#89e051",
        "C#": "#178600",
    };
    return colors[lang] || "#cccccc";
}
