"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const EJE_KEYWORDS = {
    Frontend: [
        "react",
        "next.js",
        "nextjs",
        "vue",
        "angular",
        "svelte",
        "html",
        "css",
        "tailwind",
        "javascript",
        "typescript",
        "ui",
        "ux",
        "redux",
        "zustand",
        "sass",
        "bootstrap",
    ],
    Backend: [
        "node",
        "nodejs",
        "express",
        "nestjs",
        "python",
        "django",
        "flask",
        "fastapi",
        "go",
        "golang",
        "ruby",
        "rails",
        "java",
        "spring",
        "c#",
        ".net",
        "postgres",
        "postgresql",
        "mysql",
        "mongodb",
        "redis",
        "prisma",
        "sql",
        "graphql",
        "rest",
        "api",
    ],
    DevOps: [
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "ci/cd",
        "ci",
        "cd",
        "github actions",
        "terraform",
        "ansible",
        "linux",
        "nginx",
        "serverless",
        "vercel",
        "cloud",
    ],
    Architecture: [
        "microservices",
        "microservicios",
        "system design",
        "solid",
        "oop",
        "ddd",
        "clean architecture",
        "cqrs",
        "event-driven",
        "arquitectura",
        "patrones de diseño",
        "design patterns",
        "scalability",
        "escalabilidad",
    ],
    Testing: [
        "jest",
        "vitest",
        "cypress",
        "playwright",
        "testing",
        "unit test",
        "integration test",
        "e2e",
        "tdd",
        "qa",
        "junit",
        "mocha",
        "chai",
    ],
};

export function SkillRadarChart({ keywords }: { keywords: string[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) {
        return <div className="h-[260px] w-full bg-muted/10 rounded animate-pulse" />;
    }

    const data = Object.keys(EJE_KEYWORDS).map((eje) => {
        const keys = EJE_KEYWORDS[eje as keyof typeof EJE_KEYWORDS];
        const matches = keywords.filter((kw) => keys.some((k) => kw.toLowerCase().includes(k)));
        const score = Math.min(95, 20 + matches.length * 15);
        return {
            subject: eje,
            A: score,
            fullMark: 100,
        };
    });

    return (
        <div className="h-[260px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid className="stroke-border/30" />
                    <PolarAngleAxis dataKey="subject" stroke="var(--muted-foreground)" fontSize={12} tickSize={10} />
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
    );
}
