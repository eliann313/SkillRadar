"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

import { getRadarAxisBreakdown, type RadarAxisInfo } from "./skill-radar-chart.utils";

export type { RadarAxisInfo };

export function SkillRadarChart({ keywords, showBreakdown = false }: { keywords: string[]; showBreakdown?: boolean }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) {
        return <div className="h-[260px] w-full bg-muted/10 rounded animate-pulse" />;
    }

    const breakdown = getRadarAxisBreakdown(keywords);
    const data = breakdown.map((b) => ({
        subject: b.subject,
        A: b.score,
        fullMark: 100,
    }));

    return (
        <div className="w-full flex flex-col items-center">
            <div className="h-[260px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid className="stroke-border/30" />
                        <PolarAngleAxis
                            dataKey="subject"
                            stroke="var(--muted-foreground)"
                            fontSize={12}
                            tickSize={10}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            stroke="var(--muted-foreground)"
                            fontSize={9}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="Skills"
                            dataKey="A"
                            stroke="var(--primary)"
                            fill="var(--primary)"
                            fillOpacity={0.25}
                            strokeWidth={2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            {showBreakdown && (
                <div className="w-full pt-3 border-t border-border/30 mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                    {breakdown.map((item) => (
                        <div
                            key={item.subject}
                            className="rounded-md border border-border/40 bg-card/60 p-2 flex flex-col gap-1 text-left"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground text-xs">{item.subject}</span>
                                <span className="text-[11px] font-mono font-bold text-primary">{item.score}%</span>
                            </div>
                            <p
                                className="text-[10px] text-muted-foreground truncate"
                                title={item.matches.join(", ") || "Sin coincidencias directas"}
                            >
                                {item.matches.length > 0 ? item.matches.slice(0, 3).join(", ") : "—"}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
