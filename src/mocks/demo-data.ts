import type { CVAnalysis, JobMatch, TalentCard } from "@/shared-kernel/types";

/**
 * Datos 100% ficticios para la demo pública (/demo) y la landing.
 * No tocan DB, no llaman a IA, no requieren sesión.
 * Los textos se localizan en el cliente vía next-intl (namespace Home);
 * aquí solo van números, keywords y estructura.
 */
export const demoCvNumbers = {
    atsScore: 78,
    technicalScore: 71,
    credibilityScore: 84,
    detectedKeywords: ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "Git"],
    missingKeywords: ["CI/CD", "Docker", "Testing"],
    atsBreakdown: {
        contacto: 11,
        secciones: 18,
        legibilidad: 20,
        keywordsContexto: 18,
        cuantificacion: 11,
    },
    evidenceQuotes: [
        "4 años construyendo SPAs con React + TypeScript",
        "API REST con Node.js y PostgreSQL en producción",
    ],
};

export function buildDemoCvAnalysis(t: (key: string) => string): CVAnalysis {
    return {
        id: "demo-cv",
        userId: "demo",
        atsScore: demoCvNumbers.atsScore,
        technicalScore: demoCvNumbers.technicalScore,
        credibilityScore: demoCvNumbers.credibilityScore,
        technicalExplanation: t("demoCvTech"),
        credibilityExplanation: t("demoCvCred"),
        detectedKeywords: demoCvNumbers.detectedKeywords,
        missingKeywords: demoCvNumbers.missingKeywords,
        estimatedSeniority: "mid",
        suggestions: [t("demoCvSug1"), t("demoCvSug2"), t("demoCvSug3")],
        createdAt: new Date("2026-08-10T12:00:00Z"),
        atsBreakdown: demoCvNumbers.atsBreakdown,
        evidenceQuotes: demoCvNumbers.evidenceQuotes,
        isSimulated: true,
        explainability: {
            justification: t("demoCvJust"),
            evidenceFound: demoCvNumbers.detectedKeywords.slice(0, 3),
            missingEvidence: demoCvNumbers.missingKeywords.slice(0, 3),
        },
    };
}

export function buildDemoJobMatch(t: (key: string) => string): JobMatch {
    return {
        id: "demo-match",
        userId: "demo",
        jobTitle: "Frontend Senior — React/Next.js",
        company: "Demo Corp",
        matchScore: 76,
        alignedSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Git"],
        missingSkills: ["CI/CD", "Testing", "Docker"],
        createdAt: new Date("2026-08-12T12:00:00Z"),
        recommendations: [t("demoMatchRec1"), t("demoMatchRec2")],
        explainability: {
            justification: t("demoMatchJust"),
            evidenceFound: ["React", "TypeScript", "Next.js"],
            missingEvidence: ["CI/CD", "Testing", "Docker"],
        },
        actionPlan: [
            {
                skill: "CI/CD",
                steps: ["Lee la doc de GitHub Actions", "Agrega un workflow de test+lint", "Conecta deploy automático"],
            },
            {
                skill: "Testing",
                steps: ["Instala Vitest", "Cubre utils críticos", "Agrega badge de cobertura al README"],
            },
        ],
    };
}

export const demoGithubLanguages: Record<string, number> = {
    TypeScript: 420000,
    JavaScript: 180000,
    CSS: 60000,
    Python: 40000,
    Dockerfile: 8000,
};

export function buildDemoGithubSignals(t: (key: string) => string) {
    return {
        strengths: [t("demoGhS1"), t("demoGhS2"), t("demoGhS3")],
        weaknesses: [t("demoGhW1"), t("demoGhW2")],
        suggestions: [t("demoGhSug1"), t("demoGhSug2")],
    };
}

/**
 * Talent Pool 100% ficticio para el guest recruiter (modo demo / solo lectura).
 * Sin PII real, sin DB, sin verificación: igual que el dev demo.
 * Los IDs anonimizados siguen el formato DEV-XXXX del doble ciego.
 */
export const demoTalentPool: TalentCard[] = [
    {
        id: "demo-talent-1",
        anonymousId: "DEV-9B1C27",
        estimatedSeniority: "senior",
        averageScore: 87,
        topSkills: ["React", "TypeScript", "Next.js", "Node.js"],
        languages: ["TypeScript", "JavaScript"],
        lastActive: new Date("2026-09-28T12:00:00Z"),
        name: null,
        email: null,
        githubUsername: null,
        image: null,
        contactStatus: "none",
        justification: "Perfil senior con 6 años en frontend React. Evidencia sólida en TypeScript y Next.js.",
        isShortlisted: false,
    },
    {
        id: "demo-talent-2",
        anonymousId: "DEV-4F2A91",
        estimatedSeniority: "mid",
        averageScore: 76,
        topSkills: ["Node.js", "PostgreSQL", "Docker", "TypeScript"],
        languages: ["TypeScript", "SQL"],
        lastActive: new Date("2026-09-25T12:00:00Z"),
        name: null,
        email: null,
        githubUsername: null,
        image: null,
        contactStatus: "none",
        justification: "Backend mid con experiencia en APIs REST y PostgreSQL en producción.",
        isShortlisted: false,
    },
    {
        id: "demo-talent-3",
        anonymousId: "DEV-77C0E4",
        estimatedSeniority: "junior",
        averageScore: 64,
        topSkills: ["React", "JavaScript", "Tailwind CSS", "Git"],
        languages: ["JavaScript", "CSS"],
        lastActive: new Date("2026-09-20T12:00:00Z"),
        name: null,
        email: null,
        githubUsername: null,
        image: null,
        contactStatus: "none",
        justification: "Perfil junior con fundamentos sólidos en React y ganas de crecer.",
        isShortlisted: false,
    },
];
