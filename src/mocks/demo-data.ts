import type { CVAnalysis, JobMatch } from "@/lib/types";

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
