"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award } from "lucide-react";

interface ScorePoint {
    date: string;
    score: number;
    name: string;
}

interface HistoricalChartProps {
    scores: ScorePoint[];
}

export function HistoricalChart({ scores }: HistoricalChartProps) {
    const hasData = scores && scores.length >= 2;

    // Configuración del SVG
    const width = 500;
    const height = 150;
    const padding = 20;

    // Generar los puntos para el SVG si hay datos
    let points = "";
    let fillPoints = "";
    const svgPoints: { x: number; y: number; score: number; label: string; name: string }[] = [];

    if (hasData) {
        const xStep = (width - padding * 2) / (scores.length - 1);

        scores.forEach((pt, index) => {
            const x = padding + index * xStep;
            // Invertir Y porque el origen (0,0) del SVG está en la esquina superior izquierda
            // El score va de 0 a 100
            const y = height - padding - (pt.score / 100) * (height - padding * 2);

            svgPoints.push({
                x,
                y,
                score: pt.score,
                label: pt.date,
                name: pt.name,
            });

            if (index === 0) {
                points = `${x},${y}`;
                fillPoints = `${x},${height - padding} L${x},${y}`;
            } else {
                points += ` L${x},${y}`;
                fillPoints += ` L${x},${y}`;
            }

            if (index === scores.length - 1) {
                fillPoints += ` L${x},${height - padding} Z`;
            }
        });
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm col-span-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <TrendingUp className="size-4 text-primary" />
                            ATS Score Evolution
                        </CardTitle>
                        <CardDescription>Progression of your CV analysis score over time</CardDescription>
                    </div>
                    {hasData && (
                        <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                            <Award className="size-3" />
                            Latest: {scores[scores.length - 1].score}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col items-center justify-center min-h-[180px]">
                {!hasData ? (
                    <div className="flex flex-col items-center text-center p-6 text-muted-foreground">
                        <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                            <TrendingUp className="size-6 text-muted-foreground/60" />
                        </div>
                        <p className="text-sm font-semibold text-foreground/80 mb-1">Historial no disponible</p>
                        <p className="text-xs max-w-sm">
                            Sube al menos dos versiones de tu CV en la pestaña de CV Analysis para pintar el progreso
                            histórico de optimización.
                        </p>
                    </div>
                ) : (
                    <div className="w-full relative">
                        {/* SVG Chart */}
                        <svg
                            viewBox={`0 0 ${width} ${height}`}
                            className="w-full h-[150px] overflow-visible"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            <line
                                x1={padding}
                                y1={padding}
                                x2={width - padding}
                                y2={padding}
                                className="stroke-border/20 stroke-1"
                                strokeDasharray="4 4"
                            />
                            <line
                                x1={padding}
                                y1={height / 2}
                                x2={width - padding}
                                y2={height / 2}
                                className="stroke-border/20 stroke-1"
                                strokeDasharray="4 4"
                            />
                            <line
                                x1={padding}
                                y1={height - padding}
                                x2={width - padding}
                                y2={height - padding}
                                className="stroke-border/40 stroke-1"
                            />

                            {/* Fill Area */}
                            <path d={fillPoints} fill="url(#chartGradient)" />

                            {/* Polyline path */}
                            <path
                                d={`M ${points}`}
                                fill="none"
                                className="stroke-primary stroke-[2.5]"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Data points */}
                            {svgPoints.map((pt, i) => (
                                <g key={i} className="group cursor-pointer">
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r="5"
                                        className="fill-background stroke-primary stroke-2 transition-all duration-200 group-hover:r-[7] group-hover:fill-primary"
                                    />
                                    <title>{`${pt.name}\nScore: ${pt.score}\nFecha: ${pt.label}`}</title>
                                </g>
                            ))}
                        </svg>

                        {/* X-Axis labels */}
                        <div className="flex justify-between text-[10px] text-muted-foreground px-[15px] mt-2">
                            {scores.map((pt, i) => (
                                <span key={i} className="max-w-[70px] truncate" title={pt.name}>
                                    {pt.date}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
