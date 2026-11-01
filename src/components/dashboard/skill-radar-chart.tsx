"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

import { getRadarAxisBreakdown } from "./skill-radar-chart.utils";

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
        <div className="@container w-full max-w-full overflow-hidden flex flex-col items-center">
            <div className="h-[260px] w-full max-w-full overflow-hidden flex items-center justify-center min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
                        <PolarGrid className="stroke-border/30" />
                        <PolarAngleAxis dataKey="subject" stroke="var(--muted-foreground)" fontSize={11} tickSize={8} />
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
                <div className="w-full max-w-full overflow-hidden pt-3 border-t border-border/30 mt-2 grid grid-cols-2 sm:grid-cols-3 @[340px]:grid-cols-3 @[560px]:grid-cols-5 gap-2 text-xs">
                    {breakdown.map((item) => (
                        <div
                            key={item.subject}
                            className="rounded-md border border-border/40 bg-card/60 p-2 flex flex-col gap-1 text-left min-w-0 overflow-hidden"
                        >
                            <div className="flex justify-between items-center gap-1.5 min-w-0">
                                <span className="font-semibold text-foreground text-xs truncate" title={item.subject}>
                                    {item.subject}
                                </span>
                                <span className="text-[11px] font-mono font-bold text-primary shrink-0">
                                    {item.score}%
                                </span>
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
