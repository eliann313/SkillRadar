"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award } from "lucide-react";
import { useTranslations } from "next-intl";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface ScorePoint {
    date: string;
    score: number;
    name: string;
}

interface HistoricalChartProps {
    scores: ScorePoint[];
}

export function HistoricalChart({ scores }: HistoricalChartProps) {
    const t = useTranslations("Dashboard");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const hasData = scores && scores.length >= 2;

    if (!mounted) {
        return <div className="h-[180px] w-full bg-muted/10 rounded animate-pulse" />;
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm col-span-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <TrendingUp className="size-4 text-primary" />
                            {t("atsEvolution", { default: "ATS Score Evolution" })}
                        </CardTitle>
                        <CardDescription>
                            {t("atsEvolutionDesc", { default: "Progression of your CV analysis score over time" })}
                        </CardDescription>
                    </div>
                    {hasData && (
                        <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                            <Award className="size-3" />
                            {t("latest", { default: "Latest" })}: {scores[scores.length - 1].score}
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
                        <p className="text-sm font-semibold text-foreground/80 mb-1">
                            {t("historyNotAvailable", { default: "Historial no disponible" })}
                        </p>
                        <p className="text-xs max-w-sm">
                            {t("historyDesc", {
                                default:
                                    "Sube al menos dos versiones de tu CV en la pestaña de CV Analysis para pintar el progreso histórico de optimización.",
                            })}
                        </p>
                    </div>
                ) : (
                    <div className="h-[150px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={scores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="historicalColorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--muted-foreground)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    stroke="var(--muted-foreground)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-5}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--popover)",
                                        borderColor: "var(--border)",
                                        borderRadius: "var(--radius)",
                                        color: "var(--popover-foreground)",
                                        fontSize: "12px",
                                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                    }}
                                    labelStyle={{ fontWeight: "bold" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    name="Score ATS"
                                    stroke="var(--primary)"
                                    fillOpacity={1}
                                    fill="url(#historicalColorScore)"
                                    strokeWidth={2.5}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
