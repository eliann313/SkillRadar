export const EJE_KEYWORDS = {
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

export interface RadarAxisInfo {
    subject: string;
    score: number;
    matches: string[];
}

export function getRadarAxisBreakdown(keywords: string[]): RadarAxisInfo[] {
    return Object.keys(EJE_KEYWORDS).map((eje) => {
        const keys = EJE_KEYWORDS[eje as keyof typeof EJE_KEYWORDS];
        const matches = keywords.filter((kw) => keys.some((k) => kw.toLowerCase().includes(k)));
        const score = Math.min(95, 20 + matches.length * 15);
        return {
            subject: eje,
            score,
            matches: Array.from(new Set(matches)),
        };
    });
}
